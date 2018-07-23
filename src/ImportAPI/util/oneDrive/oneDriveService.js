'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBYA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAYNwcOwWf6wH75zRGNr87ScVZnI5anY4KKVECJNv1THOrOZxekqv5XAyWivwig9kO7zTKVNP5gN5fih3G9YNWD5s3VF0Odp+KGxfzIH3OZNhVYo6efElmP4a1C6Y8mx5N4KmNTsSWEDkhrTy3nk3Lq347mmxOvyyJ0Ldx1x62Mi1V4ESCQyg8TpLvP//cJfggaoRBDy2GS9JDERC6h1s4feUPt5AnX440v9sjEtuyC6sHuMNeoLWifqAn0YsvMbe3Wf0MFjqgDTG7a/QKEK8bS+QRUeayWVi2O/PTqMOod9vt3axLTLKGiWK7GGCSB5qKJWQtdoA7lTedEQB2asLNwMDZgAACHtLQwDk3mcTKAK33KOEK7l+pvdJd03Szlf6YbUIt2WEmB+pMDQ1uDhzgOkM8LN3A4JpbaaJeNXEgRBIpvqGpYrXRIZxNvHM+PIUSOiwp+/moMmVNXa1hfnFK5H6noCKCDZgtMvUOsjJLJSfNfr/zE013QhnqPwrJV+sIqLPU+h+w6aY+CHzT8+FkLvoCYzEqpSGTMNMYDmbslfsmFxvzUgakykMfeFg+5Cpc1wuu/auTZ6GTt915QrO/vCn/nYRj/dlQcDAYB6gY7+Nl6kOetU0hrHBDcaas3FANRmLsleuDB21vIA4gxazAQY4m+y5JfkLFd31X345PSZiHfuxbXw3QS+lf5y9ya9X7J6NaiC51e8lr0obUrUC8LnHcl7QiEu5xl9x6kR7nlS6G0Eay3tpLxy4CV6bo2Wns3YZc2kS0HlnLM6tcX3dbsbr1j3vwwk2yTlp6Ew6uEq6iJe3dNDmbP56lpT+agMPV/zmh7GCyU1bBzpXnNMlm9DA4hhkD976rv5VEB1cm2zIdTyuV2ltnMknr8fnegWinhSzPdhsbq6mh6ilyYMb0s9H26U0AxPMhlxal8haFN0buKaVQngGKE6X0LqmHUi9LEc2jOiuDz0T4F6+QBXq5+NyGxNdIstv9XrElvHKzvjkI9bTAnleReMWl0f1afTQ4TcIWYjPFQthzuLD9iaKib4l60F+rQ8Fy6BJ929evAdOhNWoEvU2rXmKoIIV5xQd9ng2njgR2F1mAg=='
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
                
                return result
            })
            .then((result) => {
                var tempResult = parseResponse(result);
 
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
