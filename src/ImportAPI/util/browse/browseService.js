'use strict';

const errorApi = require('../error/error');

var auth_token = '1a67f6f4-db2a-4298-8cf8-72946ac50669';


// TODO: query database
exports.componentSearch = async function(search,page,pagesize){

    return {
        search : search,
        page: page,
        pagesize: pagesize
    }
}

// TODO: delete from database
exports.deleteComponent = async function(componentID){
    return {
        componentID: componentID
    }
}

// TODO: get auth token from database
exports.getAuthentication = async function(){
    throw(errorApi.create400Error("error test"));
}

//TODO: download component from database
exports.getComponent = async function(componentID){
    return {
        componentID: componentID
    }
}

//TODO: connect to import API to get component difference
exports.getComponentIDs = async function(){
    return {
        good : 'ok'
    }
}

//TODO store file storage token
exports.postAuthenticate = async function(fileStorageToken){
    return {
        fileStorageToken: fileStorageToken
    }
}

//TODO request components from import api
exports.postComponentIDs = async function(componentIDs){
    return {
        componentIDs: componentIDs
    }

}

//TODO update component from database
exports.updateComponent = async function(componentID,component){
    return {
        componentID: componentID,
        component: component
    }
}
    
