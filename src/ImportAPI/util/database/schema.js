var MongoClient = require('mongodb').MongoClient;
const database = require('./databaseService');

var url = "mongodb://localhost:27017/timeSeriesDatabase";


var collections = ['runsCollection', 'algorithmsCollection', 'authenticationCollection','tagsCollection']

//create database
function createDatabase() {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    console.log("Database created @" + url);
    db.close();
  })
}

//create collections
async function createCollections() {
  MongoClient.connect(url, { useNewUrlParser: true }, async function (err, db) {
    if (err) throw err;
    var dbo = db.db("timeSeriesDatabase");
    

    const collectionPromises = collections.map(createCollection,{dbo : dbo});
    await Promise.all(collectionPromises);
    //db.close();
  });
}

function createCollection(collectionName) {
  this.dbo.createCollection(collectionName, function (err, res) {
    if (err) throw err;
    console.log(collectionName + ' collection created');
    return;
  });
}




