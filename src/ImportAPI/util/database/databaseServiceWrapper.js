'use strict'

var service = require('./databaseService');

var runobject = {
    _id: 101,
    name: 'satima',
    age: 33
}

/* =======================================================RUN QUERIES=========================================== */
exports.insertRun = async function insertRun(run) {
    try {
        return (await service.mongodbInsert('runs', run));
    } catch (error) {
        throw (error)
    }
}

exports.updateRuns = async function updateRuns(query, updatedRun) {
    try {
        return (awaitservice.mongodbUpdate('runs', query, updatedRun));
    } catch (error) {
        throw (error);
    }
}

exports.deleteRun = async function deleteRun(run) {
    try {
        return (await service.mongodbDelete('runs', run));
    } catch (error) {
        throw (error);
    }
}

exports.queryRun = async function queryRun(query) {
    try {
        return (await service.mongodbQuery('runs', query));
    } catch (error) {
        throw (error);
    }
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