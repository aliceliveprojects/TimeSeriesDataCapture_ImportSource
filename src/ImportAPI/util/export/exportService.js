'use strict';

const uuidv4 = require('uuid/v4');
const errorApi = require('../error/error');
const fs = require('fs-extra');
const { Pool } = require('pg')
const copyTo = require('pg-copy-streams').to;
const copyFrom = require('pg-copy-streams').from;

const Minizip = require('minizip-asm.js'); //locker/unlocker

let config = {
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.DB_NEEDS_SSL === "true")
};
var pool = new Pool(config)


const snapshotDirectory = "./snapshots";
const reservedDirectory = "/reserved";
const exportedDirectory = "/exported";
const importedDirectory = "/imported";
if (!fs.existsSync(snapshotDirectory)){
  fs.mkdirSync(snapshotDirectory);
}
if (!fs.existsSync(snapshotDirectory+reservedDirectory)){
  fs.mkdirSync(snapshotDirectory+reservedDirectory);
}
if (!fs.existsSync(snapshotDirectory+exportedDirectory)){
  fs.mkdirSync(snapshotDirectory+exportedDirectory);
}
if (!fs.existsSync(snapshotDirectory+importedDirectory)){
  fs.mkdirSync(snapshotDirectory+importedDirectory);
}
const extension = ".csv"


const STATUS = {
  RESERVED: "RESERVED",
  PROGRESSING: "PROGRESSING",
  EXPORTED: "EXPORTED"
}
const zipExtension = ".7z"

exports.reserveExport = function(secret) {
  let isValidSecret = checkSecretValidity(secret)

  if(!isValidSecret){
    throw(errorApi.create400Error("invalid secret"));
  }else{
    let exportRequestId = uuidv4();
    //create file and save secret etc..
    let exportRequestDir = snapshotDirectory + reservedDirectory +"/"+ exportRequestId;
    fs.mkdirSync(exportRequestDir);
    
    let cfg = { 
      id: exportRequestId,
      secret: secret,
      status: STATUS.RESERVED,
      created: (new Date()).getTime(),
      logs: []
    };
    //write config to json file
    fs.appendFile(exportRequestDir+'/config.json', JSON.stringify(cfg, null, 2), function (err) {
      if (err) {
        // append failed
      } else {
        // done
      }
    })

    return {
      exportRequestId: exportRequestId
    }
  }
}

exports.requestExport = async function(exportRequestId) {
  /* find uuid. find folder of that uuid. get secret. kick off export with specified secret and uuid.
  * save exported files to the uuid directory, then zip with secret.
  */
  let config = await getExportConfig(exportRequestId)

  if(config === undefined){
    throw(errorApi.createError(404,"failed to find reserved export with that id."));
  } else {
    if(config.status != STATUS.RESERVED){
      throw(errorApi.create400Error("Export request already attempted on this id."));
    } else{
      //perfect request - start export
      exportSnapshot(exportRequestId);

      return {
        message: "Exportation process has begun. Check the progress using exportProgress interface.",
        exportRequestId: exportRequestId
      }
    }
  }
}

exports.getExportProgress = async function(exportRequestId) {
  /**
   * return either the progress and fileId if available of the export.
   */
  let config = await getExportConfig(exportRequestId)

  if(config === undefined){
    throw(errorApi.createError(404,"failed to find reserved export with that id."));
  } else {
    if(config.status == STATUS.RESERVED){
      throw(errorApi.create400Error("Export not yet requested."));
    } else{
      //perfect request - start export
      let progressObj = {};
      if(config.status){
        progressObj.status = config.status
      }
      
      if(config.progress){
        progressObj.progress = config.progress
      }
      
      if(config.status == STATUS.EXPORTED){
        progressObj.fileId = config.fileId;
      }

      return progressObj
    }
  }
}

