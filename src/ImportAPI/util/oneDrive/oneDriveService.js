'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
const databaseService = require('../database/database');

function parseComponentIds(data) {
    var result = {
        folders: []
    }

    data.value.forEach(folder => {

        if (folder.hasOwnProperty('folder')) {
            result.folders.push({
                id: folder.id,
                name: folder.name
            })
        }

    });

    return result;
}


exports.getComponentIDs = async function (folderID) {
    var select = encodeURI('select=id,name,folder');
    var path = '/v1.0/me/drive/root/children?' + select;
    var fileStorageToken = (await databaseService.getFileStorageAuthentication())

    if(fileStorageToken.length < 1){
        throw({
            "stack": null,
            "message": "Authorization failed: Un-authorized",
            "statusCode": 401
        })
    }

    fileStorageToken = fileStorageToken[0].storageToken;

    if (folderID !== undefined) {
        path = '/v1.0/me/drive/items/' + encodeURI(folderID) + '/children?' + select;
    }

    var options = {
        protocol: 'https:',
        host: 'graph.microsoft.com',
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + fileStorageToken
        },
        timeout: 4000
    };

    try {
        var response = await httpRequest.httpRequest(options);
        response = JSON.parse(response);
        response = parseComponentIds(response);
        return response;
    } catch (error) {

        
        console.log('getComponentsIDs connect reject');
        throw(error);
    }
}


//example 2B497C4DAFF48A9C!105
exports.downloadComponent = async function (componentID) {
    var fileStorageToken = (await databaseService.getFileStorageAuthentication())

    if(fileStorageToken.length < 1){
        throw({
            "stack": null,
            "message": "Authorization failed: Un-authorized",
            "statusCode": 401
        })
    }

    fileStorageToken = fileStorageToken[0].storageToken;

    var options = {
        protocol: 'https:',
        host: 'graph.microsoft.com',
        path: '/v1.0/me/drive/items/' + encodeURI(componentID),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + fileStorageToken
        },
        timeout: 4000
    };

    try {
        var response = await httpRequest.httpRequest(options);
        response = JSON.parse(response);
        console.log('RESPONSE LINE 100',response);
        var url = new url.parse(response['@microsoft.graph.downloadUrl']);

        var options = {
            protocol: 'https:',
            host: url.hostname,
            path: url.pathname,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer ' +fileStorageToken
            }
        };

        response = await httpRequest.httpRequest(options);
        console.log('download Component connect success');
        return(response);
    } catch (error) {
        /* error = parseResponse(error);
        throw (parseError(error)); */
        console.log(error);
        console.log('download Component connect reject');
        throw(error);
    }
}




exports.getComponent = async function (componentID) {
    var fileStorageToken = (await databaseService.getFileStorageAuthentication())

    if(fileStorageToken.length < 1){
        throw({
            "stack": null,
            "message": "Authorization failed: Un-authorized",
            "statusCode": 401
        })
    }

    fileStorageToken = fileStorageToken[0].storageToken;

    var options = {
        protocol: 'https:',
        host: 'graph.microsoft.com',
        path: '/v1.0/me/drive/items/' + encodeURI(componentID) + '?expand=children(select=id,name)',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + fileStorageToken
        },
        timeout: 4000
    };

    try {
        var response = await httpRequest.httpRequest(options);
        response = JSON.parse(response);
        return(response);
    } catch (error) {
        console.log(error);
        console.log('Get Component connect reject');
        throw(error);
    }
}



