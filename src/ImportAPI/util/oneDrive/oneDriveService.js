'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBYA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAQXvquNSJ8zrdi3yR2nZb1L1P7f27D3LeMP9G/EwaBmF0fwuEpVB5xLb34Xqbuax6XSEjFhH76cvAAiLCmn8Rg5yQHdqQvNssCf56jp2+/5csxo5SD13a3wS2GRTXLZkC5tO8yDE1BHFnSVhccwtL8LDw+ljeCTmKh1KybRAhu/N8i/8tEWAPsMqoppCAsFXIy65Vy1WcyonBB7s7NKluNDukCrwUiDulZYSxHdRBnHkhB9o8OdmXH4fGHkJFcaH86vZnRPN0R3TJ+Z+5YVqUKPyeHhEoXWhn5Ial/yGSaBTcvl7pbm5z2gSiPbbtLdxDFUN5T7rAhlBNOvmKUH3rVIDZgAACD38I7v9rpU8KAIqQ5FiJFe4QQiNVZOj8pBEc2p3u0JSyl41Bks4RtpxYuM+GOQYNjNPPCEMZGzNS4j6PCrdJZy33rIzRvT/EcX5Jn1IhsdhizevFQXtemu3oBpGdTv2s3NdxrHtGaF6ehoCSDyPEEA4SphTRT7ZsloFbEb5/d0ziPwaw6JyjgqYxPGWpXR/87B0Kl2MRrAZtz1zy7p6potlVW3jc9iCxsXdVzlUFL4j4sEbLnnhONeBHtcfYDogKkXSl6yQgvsybkMbQO+Wtmbl/QMuod18BzQHknQHL5mE33bXtv7CFiTcjy4zCv0ih4s+67h4VEh3s8IKnW4/a9BcMZz7pLVukTK0i0kLVejipQMDognB9CjKoMbAu1CKmpTC2Ruyft1ghUAOnnxP3pmkMaz1ILWDT5XWV3NVt3j19VuEA93Nhb+K2FdCcW24kUbe+Mpt14TypFSr+ITQtQBjBzUQgYh08liJUsOwdPFUUupI2XBjqrUWCeAOBD4dCQob7gWG+jKg+OBMrPzLcAdOk0NnZrCItSBcGyctGKN/IFvtRGIFZCljwhassN8lVxaSii5VJLAXPMWZ47htDGJdQF49hXx1cdTo2ylwoI1wD8fnXsLQmpo4hwh45opkbYfyFrxgPOPN1MCqz4yy89qCouLRPexrGNliIay6K8EYWKOuVUrW+BMd1XkN/3E0Ap7V//wzrHQUekSL0jhAkc6STMhXA/M3f7dxcT5QzF8zjv5mAg=='
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



