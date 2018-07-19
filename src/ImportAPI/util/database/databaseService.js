'use strict';

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/timeSeriesDatabase";


var dbo;



function connect() {
    return new Promise(function (resolve, reject) {
        if (dbo == null) {
            MongoClient.connect(url, { useNewUrlParser: true }, function (error, db) {
                if (error) reject(error);
                dbo = db.db("mydb");

                resolve();
            });
        } else {
            resolve();
        }

    });
}

function connectTest() {

    MongoClient.connect(url, { useNewUrlParser: true }, (error,db) => {
        if (error) throw ('error');
        dbo = db.db("mydb");
        //console.log('connect success');
        return('connect success')
        
    });

    return('return sucess');
}

async function test() {

    try {
        var result = await connectTest();
        console.log('success',result);

    } catch (error) {
        console.log('error',error);
    }

}

test();

/* =======================================================MONGO DB=========================================== */

exports.mongodbInsert = function mongodbInsert(collection, object) {
    return new Promise(function (resolve, reject) {
        connect()
            .then(function (result) {
                dbo.collection(collection).insertOne(object, function (error, result) {
                    if (error) reject(error);
                    resolve("object inserted");
                });
            })
    });
}

exports.mongodbUpdate = function mongodbUpdate(collection, query, updatedObject) {
    return new Promise(function (resolve, reject) {
        connect()
            .then(function (result) {
                dbo.collection(collection).updateOne(query, updatedObject, function (error, result) {
                    if (error) reject(error);
                    resolve('object updated');
                });
            })
    });
}

exports.mongodbQuery = function mongodbQuery(collection, query) {
    return new Promise(function (resolve, reject) {
        connect()
            .then(function (result) {
                dbo.collection(collection).find(query).toArray(function (error, result) {
                    if (error) reject(error);

                    resolve(result);
                });
            })
    });

}

exports.mongodbDelete = function mongodbDelete(collection, object) {
    return new Promise(function (resolve, reject) {
        connect()
            .then(function (result) {
                dbo.collection(collection).deleteOne(object, function (error, result) {
                    if (error) reject(error);
                    resolve('object deleted');
                })
            })
    });
}

/* ========================================================================================================= */















