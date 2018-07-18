'use strict';

const errorApi = require('../error/error');
var oneDriveService = require('../oneDrive/oneDriveService')


exports.getComponent = async function(componentID){
    
}

exports.getComponentIDs = async function(folderID){
    
    
    try {
        let result = await oneDriveService.getComponentIDs(folderID);
        return(result);
    } catch (error) {
        error = JSON.parse(error)
        console.log(error);
        throw(errorApi.createError(error.statusCode,error.error.code));
    }
    
    
       
    
}

exports.getOperations = async function(){
    return {
        good: 'ok'
    }
}
    
