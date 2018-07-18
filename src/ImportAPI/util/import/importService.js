'use strict';

const errorApi = require('../error/error');
var oneDriveService = require('../oneDrive/oneDriveService')


exports.getComponent = async function (componentID) {

    try {
        let result = await oneDriveService.getComponent(componentID);
        return (result);
    }catch(error){
        error = JSON.parse(error);
        throw (errorApi.createError(error.statusCode,error.error.code));
    }

}

exports.getComponentIDs = async function (folderID) {


    try {
        let result = await oneDriveService.getComponentIDs(folderID);
        return (result);
    } catch (error) {
        error = JSON.parse(error)
        console.log(error);
        throw (errorApi.createError(error.statusCode, error.error.code));
    }




}

exports.getOperations = async function () {
    
}

