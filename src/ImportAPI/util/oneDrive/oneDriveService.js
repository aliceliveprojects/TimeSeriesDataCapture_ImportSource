'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBQA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAWI659Lu7oQ11x4mCGbLtSM9Lv0F8oQ/jFvo+tN3bMXP0l8rNdJG6K3ROMznPLt9EPLFM7RxveVWXIxL4gJ7+POry4KRhJavOsCKJ1bAo47y79aa2PHhBZSqdQyLT/LXSfihZS+xCZQ6Pej4v58B59AszBf/OILJtyo/xIgEC6mOPrWFHW79+yj/cLZNJfqg7wbphQ0nin/uiE2R9dlKks0UMcR0VbcFDPuN5rsWuIFA6mVoxNQ5mOhVBss3H8dKc/Zo/dGEkgpXYZk5r8PoIL3AvZ7G+qxt2jzzndi+ZY3TfRU83fUSXy9eQanDIhUn3Kw0uTi+8BH4yKdOXN22ExwDZgAACEgOrw2ruZMtIAJnXx+OzIGQkn8QFISRbbqCPq0aUFIny3hjxZuWomuu9mpu5bzsgnK/U9gcKBIPWewApHd+Nkrv51JNIvVggR2GuvwyFa9zvEUq/ExnSPPeSalP3dr8gfivdwg5MbBHDu3x8BVwnaJkBfZBoIbhV5AxWUlGNrSWcAjeOvSmJ7A6UZXJH8CHkOVgg7n+LpLuE9W3o78L3tHboJnnVO5m3yPFSOkJm/Od+qk9EYRUPbfOy7VRcnFoUQLy9czP2toB8X2qSQezvp5JBRlxFP/SpB6cKKCl20hvo5CtfxLjB3Yc58bsX215gpacCxuUGA1ANjO+lUXeL+lUiGsuck/FXmMVAq4MS+crQsE6oUOx6pAeoEy6bhhmu2ZuMd6gBoB9pUd2Ofyjcfmaqx/rsEj/VBo+6swGVjvA7J8lSai6r1yLFZiywlAcxuI5KVsGpAc0dxYvx2HZWTj5gsUxGZEpgz4Pkq8ydg9wnMAZgSyVtgaLWYRmOadbrFYEEFAsaCXUgpk/gEh2gPzKcukeeD57QnQfGc51eYMKJwtzMnd3On56YdzJDW24T9HWaqZUDA4OKRtcKRefhTy6eHc69zNnfqr4/Hen2KvrUm/coDzHgJuyX6kz8JuQqu/kKZOu1mAOQ17zdPghegg7/pY+TDnFiShjdxNclT6HX3eyhmK/TWkcNXfIAD/E/nw7XEmBt6P9+THGX0vRu2PafEW+Z3HbO7szZgI='
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



