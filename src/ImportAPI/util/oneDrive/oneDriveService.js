'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBYA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAU0AdQGC99ymRz+Y/g1wYOIy0OCqFm16X+jG/xIy44VtXYVmoAVWiJ8HYGvic54WW3OhYlZYKBBD9CxDsGo3/9R6SWPGyGhUckYBuqv3Tz+pT64TT640KBjAMYd1LKrEzPayMEXZEikB6Hb9Il8yAwoHt148qGGj7VosfTOsq2zl/5uJmFKziS0Zy3XgA50ODwiMlyfRacnslBiA7Kan2LO2A7OVwl6h2ZuZZ5XIbruQ53xpFBj/ezFy4PH5y0jqNCrddlMD5eaKtjIFrOMIF/hZtpA7qXwCtgxzE+IzxH49BVuvaBjsH5IDkssJoZCFnIWs4Eq5znXomOz+D2nonCMDZgAACE9KgSf4+L+lKAIqJea/IYjkVHTA3PhnP1FcvuIamqpLTDdCs4QjM9g8H+i9dD7dd56TGO2JeMHtFa52Jqbk4n+bNqM8VVQBr/q9usH8JrxD3RdE+8HS0qO1txZZ/H+2vwh4L4Kj/eqF1Cq/Ekxifm4Xx/9ZPtRxBRvoL1Po/4eZ4Do/Gw2HXvnCBkaapyPyd3thW24DvY4/qEgTW/apLxzLiT0STjVHL5BKVivrJl6PWwjjbRVLsSGjh96CbZ/L9QzSDtTyf80z3nFRaO3gSiwrHIDOSTP5fxBkdmX/aPxRd+mcLdL7UaxbmGxlMAl5UVFGDtPDON9Z8M2DrcaDvs4BwCMI5pQTtjucjwfsZZGOKPujZyCVEVy0XR80vgwhC8wX+6UxO0ZRFn+Wj+2njPL3txit9QflcPZkAwlEZpevnPWnGN2yhdgI82x+NFdxeiY9WRyR1BkvSh3Dr8v1qX5tw52HIQ8Lxjqa2wYH9uXPYZ9sOL+man4BfWkJVsMSptNoakc/9GJfWGOh8TUXKhgiETPiQ8Ph5vJUI2O0O3H/8XRDTpY0n/5UlyOpx8/LDVhuCJK3zpXhpYPsktXzHU/OJXKBNueZgYlJGx1SUhJ9tKdLrQDM1IONKG/StITib+jQ/numw/FOeMl+d7kCYA+GRTj6Ttd/J9lO4KVTeBXfKBWzZ5wQhK+ziEjE4FmBixBL5ka1dpn7jqByHnCciSefjEZJf0zDJXpo96mbTto1gQpmAg==';
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



