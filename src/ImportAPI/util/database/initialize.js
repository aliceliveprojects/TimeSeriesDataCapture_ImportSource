var MongoClient = require('mongodb').MongoClient;


var url = "mongodb://localhost:27017/timeSeriesDatabase";
var collection = 'runs';

MongoClient.connect(url,{ useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    console.log("Database created @" + url);
    db.close();
})

MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("timeSeriesDatabase");
    dbo.createCollection(collection, function(err, res) {
      if (err) throw err;
      console.log(collection + 'collection created');
      db.close();
    });
  });