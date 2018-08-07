'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBQA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAUyy77BstwYD1kG8i0XXFl16Wa+lFz+ur4zwa+9Vb6ExsJGgHHEbMYZElWWmSPKldhwbLZrcoISpoTvXBNm/bvrAKiJG8uab/0b6tVCushX7LYDmZhOaIzyKgtUbttFaA73sLt1NWZk6tOMDEQ0m1kBwYVIeRgs9sRlzMefP0IR0Z3DBGsdZs7wbEOb3XfM1lgJ4lVjVuQyxqxYMn5OMp0zRBvkWHL5P8SYoNfH5BuTtKwd+hgfr6cHc37xiwcbuZHi5p9KKZTt6BUkIYoS9WP5hWz6Fvt5F40cSVsAZn5btEdOv+aEi8wTnAJCBlUCH1iiIM54cdZ8LxLYqEppL8aUDZgAACN9NpfS+26F6IAJq2JWY14PlYSVzB6bFnOHDCl5X+xIeES6IaeLHVWEjQp9EI41u/Oj4VxI8lg6W7kDwxiFT6iX3JX3hwyS2cI89Vqne8fOXrEE+N50NpP9pOIYO2fIdA193uE11nA/AXvtV1RCASh9omNCVtMxe3LaptvpIGbnHhcvFzb2es9fgYFMpB/nw6NvrffTbrOnveM5RrzZX4SRqwEFJPWyjJedIYdUEhAJ+iYjJIucixKLeTpGfWDbcYMdP2hGRUxmZKj+ni5YjDwrp2vJTqbGBKdM7Lc0VkOdxosb6a0HhLqa6EtWzi16YW5vzcJL5sYDjqQK/SKVoXziR5slV+4rE9l6LE5WFFv16m/NsAcytROqqD/2sgxoTye6wQ3Lr7f38bsMLC3wLfBBccds2zwKGq/zPeV3HGH3hUsTO0M2unmXP+JTYS2ljk90lCJURCwqnJRWB6Nfdb7of81VoSilzRpw9+U9EiWsyyoM0hulGhdVbjlXQ0jLTxvlh17A0hkWfxg/kdUmDqRXkJViD79Dkfm3h/xw7T+DtlFaOdRCFUumH5qd+zx9nfhOKHBoml9aiC+sdGq6wq1s/R82T7ojYUk//jeHSa92jhe/hQxlgqyZxmN16/FXwPo5StvGhNms6JLDhqgG0KO73R4MuXU5P0D6OpNraG6d8Elgk+Z9j8mVefX3+s1LKdaJdWYdhP59kh5Vl0Mwx6FJQ46HYxW3nNcq1ZgI=';
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
        console.log(error);
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
        console.log(error);
        console.log('Get Component connect reject');
        throw(error);
    }
}



