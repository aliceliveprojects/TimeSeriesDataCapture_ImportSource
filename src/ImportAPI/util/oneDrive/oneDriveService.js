'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBYA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAau664Yvny2f+TWgIHEh9sO2ZtREosnxEclhFkajzn0NA0ucrk4l759L7vbl8w5KA82O1VDI6jH/8Cf4bWAa14drfXbpBl1Apc1OI/N5OPpfaWYxrqaMpUkqbSgvkcUOvPuMMH6/BZlgQUKox+rUt0naAcuqyR2xJsQlvUBkToudBUnze2KPdhSUheWamcxHrIP4ywIdqYZ4/44b2hKW2WVtoYzkDXnlmHgbP+C3tSahNLIlhAeLKMtH0IX56JvPnNtuhnWO3rc9KtJZpauAfomois+EiDsgR/yDKAAIxxjt/e9fPmcHBePQYRdHfIXCzcvCIA3eNx7BIzc52UaZO7EDZgAACGJKt7r+WhidKAKf+667BXUDiAAoNuTIwgcD1sYWH6OBtBn9rvYc1RFHu0aCKaj7YpFS9s+ewefo7IaCSFD3K/oDO/E/wQZBTAsS5ywCluEiP6fbAYuskG+qk0QKLHgpKckUcQpUUqYZR/id5dxaGDcA6OtGQ8Bk+NQWJwUP5z4Za+x1A0YmJmpffza1Sw2eHvQOy/iKae8GRZ1xAY244UdIomy3WNiSeNMhVjm7LG+J7AEOMuBblx2xKIc4nsQAVGDvdj2vMH9Mp5AhiThiSCWoMptORzcCnKKJ7z/Z7iiFYG8QwHt4raG7HFAgOvnhRPkGGMafftms7M+gsDLd4aLPdgR7qtQcwEcWd3n8LQEtGLXRbVlYwsFFZq4KbtpZgZdhE+H7k/xBAyGLR7oC/u6pT0Vr9lALE9vzQpPuVm3AQY+AgjO0hyeel6ciVJygfmFeiVWbBlB+o2xcfzk80vLmHN71wT7CS+229UvtSOQgN6qiXniOjyyMQV1lOnIEuVdpNqAj6QXwiVap3N5XhPEK4dIjw7roRVNr+BR42gna9s5t7ZobXsWkQO4M1ygHyN2QbMBQWVOWGozRVL434h1LD4f6rX4JpESs+T3vIwZA3OBLxZs+hgh7gSYVHrd5kyDie7hGbbNtxk86zepRqXW4wWzBMRwjaTVhhY/toWLxLTibMEWEENvdpqZ57MtImSLVw2/R+IxI+bvuMr2H6LcxgXa8P3DQnjK1rwT7e6DJ/YlmAg==';
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



