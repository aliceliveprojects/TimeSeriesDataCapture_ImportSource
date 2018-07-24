'use strict';

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/timeSeriesDatabase";


var dbo;



function connect() {
    return new Promise((resolve, reject) => {
        if (dbo == null) {
            MongoClient.connect(url, { useNewUrlParser: true }, (error, db) => {
                if (error) reject(error);
                dbo = db.db("mydb");
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
                dbo.collection(collection).insertOne(object,(error, result) => {
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
                dbo.collection(collection).updateOne(query, updatedObject,(error, result) => {
                    if (error) reject(error);
                    resolve('object updated');
                });
            })
    });
}



exports.mongodbQuery = function mongodbQuery(collection, query, filter) {
    var filterObject = {};
    if(filter != null){
        for (var i = 0, n = filter.length; i++; i < n) {
            filterObject[filter[i]] = 1;
        }
    }
  

    return new Promise((resolve, reject) => {
        connect()
            .then(function (result) {
                dbo.collection(collection).find(query).project(filterObject).toArray((error, result) => {
                    if (error) reject(error);

                    resolve(result);
                });
            })
    });

}

exports.mongodbDelete = function mongodbDelete(collection, object) {
    return new Promise((resolve, reject) => {
        connect()
            .then(function (result) {
                dbo.collection(collection).deleteOne(object,(error, result) => {
                    if (error) reject(error);
                    resolve('object deleted');
                })
            })
    });
}

exports.mongodbFindAll = function mongodbFindAll(collection){
    return new Promise((resolve,reject) => {
        connect()
            .then(result => {
                dbo.collection(collection).find({}).toArray((error,result) => {
                    if(error) reject(error);
                    resolve();
                })
            })
    })
}

/* ========================================================================================================= */















