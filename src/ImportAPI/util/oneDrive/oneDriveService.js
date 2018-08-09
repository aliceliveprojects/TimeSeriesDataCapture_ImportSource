'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBQA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAAfw/QHOnR8HJ6Ri/G5hUx7O2sT1vWs+8jqKRwcFyXB/Jb5ByYlpYwtGuk3vd/x30Ilt2U4kvK50g+xfTy96+ceFTzlIyzMCI6N17BcIFeG9vHOSblpsgCubwQ1dVIcgKreHgl3rMH57Xkx52EmIQRcUsUOqFdzwtv6rolkVMS9BaDf6xdc02jcRjWD1TBMmvXTxT7HFnP/n7AW4k2yqpXKOfbtDLC3wxTbVYyAiol/XZ+vJ6wsObFOeUs49/nYfKzchjxQkI0z+Y3KYSZdpYCGRXjOMgomQVtvADtsHujA7bZoBeb73NxOSQeveIwxW8ld15tkObMPSnSW4e+dceipkDZgAACOZYa9JdkCq5IALuV2aYltPfm0Iw1dK2QAB3g2qdVi17bZBK1XEA9zNgKRYcQeVz5BwbaiB/Aa/j2kVRzB4W5lX4Y+4g8WlHaeqGP4fHDj2R1t8dR8qgyevrC6nGegFvU6gULgaHvLB4CqtrYbMnj7DRkRzm8CYFMQAxMFP5APzAy4vEKGnQuFtfo4+xAMDQiuiUEMRgmtmvF/WMlbD1Y2tBhoEDKb+F+ZKTH2nS9aEtOWCocdi6/tenGmTBRHHsTA9tSaKPXdaWfk3OVucBf5349EpkY90q69ggWWQHr9YG8CuZfk240ZZlz2yDv3tZW8a41FEM7FGeB664hxBsPNx9O8WOuqEMz3is0ijuj4p1Fvlud+BVvFkEFyM0IaksN6Vw31jM5hiSb+hxdqCp2tGTkxP6AN8Rw8umdXtjIJ48GkeG6Z7aUWcwLHxr4hyF4utegN1p5Pdda5krD8ZvXNT2ZnOQPRW1jrbPnf7XaBXGwimAjuR7lQB4TFSA5h3fw7Hr2mHQpB+JGQqAHZdqMXP3FByOA0f+jUnMlSJTxv5nqhILpKEDFTe8BSHGLEqhOD/L29BUK/lFNCqi2xFjUTjToXvsyt2/Mc4KFOjX43JaXu5w97n+4kprxMpexJ2ysoBrrH4hJmJCOD5USvud3LQvpjmD1UddpLe0D4fy0E27HdoPj7PDbk3OYyqeNrjU/dJWw7T/dPqFrtIpQUG7LSrOcoLwBgGtF/9QZgI=';
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



