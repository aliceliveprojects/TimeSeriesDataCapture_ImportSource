var MongoClient = require('mongodb').MongoClient;


var url = "mongodb://localhost:27017/timeSeriesDatabase";
var collection = 'runs';

//create database
MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
  if (err) throw err;
  console.log("Database created @" + url);
  console.log(db.db);
  db.close();
})

//create run collection
MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
  if (err) throw err;
  var dbo = db.db("timeSeriesDatabase");
  console.log(dbo);
  dbo.createCollection('runs', function (err, res) {
    if (err) throw err;
    console.log('runs' + ' collection created');
    db.close();
  });
});


//create algorithms collections
MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
  if (err) throw err;
  var dbo = db.db("timeSeriesDatabase");
  dbo.createCollection('algorithms', function (err, res) {
    if (err) throw err;
    console.log('algorithms' + ' collection created');
    db.close();
  });
});