exports.getExport = async function(fileId, res){
  let file = fileId+zipExtension;
  let filePath = snapshotDirectory+exportedDirectory+"/"+fileId+"/";
  let lockedFile = "locked"+zipExtension
  
  if (!fs.existsSync(filePath)) {
    throw(errorApi.createError(404,"failed to find reserved export with that id."));
  }else{
    
    res.writeHead(200, {
      "Content-Type": "application/octet-stream",
      "Content-Description": "File Transer",
      "Content-Disposition": "attachment; filename="+file,
      "Access-Control-Expose-Headers":"Content-Type,Content-Description,Content-Disposition"
    });
    
    var filestream =  fs.createReadStream(filePath + lockedFile);
    filestream.pipe(res);
  }
}

exports.deleteExport = async function(fileId, exportRequestId){
  if((!fileId)&&(!exportRequestId)){
    throw(errorApi.create400Error("Must provide either a fileID OR an exportRequestId."));
  } else if((fileId)&&(exportRequestId)){
    throw(errorApi.create400Error("Must provide either a fileID OR an exportRequestId. Not Both."));
  } else {
    let messageObj = {
      messages: []
    }
    if(fileId){
      let fileDir = snapshotDirectory+exportedDirectory+"/"+fileId;
      if(fs.existsSync(fileDir)){
        fs.remove(fileDir);
        messageObj.messages.push('successfully deleted export with fileId: '+fileId);
      } else {
        throw(errorApi.createError(404,"failed to find export with fileId: "+fileId));
      }
    }
    if(exportRequestId){  
      let fileDir = snapshotDirectory+reservedDirectory+"/"+exportRequestId
      if(fs.existsSync(fileDir)){
        fs.remove(fileDir);
        messageObj.messages.push('successfully deleted reserved snapshot with exportRequestId: '+exportRequestId);
      } else {
        throw(errorApi.createError(404,"failed to find reserved export with exportRequestId: "+exportRequestId));
      }
    }
    return messageObj
  }
}

exports.postImport = async function(snapshotZip, snapshotSecret){
  /**
   * 1. get a handle on the file data etc
   * 2. decrpyt/unlock the zip
   * 3. unzip the snapshot
   * 4. 
   */
  var importId = uuidv4();

  let importName = (snapshotZip.filename.split("."))[0];
  let importExtension = snapshotZip.filename.replace(importName,'');

  var data = snapshotZip.data;
  var secret = snapshotSecret;

  var importPath = snapshotDirectory+importedDirectory+"/"+importId;
  try{
    fs.mkdirSync(importPath);
  } catch (err){
    
  }

  await unlockAndDecompress(data, secret, importPath)
  .catch((err)=>{
    console.log(err)
    // throw(errorApi.create400Error("incorrect password"));
  });

  await copyFilesToTables(importPath);

}


function checkSecretValidity(secret){
  return (secret.length>3)&&(!secret.includes(" "));
}

function getExportConfig(exportRequestId){
  let filePath = snapshotDirectory + reservedDirectory +"/"+exportRequestId+"/config.json";

  return new Promise(function (resolve,reject){
    fs.readFile(filePath, 'utf8', function(error, content){
      if(error){
        let error = {statusCode: 403, message: "failed to find reserved export with the given id."}
        reject(error);
      } else {
        let configObj = undefined;
        if(content){
          configObj = JSON.parse(content);
          //console.log(configObj);
        }
        resolve(configObj);
      }
    });
  });
}

