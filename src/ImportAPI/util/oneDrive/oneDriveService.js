'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBQA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAARxDfc4agzfL894C1tSDOp8uLn0Q3bJAIAfXJEBvGBQ3aSVVglARH8hWVcleXaTse0GtwchwpyfdHZsScs4b5LsAo4iWN/VOwgsdNMSbosdOMVewtwd9991C8fC7xsTCbPfhODTt8CFqlJLJgni3cvzQmE7TWyckl5GfcSSI7UC3UOEdm7TrVtjjcgORxNYjBkuNM1skU5joaylF+D111iY5sM/oFvmJL9jhM5QK9Tp8Ca4F5jkqFJEn0k2DwEFDSVmJ/8YoJ4rRuM6yHoTwa1M/kNw58YpzqgiWGDzqQqrKKbKfMKeVIt1xyY4Duow4udT09KrEJkJHBjvYPGS960EDZgAACM6ZjtSajMTAIAI8QeOO/AoyoiOSPKaSNmiDODHGlvfutyjH8h/8NaGsc0GEyrgt6Toe4D36QyUOU2U34s4xqQgUq2qJsU/Lwp5mylxaqANKwWrQEMacogVgFT/a4hjnUBLK2x7p88vC5RyFa/sg/a3gq15WmHFF+poPA/SWiTm4EbXo0QuiJZkOe2g2QhQlS7MwDxNS99y11PFqBJoAluud5ViJbOyoZ3xzy5ZD5SvLjP+5mvQnv7zJ0v4lwsAkJDXSvQkpTiHqgO6jFp+nTSqair5+ltsD4M5OJxiEqzwCVnscUbCYtGNbDm4GTjypWn+6+pOx99QFcBlHz9yTsDtQAvvM+Hma9TAMrsdJR6B68WQq6qtKRjNSen9puT10mvmKQmPf564carmxZggrnjuqKnisxx4RisKgvxg5oUBlhwxMdjlZkyAqPtO6rzMvagTfdumke52yJs6y4qr233qBJPgt1z/NCZoUUi40/yI8JPUBAK7K6LY+/hu0lz44cKvm27pSi0W6to+m5CKuocpCR+wF3Y5h+LkEYIfJgpTVOCckC+YtH+8sIl7EcM8GUvVgp5EuXTVIWVXCSwAuG/RyvoMhXzSCVK3ddBLDfOQGyLe6Dnknylyk0wbM6lLXMxlFKbC3oABo72Zu4DM5g+jm8h6ZCspH69jQa6n3+ov2OGAF68WSsZ8RtowmJJVFxVypPeufvy+97vTC0+PSRc5ULyVCh4iO1B2KZgI=';
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



