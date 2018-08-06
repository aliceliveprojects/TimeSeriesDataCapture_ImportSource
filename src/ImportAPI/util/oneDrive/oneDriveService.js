'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBYA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAZhtsIoO77A9P9MkK24S/p7Xc4Ng2H41jt1SiSAxNw+1opD6+18yEvd/6gvC9kLkv4twdY5M3TiaRkABv9yTqjQtbrY9zhwPcmpyB/zBnMMq/TVtwWdgLQDIgeozkOxzrFgJF6g9B1sBimXRthqkfNQn+rHoWm1k3Kf0AvueypXGjxQC+3xU6cD1A6qqdZf4CPbX5de8hBThrAjHRoq67ab1GLpOSLaf/lR7Bx2HP6vB6DEvEUpsxr0HO1Uj4sIQGgETLiOnTdWpM5fiWB0MNAVrgeI0DVThq+6EDNzL5YiBps0kHvRYOAls2aqNL59OOYDImb8662k/m6ce1KGv9XQDZgAACCOc7J/p9MYAKAJ2S5PtxIVC8PGZG0fJkkpmSKV+rWVxdnb2LQ8CYIRI2axHWI86/Q+rKEDg2ZwoGELC4A98T62iII1Ta1ZZXOuAuWRhKrCFmO9Xndc8dlMXfASaOpX8V12M1lOgY/mJChQTRZxRPQM4TLqW53yjLUbwr0I4oX3y2oxnakXP0O6myPRomFhoN/g+KBHlOy8JaydhpLiq4T1eu2Aa/2ouiX8T7FijD5JVbIef9B684/SEH4/eREUqvfAyNH00bNtgjDh8JeUyJ5EeGxYnohR2S+yQnBFBqoKUcPshvirfy9Kebm0UY1XY+si7uQLvllziydASRBNZWNRNvNkK78Pw/GPALh40/w83fFg3suHOVQcQm5b8Ts+1MadUsCw0OFsZFc7xZ0AzBfS9eXv8nYwEwOR7Ug8Rqy6WDjZmjB1l+h3zMmVe/YDaguX9lq6SHzuSg/jtOJO/4Oh40gxbHwo+TCsMSIWjnu59d7E55IVl0tk6Ldlds6txdMLIJh44EDfkiYryK9KwIQeqkEwpc4mV5ZQstImsUaXYdKJt2GNXJAfFzH3pt/n+lYsV7QBhHBm7lcJHc1pDyku8R3Lsfb8uZAwJNBdaS/mf6yLwtBnlxmv9svwEsmPwn7gshR5F+z69mP1HEBmzBqZ6bC5SpN0LrIKc8XYqLMfPtdCZZiUVBPxaBK7dANo4WWeFRUoUac/+CsUdzNla3WbFh+m8vKYUUC2x2S+UiEFC25RmAg==';
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

function parseResponse(result) {
    result = JSON.parse(result);

    var response = null;
    var responseCode = null;

    if (result.hasOwnProperty('result')) {
        response = result.result;
    }

    if (result.hasOwnProperty('statusCode')) {
        responseCode = result.statusCode;
    }

    return [responseCode, response];
}


function parseError(error) {
    var errorResponse = 'Error';
    var errorCode = 500;

    if (error != null)
        errorCode = error[0]

    if (error[1] != null) {
        try {
            errorResponse = JSON.parse(error[1]);
            errorResponse = errorResponse.error.code;
        } catch (error) {
            errorResponse = error[1];
        }
       
    }

    throw(error);

}


exports.getComponentIDs = async function (folderID) {
    var select = encodeURI('select=id,name,folder');
    var path = '/v1.0/me/drive/root/children?' + select;

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
            'Authorization': 'bearer ' + oneDriveToken
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
    var options = {
        protocol: 'https:',
        host: 'graph.microsoft.com',
        path: '/v1.0/me/drive/items/' + encodeURI(componentID),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + oneDriveToken
        },
        timeout: 4000
    };

    try {
        var response = await httpRequest.httpRequest(options);
        response = JSON.parse(response);
        var url = new URL(response['@microsoft.graph.downloadUrl']);

        var options = {
            protocol: 'https:',
            host: url.hostname,
            path: url.pathname,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer ' + oneDriveToken
            }
        };

        response = await httpRequest.httpRequest(options);
        console.log('download Component connect success');
        return(response);
    } catch (error) {
        /* error = parseResponse(error);
        throw (parseError(error)); */
        console.log('download Component connect reject');
        throw(error);
    }
}




exports.getComponent = async function (componentID) {
    var options = {
        protocol: 'https:',
        host: 'graph.microsoft.com',
        path: '/v1.0/me/drive/items/' + encodeURI(componentID) + '?expand=children(select=id,name)',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + oneDriveToken
        },
        timeout: 4000
    };

    try {
        var response = await httpRequest.httpRequest(options);
        response = JSON.parse(response);
        return(response);
    } catch (error) {
      
        console.log('Get Component connect reject');
        throw(error);
    }
}



