'use strict';

const errorApi = require('../error/error');
var oneDriveService = require('../oneDrive/oneDriveService')


exports.getComponent = async function (componentID) {

      try {
        let result = await oneDriveService.getComponent(componentID);
        return (result);
    }catch(error){
        throw(error);
    }

}

exports.getComponentIDs = async function (folderID) {

    console.log(folderID);
    try {
        let result = await oneDriveService.getComponentIDs(folderID);
        return (result);
    } catch (error) {
        throw(error);
    }




}

exports.getOperations = async function () {
    
}

