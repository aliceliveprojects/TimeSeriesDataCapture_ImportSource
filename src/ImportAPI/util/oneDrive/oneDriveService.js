'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBYA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAASXeZyyWUM9KGpCiQVfKO2tOmG300ZSSl3Mj/1TCF9NsUreF70/qYQVryavf5aCWSFOO9Q0jokR2TtSyV4UntT+50Wc1bvBjcWzDNKawtQIeRdiHlytvJruQc+oaGzIdFynvTOPbLRwBYY+qN1u4KkXBdTMABHCUmfHlf8oqqb9s3L5TtDn4/nv1ghmMzS6I17ZXzbw13/x34wnh74FrFKWsc8FEs/Pc5V9JwqMsW5dm4dbN6boIlLDhls6MtxhOm7N/pgravQppSXCfqY8PvCM2HKhROyTatJoa2El+gMwflvI0VNgYZ1iWOk4tyZm2Fk7EMFO1ZJjxuJMJB9UZDiQDZgAACCWQy6f1ng3IKAIkbsSGlXU2pmOMcjGIO5J4nCoYm+yVo284/446isCIexV3Ul0fPKb6jYaYfgi2kbdowYQ/vZAu1zbOmQCBZ0OSepn2XfWMECTA0Yc5NKa75SFqZFOgjHBnJGImKIo5FVz0n+GIFxJQamp/7SrbuKqE8Z73wyZ5XQtsbRaQlJ2o/wdG/c1nXNr96FJ05/CEp1YXdH7oFd98a70I8hySiQ3ROBP2J7H+kKlw1H5uc5KBt6BsG2PZjTMqc9vCUs5UMNLYEkEnJty9n5clBW52RAJXJKgVapgReRZNl2Lned92vCpo54SPgbqWwpX8UxxB2IxLHt5ZIeLuvBVH0mWqufA6Gt3EhVxo1478rXRrM+HArQkPIMBHiz4l4XrUatJPifP9Hd8x87x4TiaTFbfL0osrOqTflrUALdnEmnaZKr0I9naXGniUWVe/tuI7FeL1OKJLRq3b5f7Frhf/nFt8ul1WMN6ZT6sPmOCAMiTfzCz3sxARVFl4hdncYOfgXGRLGd9SUoNQ8qPA+L7nG4NBN95WAYjXnJNUgJGMErDLFhzPeDHLiDdpt1bluVOTfKbSSrILdmqPzZEmRBkk126i2RWKtPEDWYs9nrZ4CY58Yt9eXAjGIn0IWkCj/evvGWdmUKjJ5Y2sxK64PGJD698qv8yJFFs1qw08bJx9rSO74OKYCNT2iIAjThY+IedLLluJMEN7/SWjmhSUBT3ZTHj9gUXiTGRUePAInPFmAg==';
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
        console.log(error);
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
        console.log(error);
        console.log('Get Component connect reject');
        throw(error);
    }
}



