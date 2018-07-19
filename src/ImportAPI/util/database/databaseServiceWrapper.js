'use strict'

var service = require('./databaseService');

/* =======================================================RUN QUERIES=========================================== */
exports.insertRun = function insertRun(run) {
    return new Promise(function (resolve, reject) {
        service.mongodbInsert('runs', run)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });

}

exports.updateRuns = function updateRuns(query, updatedRun) {
    return new Promise(function (resolve, reject) {
        service.mongodbUpdate('runs', query, updatedRun)
            .then(function (result) {
                resolve(result);
            }).catch(function (error) {
                resolve(error);
            });
    });

}

exports.deleteRun = function deleteRun(run) {
    return new Promise(function (resolve, reject) {
        service.mongodbDelete('runs', run)
            .then(function (result) {
                resolve(result);
            }).catch(function (error) {
                reject(error);
            })
    });


}

exports.queryRun = function queryRun(query) {
    return new Promise(function (resolve, reject) {
        service.mongodbQuery('runs', query)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            })
    });

}
/* =================================================================================================================== */

/* =======================================================ALGORITHM QUERIES=========================================== */

exports.insertAlgorithm = function insertAlgorithm(algorithm) {
    return new Promise(function (resolve, reject) {
        service.mongodbInsert('algorithms', algorithm)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });

}


exports.deleteAlgorithm = function deleteAlgorithm(algorithm) {
    return new Promise(function (resolve, reject) {
        service.mongodbDelete('algorithms', algorithm)
            .then(function (result) {
                resolve(result);
            }).catch(function (error) {
                reject(error);
            })
    });
}

exports.queryAlgorithm = function queryAlgorithm(query) {
    return new Promise(function (resolve, reject) {
        service.mongodbQuery('algorithms', query)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            })
    })
}

/* ========================================================================================================= */