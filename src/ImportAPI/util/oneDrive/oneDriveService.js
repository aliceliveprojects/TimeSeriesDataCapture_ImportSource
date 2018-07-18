'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBYA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAARWvqK6vQqmChTOmw6P27FXn0otohbDE9rVLzVwYBke/8RqDOwlYcviN/xwc14brBFNCI3qY7eKQqQeAMxEazYSUyaEnYZC11tLQnIUYR0HTWw1Qd4gpm5UDVn7ly2NAMHEYgpTA3kow+WMIjLC7ldQ+zXPD60B73qYZAP8In0y7Y4GRUi3khvQHV+2sfyzw8xat2Z+xW4L4KNQklPSntajHz0Ow8/UQEXR2Ri2dlRFxIS5mfjEIojkOO5arjU2570hN1xx2yefHBNoPgRMNv3+vzFeAKD1aXD/EUNYMOqUBoLNOSN1QPAKyv0rfHuYV6kJ2RojXFL8lKuILBRKOkwsDZgAACOjmkfbWnohiKAJJo2dLUJAsP0LaxV4WJDa5gHnFJCEoMZufuQUCEMUsjhxBo/XgvRIXCEg+IC7tjQs1Q4+mhqMFEWwFNcsrk46p3edDjkoODRYdUD6tBT7mPKsy8poZTrFBCY8ZY4yFXsE6IsBa5lNrmzCIMqduAVwQyBgp1MIMHtekR4Rsnoxf0ZvucYzQShTtgxoHtnUIillQoayXXQgxtUhXKrpIwGemSZwvCxD6jwp0fOvD1ZJ6AMXs3s1Ks/kVbuaamQPswdfi2zrRqeBPVoq6SP0Aq3qwwlD4HFpNwZg8ySQmw96Z0U4K2P5j5Qa5FK7Fz9q7pG79zcKlZHjGg97B73/7pFyQ4thWJfSOo3QPleTjufXnw83MG4T5HGF6B2FeOkzpWv6zMtcx/u6QuBiJwnro+LU3IhZnkSO4bRkXbp3sBWFnQmD8dl1Fmyfapd56GQ4zWMPYx1JRJK8DXj4CB/zFmH4Un2UCzIG1Z/EpdYHGC8NCQ6jgASR5krnkzPXfyVp/O9NvxoLE4QpnKhRxJ7HmMtDoGqGdQuV6lKSEo+1kjtdx+5AWPTEkKoN4lmb0kc3FQR7Rqz/ebGAHLAiCjQXLsjN3hRSWOGWS5sXOEusUYh3NsCGK+4EvEwWTS6K1bTegyOuP1wOgI/wtME7c5sxC2GenS+sELUHrLA4Y3ReNl0qmle4mAwb9EPfLXv6KbqX/4BsdI/JVUl9EkPqwqq0pIubM2Jg53t1C7NJmAg=='

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

function parseResult(result) {
    result = JSON.parse(result);
    if (result.hasOwnProperty('result')) {
        return (result.result);
    } else {
        return null;
    }

}

function errorCreate(error){
    var errorCode = 500
    var errorMessage = 'Internal Error';

    var errorResult = parseResult(error);
    if(errorResult != null){
        
    }

    return(errorApi.createError(400,errorMessage));

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
                var tempResult = parseResult(result);

                if (tempResult != null) {
                    resolve(parseComponentIds(JSON.parse(tempResult)));
                } else {
                    resolve(result);
                }

            })
            .catch((error) => {
                reject(errorCreate(error));
               
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
                var tempResult = parseResult(result);

                if(tempResult == null){
                    reject(errorApi.create500Error('Internal Server Error'))
                }
                
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
                        var tempResult = parseResult(result);
                        console.log(tempResult);
                        if (tempResult != null) {
                            resolve(tempResult);
                        } else {
                            resolve(result);
                        }
                    })
                    .catch((error) => {
                        console.log(error);
                        reject(errorApi.create400Error('Error'));
                    })


            })
            .catch((error) => {
                reject(errorApi.create400Error('Error'));
            })

    });

}
