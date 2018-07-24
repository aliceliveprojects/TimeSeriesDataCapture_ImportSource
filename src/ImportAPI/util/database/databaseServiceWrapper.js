'use strict'

var service = require('./databaseService');

var runobject = {
    _id: 101,
    name: 'satima',
    age: 33
}

/* =======================================================RUN QUERIES================================================ */
exports.insertRun = async function insertRun(run) {
    try {
       
        return (await service.mongodbInsert('runsCollection', run));
    } catch (error) {
        throw (error)
    }
}

exports.updateRuns = async function updateRuns(query, updatedRun) {
    var updatedRunObject = {
        $set : updatedRun
    }
    try {
        return (awaitservice.mongodbUpdate('runsCollection', query, updatedRunObject));
    } catch (error) {
        throw (error);
    }
}

exports.deleteRun = async function deleteRun(run) {
    try {
        return (await service.mongodbDelete('runsCollection', run));
    } catch (error) {
        throw (error);
    }
}

exports.queryRun = async function queryRun(query, filter) {
    try {
        return (await service.mongodbQuery('runsCollection', query));
    } catch (error) {
        throw (error);
    }
}
/* =================================================================================================================== */

/* ====================================================AUTHENTICATE QUERIES=========================================== */
exports.getAuthentication = async function getAuthentication(profileID, filter) {
    var query = { profileID: profileID };
    try {
        return (await service.mongodbQuery('authenticationCollection', query, filter))
    } catch (error) {
        throw (error);
    }
}

exports.setAuthentication = async function setAuthentication(authentication) {
    var authenticationObject = {
        $set: authentication
    }
    try {
        return (await service.mongodbUpdate('authenticationCollection', authentication[profileID], authenticationObject));
    } catch (error) {

    }
}
/* =================================================================================================================== */

/* ====================================================TAG QUERIES==================================================== */
exports.getTag = async function getTag(tag, filter) {
    var query = {
    };

    if (typeof tag == 'number') {
        query['_id'] = tag;
    } else {
        query['text'] = {
            $regex: '^' + tag,
            $options: 'i'
        }
    }

    try {
        return (await service.mongodbQuery('tagsCollection', query, filter));
    } catch (error) {
        throw (error);
    }
}

exports.addTag = async function addTag(tag) {
    try {
        if (getTag(tag) > 0) {
            var tagObject = {
                text: tag
            }
            return (await service.mongodbInsert('tagsCollection', tagObject))
        }
    } catch (error) {
        throw (error);
    }
}


/* =======================================================ALGORITHM QUERIES=========================================== */

exports.insertAlgorithm = async function insertAlgorithm(algorithm) {
    try {
        return (await service.mongodbInsert('algorithmsCollection',algorithm));
    } catch (error) {
        throw(error);
    }
}

exports.getAllAlgorithms = async function getAllAlgorithms(){
    try{
        return (await service.mongodbFindAll('algorithmsCollection'));
    }catch(error){
        throw(error);
    }
}

exports.getAlgorithm = async function getAlgorithm(id) {
    var query = {
        _id : id
    }
    try {
        return (await service.mongodbQuery('algorithmsCollection',query));
    } catch (error) {
        throw(error);
    }
}

/* ========================================================================================================= */