'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBQA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAWxIZ4cb0dmHQKPZM2xbtDUEcbu//rHHqRWT3gas1z3roM+82E5lbRnABBrk9m1NriIb7EavKrGrWc0IOMC+B08dhbEcWDNaIJ8rn1WzPKU6pI0noTbYAWWbIdGhmRKlVVtok+2gE9CtLyHS+oC4yZkw5oBBxswJOrEXoxuFzNvD7Ar1ZdCSp2H/ebsbsWLquNdZiBBeIGZ+gsVE+knSBMXpVfd6L7h8zhXJo92WuacptvR/E3CK57NUB8jagHM+mx1xREq2JkhT04fN+dnNdsJNwVjtNnzJCtdygIlYr4xA+6oniCgm/T0lNSxw7HcCht4EAYa14rIkPJ14x19UwJQDZgAACNCLE3XRIsvMIAKjDysV1vNg2GGv9q9potZ/k6dOl/CiEOQrWIlG2UWsY+56YbmuK0V76m71Ok8tsixTxF875k9gpvaQYLN9lgIyK/GkqRtxBeumFa8obmJ+LtNnAnWbXK6jCotYtcFfXGrgcVojiSB09j1HD091oMVdSfgcqKTxtJ3eO4wocxambJkRBBFsNJ70vFIyrCDUeTXkT3YH16iow9t5wZesQ3QINMsbEORPnA4t9bj9Rs+tpoHv7wxuV9Yp7h/uvLUSGADYA9w4OFhwW9R11CmkUefp5eDnskB+TQ2eWIkSb5EwCnDnqNzeYR9ugtSbNTGYQAvLnUIg8cmElPFde6CRZVmPx8ekbTQU4CwylPUrA64jvE4HmVMqMbYX/UZB1NMtD2PZiwEvvUZ4MdO2K4helckFe0YcYOihhd54ouuVsBEYfea1J2rxHCAxLZh+lxbfDqeqkYA4HkeyFfP61U0nO/ffACf7NSy83CGNU3o5tElK2/ScmgCfF0c3UZ8MplIXqmxjWWGlN/2gk9TJfqfAG9lKcHClIe4j6XIopx9OPgYue4S/fxATGlh8ZzM9cR/cIudkogj7UmcBqYaUYYUh23awf/1aFAMAE0AsnhGO/ZsZnwymYnwo/OnR/TqMMX/9SSHXJBYx4CTwjOQCE3tT6uR44YR3oTiq4DTZ9dE9hNpsKdpWs7kNtpxtMcZsU/9XD1qrW0fd/FgfYzovsQ+77SaBZgI='

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
                    resolve((JSON.parse(tempResult[1])));
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
      
        var options = {
            protocol: 'https:',
            host: 'graph.microsoft.com',
            path: '/v1.0/me/drive/items/' + encodeURI(componentID),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer ' + oneDriveToken
            }
        };

        httpRequest.httpRequest(options)
            .then((result) => {
                console.log(result);
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

                console.log(error);
                reject(errorApi.createError(errorCode, errorResponse));
            })

    });

}
