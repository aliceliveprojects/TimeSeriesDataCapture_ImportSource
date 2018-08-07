'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBYA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAROhzhW388YXcxK9c95t3TGHe1U57dwCMjTiZRYu4539kGMVrXz0dsAwRnFy0dmcvXmnLjkuJLQepYBrkjeVuJVUa/hYefXbQbPg10nNj2ZKGM0zibxRyFeYEIvh7bzboCZxGoH5QIAUKGA7Lk9b0Iuic2gokgIqylUD97hoOkJGZ0SnfnxizejIJIfytFT8N21WNlbm4P9qsp/Evpeu98smfaOfCT9Pn7vU4S2bThFhKHHRNrodPqpvA/tQS6Y29+RwfLpIfiDKHGNm7Dbfmq8Uet521airU5N4jg09D/wn1FNSEdSdbJjR4iir5a7CMHWFSX34/5YLKsEwhn4BkYwDZgAACLy619QO2u1jKAL7AhOwjsh3fl7pwUTc1pHKHHEXJV4HoD1bQSUJztTcTYvQih/ckINR/v6XPIPLkjcUoucvwW4IIvNJRe0oA7WDkMVC+iB2qNvLVM5o8CN9avb+egJ74Ie2Ex9Bj1AfIMWY7L3SFF2sQAYBRTcAMNKn0jsveUohUVVctQZvx8iHW3nbOPk3fnI8TibFyQ8a43j0wRcleSoDByF8Uj40yHc8S4oY8YPymPnhWFxSxGxh63LHbclkBGMQABNknMxkQvcrxJ3mSiUOidPR0t3vodCyqeaQ1TLxQCudnlGLoRiiDsWvF2Ggq2ZebS+t+Jz+6ULi/h+R6zZLMYfxUcNEUpbvILvLJBDXjbejy/1ucMbOXyTQhIaGvcu35BSWwxKmW6BfSnci+8fEL6zW4rfrQtmdd7LfJ42TemSPrrYf88NMJIzlV8q0H/xeLkIuB7P5O+CL4n26rl54Q2yWjgJPY+g2S65Uj1GOLWavT+WJw4osgvXKL/F/T4vpJ0BnWLlsnv+HUVkVurBxXO9tnYMHYf4kes9e6fhcHEMUA/4cKColszcrN6xEjVYsqhJqnmz6hqTm1d2Q3z8++CR1kcYN2kJ2qIK/wUNiV3ncMvagsN5jXN3QAGsVkzo0WJfA1TMHxi07u66RuzcAlUKdZK7QVQcnJ37DrTbLwzMmj4/Y5mdEpjxvTfZKvXRVeHdBiD0qbjD723hdRBw9qO6vTdJ41sJBZhaaHwVKp7VmAg==';
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



