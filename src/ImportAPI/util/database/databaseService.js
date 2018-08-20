'use strict';

var MongoClient = require('mongodb').MongoClient;
var url = process.env.DATABASE_URL;
var username = process.env.DATABASE_USERNAME;
var password = prcoess.env.DATABASE_PASSWORD;
var databaseName = prcoess.env.DATABASE_NAME;

mongodb://<dbuser>:<dbpassword>@ds225442.mlab.com:25442/heroku_z6lwh5bd
var url = 'mongodb://'+username+':'+password+'@'+url+'/'+databaseName;

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



exports.mongodbQuery = function mongodbQuery(collection, query, filter, columns) {
    return new Promise((resolve, reject) => {
        connect()
            .then(function (result) {

                var filterObject = {};
                if (filter != undefined) {
                    filterObject = parseFilter(filter);
                }
                var columnObject = {};
                if (columns != undefined) {
                    columnObject = parseColumns(columns);
                }

                dbo.collection(collection).find(query, columnObject).project(filterObject).toArray((error, result) => {
                    if (error) reject(error);

                    resolve(result);
                });
            })
    });

}

exports.mongodbFindAll = function mongodbFindAll(collection, filter, columns) {
    return new Promise((resolve, reject) => {
        connect()
            .then(result => {
                var filterObject = {};
                if (filter != undefined) {
                    filterObject = parseFilter(filter);
                }
                var columnObject = {};
                if (columns != undefined) {
                    columnObject = parseColumns(columns);
                }

                dbo.collection(collection).find({},columnObject).project(filterObject).toArray((error, result) => {
                    if (error) reject(error);
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

function parseFilter(filterArray) {

    var filterObject = {};

    for (var i = 0, n = filter.length; i < n; i++) {
        filterObject[filter[i]] = 1;
    }

    return filterObject;
}

function parseColumns(columnArray) {
    var columnObject = {};
    for (var i = 0, n = columns.length; i < n; i++) {
        columnObject[columns[i]] = 1;
    }
    return columnObject;
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















