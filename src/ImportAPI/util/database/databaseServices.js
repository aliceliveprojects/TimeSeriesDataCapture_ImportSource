'use strict';

var MongoClient = require('mongodb').MongoClient;
var databaseurl = process.env.DATABASE_URL;
var databaseusername = process.env.DATABASE_USERNAME;
var databasepassword = process.env.DATABASE_PASSWORD;
var databaseName = process.env.DATABASE_NAME;

var url = 'mongodb://'+databaseusername+':'+databasepassword+'@'+databaseurl+'/'+databaseName;


var dbo;



function connect() {
    return new Promise((resolve, reject) => {
        if (dbo == null) {
            MongoClient.connect(url, { useNewUrlParser: true }, (error, db) => {
                if (error) reject(error);
                dbo = db.db(databaseName);
                resolve();
            });
        } else {
            resolve();
        }
    });
}


/* =======================================================MONGO DB=========================================== */

exports.mongodbInsert = function mongodbInsert(collection, object) {
    return new Promise((resolve, reject) => {
        connect()
            .then(function (result) {
                dbo.collection(collection).insertOne(object, (error, result) => {
                    if (error) reject(error);

                    resolve("object inserted");
                });
            })
    });
}



exports.mongodbUpdate = function mongodbUpdate(collection, query, updatedObject) {
    

    return new Promise((resolve, reject) => {
        connect()
            .then(function (result) {
                dbo.collection(collection).updateOne(query, updatedObject, (error, result) => {
                    if (error) reject(error);
                    resolve('object updated');
                });
            })
    });
}



exports.mongodbQuery = function mongodbQuery(collection, query, select) {
    return new Promise((resolve, reject) => {
        connect()
            .then(function (result) {

                if(select != undefined){
                    var selectObject = parseSelect(select);
                }

                dbo.collection(collection).find(query).project(selectObject).toArray((error, result) => {
                    if (error) reject(error);
                    resolve(result);
                });
            })
    });

}

exports.mongodbFindAll = function mongodbFindAll(collection,select) {
    return new Promise((resolve, reject) => {
        connect()
            .then(result => {
                if(select != undefined){
                    var selectObject = parseSelect(select);
                }
                

                dbo.collection(collection).find({}).project(selectObject).toArray((error, result) => {
                    if(error){
                        console.log(error);
                        reject(error);
                    }
                    resolve(result);
                })
            })
    })
}

exports.mongodbDelete = function mongodbDelete(collection, object) {
    return new Promise((resolve, reject) => {
        connect()
            .then(function (result) {
                dbo.collection(collection).deleteOne(object, (error, result) => {
                    if (error) reject(error);
                    resolve('object deleted');
                })
            })
    });
}

exports.mongodbRemove = function mongodbRemove(collection,object){
    return new Promise((resolve, reject) => {
        connect()
            .then(function (result) {
                dbo.collection(collection).remove(object, (error, result) => {
                    if (error) reject(error);
                    resolve('object deleted');
                })
            })
    });
}


function parseSelect(selectArray){
    var selectObject = {};
    for(var i=0,n=selectArray.length;i<n;i++){
        selectObject[selectArray[i]] = true;
    }

    return selectObject;
}

/* exports.mongodbFind = function mongodbFind(collection, query, filter){
    return new Promise((resolve,reject) => {
        connect()
            .then(result => {
                dbo.collection(collection).find(query).toArray((error,result) => {
                    if(error) reject(error);
                    
                    resolve(result);
                })
            })
    })
} */

/* ========================================================================================================= */