async function exportSnapshot(exportRequestId){
  /**
   * 1. Get a list of the tables from databse >
   * 2. Get DB Schema >
   * 2. Extract all tables >
   * 3. store a Mapping of all course_id's with a new uuid
   * 4. find and replace all course_id's with new uuid across all extracted files.
   * 5. zip and lock with secret
   * 6. done.
   */
  
  await updateSnapshotConfig(exportRequestId, 'status', STATUS.PROGRESSING, "Export process begun");
   
  
  let filePath = snapshotDirectory + reservedDirectory +"/"+exportRequestId+"/export/";
  if (fs.existsSync(filePath)) {
    fs.readdirSync(filePath).forEach(function(file, index){
      var currentFile = filePath + "/" + file;
      if (fs.lstatSync(currentFile).isDirectory()) { // recurse
        deleteFolderRecursive(currentFile);
      } else { // delete file
        fs.unlinkSync(currentFile);
      }
    });
    fs.rmdirSync(filePath);
  }
  await updateSnapshotConfig(exportRequestId, undefined, undefined, "Export directory created");
  
  fs.mkdirSync(filePath)
  await copyFile("./schema/schema.sql", filePath+"/schema.sql")
  
  await updateSnapshotConfig(exportRequestId, undefined, undefined, "DB:Schema copied.");
  
  let tableNames = await getAllTableNames();
  
  for(let i=0; i<tableNames.length; i++) {
    //console.log((i+1)+" out of "+tableNames.length)
    
    let tableName = tableNames[i];
    let fileStream = fs.createWriteStream(filePath + tableName + extension);
    await copyTableToFile(tableName, fileStream);
  }
  
  await updateSnapshotConfig(exportRequestId, undefined, undefined, "All table data copied.");
  await updateSnapshotConfig(exportRequestId, undefined, undefined, "Beginning Anonymisation.");
  
  let courseIds = await getAllCourseIds();
  
  await updateSnapshotConfig(exportRequestId, "progress", "0%", undefined);
  for(let i=0; i<courseIds.length; i++){
    let courseId = courseIds[i].id;
    let anonId = uuidv4();
    for(let j=0; j<tableNames.length; j++){
      
      let tableCsv = filePath+tableNames[j]+extension;
      await findAndReplaceInFile(courseId, anonId, tableCsv);
      
    }
    await updateSnapshotConfig(exportRequestId, "progress", ((i+1)/courseIds.length * 50)+"%", "Anonymisation progress = "+ (i+1)+"/"+courseIds.length);
  }
  await updateSnapshotConfig(exportRequestId, undefined, undefined, "Anonymisation Complete. Zipping...");
 
  let fileId = await compressAndLock(exportRequestId)
  await updateSnapshotConfig(exportRequestId, "fileId", fileId, undefined);
  
  await updateSnapshotConfig(exportRequestId, "status", STATUS.EXPORTED, "Fin");//required
}

async function copyFile(source, target) {
  var cbCalled = false;
  return new Promise((resolve, reject)=>{
    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
      done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
      done(err);
    });
    wr.on("close", function(ex) {
      done();
    });
    rd.pipe(wr);
  
    function done(err) {
      if (!cbCalled) {
        cbCalled = true;
        if(err){
          reject(err)
        } else {
          resolve()
        }
      }
    }
  })
}

async function updateSnapshotConfig(exportRequestId, property, value, logMessage){
  let config = await getExportConfig(exportRequestId)
  var changelog = ""
  if(property && value){
    if (typeof property === 'string' || property instanceof String){
      config[property] = value;
      var changelog = " - ["+property+" CHANGED TO: "+value+"]"
    }
  }
  if(logMessage){
    config.logs.push(new Date() +" : "+logMessage+changelog);
  } else {
    config.logs.push(new Date() +" : "+changelog);
  }
  
  return new Promise((resolve, reject)=>{
    let exportRequestDir = snapshotDirectory + reservedDirectory +"/"+ exportRequestId;
    fs.writeFile(exportRequestDir+'/config.json', JSON.stringify(config, null, 2), function (err) {
      if (err) {
        // append failed
        reject(err)
      } else {
        // done
        resolve();
      }
    })
  })
}

async function getAllTableNames() {
  
  return new Promise(async function(resolve, reject){
    const client = await pool.connect();
    await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    .then(res=>{
      let tablesArray = [];
      for(let i = 0; i < res.rows.length; i++){
        tablesArray.push(res.rows[i].table_name)
      }
      client.release();
      resolve(tablesArray)
    })
    .catch(err=>{
      client.release();
      reject(err)
    });
  })

}

