'use strict';

const errorApi = require('../error/error');


exports.getComponent = async function(componentID){
    return {
        componentID:componentID
    }
}

exports.getComponentIDs = async function(folderID){
    return {
        folderID: folderID
    }
}

exports.getOperations = async function(){
    return {
        good: 'ok'
    }
}
    
