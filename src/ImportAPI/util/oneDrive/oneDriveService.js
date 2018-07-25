'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBQA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAWdQto1MyNWfGZnoV71iQKxEE4uD4cwMDFhXA8w/px6GIgAf3rJ413wx76ghYLGVMC5FuVocjvbajejrSlZdyIiZxm6rkArJ0BJn+LQ4YSlFfB83tOH3JXOataN/+itaZ8mxdIkwwYbeedopn60/SgWCA9/6uEa+RGsW1B5KloGq3Ycp2xX5bdTs8jRhLnG0CUoTIpny72rxQCjF1q3re9PSYTM5v4wfwP2dhsnCVRjFWtE6CbM1idl317aPvy6Wdsx1BlbGI4Ez34uJz3uCexkgF9XUIgqH8tXTMjS/YzzAJ5ZKRDJT0TqQuWRpJjbmCQNAHIZNHOqrJiaSB89gsjQDZgAACBu2+kDzjQIDIAKS/LlChZtlWc3df6ML3Vc0qiT/G8hLdk2KewZ6DS7yC32xw7IMhXOab1tLhlLke0QLGZWBlZnleWXhrrWYpL9WuXLyNnmEeByEtqyTGQugfWgw0EWN6yeEhSAQar05Gb5rO5TYG3aONETjMXew4MIaQo3aS9ogtpyfNZk+pQJap6FG8fAEMFVkDv3YscdXZbNm/STfTC9A6ecgJZEIdjQdCsdD3RWHVq5w95B7vGxR1R0l0TA5yPhTZ0pYCGQdMSj+rxTc/LFKxYAGlw9forG4VUQ6MH4beuNRWaHvkgTSBiFoB3O+UKcPBWTzsw3AaOtzpnW4EHkN6fLTbKDbv4y6oJjSRrVLN4l0z6XLhBfI2k1mc/2Mh3s76UWi2hBvhTAO8pwY1AJOo6V13rNY23Og6owiNMLj10ThW3KNWRPtKLsWWbaZgHxyfUxSR4s4WYl5rmBzUkMivLheduAbfBaMovnGo812HB0IH6f4MI5mnr2VEG80E/WuXKf7C38MXcOA3IpZKumDgcu4d3TkRtR4ifJVb7cDxdUZwbRVxn3vtEGs0W/tVEFcYXqM1xJRNI2fTnv51qVDhScyhW6MvM6ZK9dXL13gQZphGkW8Z4pKEYd/S5PtZGguvQKBjjH+DXokCoitFirzM7y0fRLnN8xPYEtXvtL/MCUPrglWz6br1jmik6kiitgiaw174ynaxCKpLwOmnR6UGerAHxeo5gt0ZgI=';
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