async function copyTableToFile(tableName, fileStream) {

  return new Promise(function (resolve, reject){
    //console.log("copying table to file:", tableName, fileStream)
    pool.connect().then(client=>{
      let done = function(){
        client.release()
        resolve()
      }
      let err = function(err){
        console.log(err)
        reject(err)
      }
      var stream = client.query(copyTo('COPY '+tableName+' TO STDOUT'));
      stream.pipe(fileStream);
      stream.on('end', done);
      stream.on('error', err);
    });
  })
  
}

async function copyFilesToTables(directory){

  let files = fs.readdirSync(directory)
  
  for(let file of files){
    console.log("FILE TO DB: Writing ", file, " to Database");
    var tableName = file.split(".")[0];
    if(file.split(".")[1] != "sql"){
      await new Promise(function (resolve, reject){ //push file to table
        pool.connect().then(client=>{
          
          let done = function(){
            console.log("FILE TO DB: ", file, " Written.");
            client.release()
            resolve()
          }
  
          let err = function(err){
            console.log(err)
            reject(err)
          }
          client.query("set session_replication_role = 'replica';")
          var stream = client.query(copyFrom('COPY '+tableName+' FROM STDIN'));
          var fileStream = fs.createReadStream(directory+"/"+file);
          stream.on('error', err);
          stream.on('end', done);
          fileStream.pipe(stream);
        });
      })
    }
  }
}





async function getAllCourseIds(){
  return new Promise((resolve, reject)=>{
    pool.connect().then(client=>{
      let done = function(res){
        client.release()
        resolve(res.rows)
      }
      let err = function(err){
        console.log(err)
        reject(err)
      }
      client.query("SELECT id FROM courses").then(res=>{
        done(res);
      }).catch(err=>{
        err(err);
      });
    });
  });
}

async function findAndReplaceInFile(findingThis, replacingWith, theFile){
  return new Promise((resolve,reject)=>{
    fs.readFile(theFile, 'utf8', function (err,data) {
      if (err) {
        reject(err)
      } else {
        var result = data.replace(findingThis, replacingWith);
      
        fs.writeFile(theFile, result, 'utf8', function (err) {
           if (err){
             reject(err)
           }else {
             resolve();
           }
        });
      }
    });
  })
}

async function compressAndLock(exportRequestId){
  let fileId = uuidv4(); // id where the export will be zipped to.

  const reserveFolderDirectory = snapshotDirectory + reservedDirectory +"/"+ exportRequestId + "/export/";
  const exportFolderDirectory = snapshotDirectory + exportedDirectory +"/"+ fileId;
  const secret = (await getExportConfig(exportRequestId)).secret;

  return new Promise(async(resolve, reject)=>{
    try {
      fs.mkdirSync(exportFolderDirectory);
      var myZip = new Minizip(); 

      //push all files to myZip with password
      await updateSnapshotConfig(exportRequestId, undefined, undefined, "Pushing files to export"); //log
      fs.readdirSync(reserveFolderDirectory).forEach((file, index, files) =>{
        var text = fs.readFileSync(reserveFolderDirectory+file);
        myZip.append("/"+file, text, {password: secret});
        
        //await updateSnapshotConfig(exportRequestId, "progress", Math.floor((((index+1) / files.length)* 50)+50)+"%", "A file was appended to the export."); //log
        // unable to await in this loop, unsure why.
      });
      await updateSnapshotConfig(exportRequestId, "progress", "100%", "All files were appended to the export."); //log


      //save zip
      fs.writeFileSync(exportFolderDirectory+"/locked"+zipExtension, new Buffer(myZip.zip()));
      
      resolve(fileId)
    } catch (err){
      reject(err)
    }
  });
}

async function unlockAndDecompress(data, secret, path) {
  var myImportZip = new Minizip(data);

  let options = {encoding: "utf8"}
  if(secret){
    options.password = secret;
  }
  try{
    myImportZip.list(options).forEach(file =>{
      let zipSubFileData = myImportZip.extract(file.filepath, options);
      //console.log("attempting to write file:", file.filepath, "to:", path);
      fs.writeFileSync(path+"/"+file.filepath, zipSubFileData)
    })
  } catch (error) {
    throw(error)
  }
}