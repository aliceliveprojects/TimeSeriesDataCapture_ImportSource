'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBYA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAASROFGYHQhOyLYjzg2foFIRi8j/XUNlPbeKtqNpafmHzfAAfuOtUuEua3kpqC0LrBkrpJgjEYPDNELYXZ+6WtGDNosY56p01JS1WnY9cgzbEU88MQaBElUQaYNCNJ+ZB3WzYQIbCCdeE0YCkmLF2RmOitPkmEcPoBCrdQMH79P1bSYcfiM8kFJ9kRE4x09crKbwe/nuh2L+Bqvck/XNPzES/m7k4xVS89uhrsj8dWK+lOKE++KyZUmBWhMnn9evGIGpiLaIgjO+WIVHWKHBDZ1L7f3VjPYelebp0S4m4+3xPuY6+uZc+EIaNyc2c5JYzDBUIi9r3osi9nI0bj00k0VADZgAACJmgf6xOTYqJKALjyboR89W/ofQ5L2SXBorba1LNdjTpiPLzCqiJWFws59mHnl7bzGcWhlx3a7071V2ivV7LIDcQEaxc2C9UhmR7todI0x+7FA4BI6ha7cg2tupeO/2DkjY4x74hyU5kZD3AIDqeym4ie2ECdV9jSEn7NrD9f45qmMPbKbSogJuXmwsZZ/xH3dhEnUj3PJ7x5JY17FizFzsYDT3Jb5ahovyWx/LGyxmRdH7mIksjS4gwTo4XlepnG2Gl6+PoD9Z/vrQT0L9IOm5Ov1+RPjZ7qypaihRd4mLfB0ARezS7jrQJEDfiiAO8q2fCwZh1hKFN3BfHetNtKBQvPnFNQrKDGFCOJQaX9wVrrb8Um0olwkH7Tp6KbsMNbPKQ5kD5oXfjvNb42i03GzIPGrtM0lQPXVakq3XlAhf0Qkg88kpf9u4nCpFNGkX6iGhmhWF2lXto4UZykoH+1kI7s9jdDyght+7QPMcYPjGQTr9rv/OAoBZHL0nbnzOpPnuhNJHVt2j+m1bJTcn6zG81xbScfBTQKAfKu89ujzqn2IPvVnbRXhyvb6mZOGd03zpVwKVlH4qejay2lDkcVde7NG21L6TfgE2N3iSc180XK8zjw/m4zTXOkUF0qk4bQTM7KbJWAr4xN4/w85q3Gq2DtSM7VhrcElB3Dzo8JnoBZvGzgOjrl22D+LRWgpXusp1iEB+one+/byiHPhYFMHSF2v04XdM3phPoL1aW9fW2hSRmAg=='

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





exports.getComponentIDs = function (folderID) {
    return new Promise(function (resolve, reject) {

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
            }
        };

        httpRequest.httpRequest(options)
            .then((result) => {
                var tempResult = parseResponse(result);
                if (tempResult[1] != null) {
                    resolve(parseComponentIds(JSON.parse(tempResult[1])));
                } else {
                    resolve(result);
                }

            })
            .catch((error) => {
                error = parseResponse(error);
                var errorResponse = 'Error';
                var errorCode = 500;

                if (error[0] != null)
                    errorCode = error[0]

                if (error[1] != null) {
                    errorResponse = JSON.parse(error[1]);
                    errorResponse = errorResponse.error.code;
                }


                reject(errorApi.createError(errorCode, errorResponse));

            })
    });

}

//example 2B497C4DAFF48A9C!105
exports.getComponent = async function (componentID) {

    return new Promise(function (resolve, reject) {
        var select = encodeURI('select=@microsoft.graph.downloadUrl')
        var options = {
            protocol: 'https:',
            host: 'graph.microsoft.com',
            path: '/v1.0/me/drive/items/' + encodeURI(componentID) + '?' +select,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer ' + oneDriveToken
            }
        };

        httpRequest.httpRequest(options)
            .then((result) => {
                return result
            })
            .then((result) => {
                var tempResult = parseResponse(result);
                console.log(tempResult[1]);
                if (tempResult[1] == null) {
                    reject(errorApi.create500Error('Internal Server Error'))
                }

                tempResult = JSON.parse(tempResult[1]);
                var url = new URL(tempResult['@microsoft.graph.downloadUrl']);
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

                httpRequest.httpRequest(options)
                    .then((result) => {
                        var tempResult = parseResponse(result);

                        if (tempResult[1] != null) {
                            resolve(tempResult[1]);
                        } else {
                            resolve(result);
                        }
                    })
                    .catch((error) => {
                        error = parseResponse(error);
                        var errorResponse = 'Error';
                        var errorCode = 500;

                        if (error[0] != null)
                            errorCode = error[0]

                        if (error[1] != null) {
                            errorResponse = JSON.parse(error[1]);
                            errorResponse = errorResponse.error.code;
                        }


                        reject(errorApi.createError(errorCode, errorResponse));
                    })


            })
            .catch((error) => {
                error = parseResponse(error);
                var errorResponse = 'Error';
                var errorCode = 500;

                if (error[0] != null)
                    errorCode = error[0]

                if (error[1] != null) {
                    errorResponse = JSON.parse(error[1]);
                    errorResponse = errorResponse.error.code;
                }


                reject(errorApi.createError(errorCode, errorResponse));
            })

    });

}
