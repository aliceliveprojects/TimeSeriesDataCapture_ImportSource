'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBQA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAT9T4V0gqOXvoEAMwHvgdhDTeoynL9q5TCFQr4ud7nb8Q99Bshr33FWjuQvOjiA7kwvpiACiPKqEcXTB1hmZnWHNxYewBFYAPmRXbOA8RtcJnRmRHqbaq7F1OXgSd5oLnBcFDUE6ssFZ+Upiq3THQHweVglCSHhfFKqG2h0OyL9NQ3M2DwsMRxSJb5VpK3LXC4zizb7wCOHqbTscJzD6L/wZ350eqOGrVo/7JnuVonwaGRdOiRx+L71yrdul3sJG9DH/fWHYpQvUMPuhSZ8jd82fHU2ZiYpj5GdEDhDUitIiCLnR1o9yZhKwt1p3ngXp8k2fgXVwgY75PdWOPkR/HU8DZgAACDxqihylvQkjIAJ2UBEmvySMrrf1hrijixCcjNVhuTPQuvQfSRvqp89kj+SuR091klL0E2j81ui9Ex3tZjI/qLxarth6IZqZg7VCoZThO34CUIF7J2nswqZL7kRlh846FrVooa+aHW8e2Ts45nlTJgw8N/3dpDfJScx8oCXmb7g654al4gOWlXFPS60ZQoMvKNdsuS6XXOX4bhQ5HR7qkhYTEmegcsmW9RuqZEKWkTDBm2cZX3Otsx7OSPSYL5/E8dzZHUrBzpivODUIumDYxROrvaj15S8yhS0UH7Drb98TaOSxPvTGEt3qQYGdY43WDt9uSaxcZnPvZ3+p6RCxBdAyWz7QL55lR6L0y0Jiu/eUJ7r8iTFbed2mOj9AYDCIy98S3gktX1Ar2D9iQQHQWs87N+HJ19BCoHxnn6E7/9rgnh4arzT2boRCnHE7mvMXAqwfcM5G7cgkoG5G3AOfwOOxiM3fCP0fVwyLBRABsUyXDVeJSzmDOY/AVSgZ6UAqX5XNTm4/CfOUT5K4av5O2csgnB7ONC5gDx8fdM7FDFQwAPKrc+4VF2WcARrP1bwgV0JTmb2b5yrBTvqgro4r/0TBCy4F3c9NwBXNGmDUtmbpPINeZ8RnyyDGm6WkzE70g3RTzsTXlJeYQ1zAj4DGWyFna7s+ryvrJblJaYLcIi8OPVNGcN6BxH7T3QGajHGLPXr7p5rIrlgTIL9RtFPkYxKfNaZ6SXWmSiPFZgI='

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



function errorCreate(error) {
    var errorCode = 500
    var errorMessage = 'Internal Error';

    var errorResult = parseResponse(error);
    console.log(errorResult[1]);
    if (errorResult != null) {
        errorResult = JSON.parse(errorResult);
        errorMessage = errorResult.error.code;
    }

    return (errorApi.createError(errorCode, errorMessage));

}

exports.getComponentIDs = function (folderID) {
    return new Promise(function (resolve, reject) {

        var path = '/v1.0/me/drive/root/children';

        if (folderID !== undefined) {
            path = '/v1.0/me/drive/items/' + encodeURI(folderID) + '/children';
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
        var options = {
            protocol: 'https:',
            host: 'graph.microsoft.com',
            path: '/v1.0/me/drive/items/' + encodeURI(componentID),
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
