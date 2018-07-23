'use strict';

const errorApi = require('../error/error');
const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBQA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAATmDYkHWxruoQyV0pkXKV5JRCpbqEFJKv8QzB+aR0dELRFt0meuUXApslEgg5xQoHdGYC9MPCqcfIlfimDgDUEmh8jvsk9gE8K/B/2ymauzk61zQGw84Er6/rlJ0ZLrcHbR4xPOYV6fK16Np1UP7NEUnEIUjUEMr8njo7Sn9hFKzxbk8wUy0mT1k0ESaDDDeONIRx24K/JxIRQkQkje1CkVcor8DZDJJFd69k6afQDFBu+U+Z6QCjV1FMuBjk+MocdnX3Dj7KGfNnnasXer719bP1uWWpZRCrdFzpMo9krXfVaDvpFUmhS0nU43Ltp2uSci1XB2XpSmjLhyugO7v2hQDZgAACNRPXFAQTF2FIAKurIiQuKJbAHCtaVnQRqTP0S813jPc6+9Ko17QMmNtA8OcgixUc6Xgsbzdv73Z9QA7PBnNGkax3XShO/S9EkCUEr0b+Dy9Os8A23xRu0Ct4K7Y/Fvkx2ioDqvjGe5I4fg/CqUfdq2JpgMLX1XXeS98Clpra01EpUBoO1+lhNz4u+xv1nGdqjo2N4x/LBlSBqM9WmMxHvZkTJwxvRtduY5vKPoMy4GCieV1X7XYlVDypM5QYzSVhmDwQSwINH9rLWb6l/CU2Qqk03Rvye3eh7fx4Hs5+1+5lhfooxV2+Kzx9YNYfuJEH6qDeOEXLWsfwK4Lee/Z+WNQFOiI23GqvR08OrW0/J6+TUYW+24hxmAsDhg5lOdMkonMKm7l3pkWGlM1ukghu/CPpJ8EXGA3H4BKing2SS3Yx7wBGZtEifIp8i3suSqiq9TqkzEU3V/ha9YZ6akxFTtZzyGYbkBh0H/L8mdZdWYbj+Tc7R05ieMfCfFqKI+v4elskgJ2Dtp+eSRPogzOqremo9OspOEvFYy1+iGq5Di8K404wjYwAlSlKiHf9QzwBD4jPT3hQ0vxt0dB9QfNN/ui6gngeWzQqAfNEv5ev39t4ZpCMKDGoAkKQ6IwFwpCDaIOM+nd1FZm+B3VcwkZIVSO0+4xU2mHkN580gvLGLjAJJ387q74a+AoDTzAWqRKPp6mtHKs9IdaqDFspFoi9uy36LdvtpizQcUXZgI='
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

    return (errorApi.createError(errorCode,errorResponse));

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
        }
    };

    try {
        var response = await httpRequest.httpRequest(options);
        var result = parseResponse(response);
        if (result[1] != null) {
            return (parseComponentIds(JSON.parse(result[1])));
        } else {
            return (response);
        }
    } catch (error) {
        console.log(error);
        error = parseResponse(error);
        throw (parseError(error));
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
        }
    };

    try {
        var response = await httpRequest.httpRequest(options);
        response = parseResponse(response);
        if (response[1] == null) {
            throw (errorApi.create500Error('Internal Server Error'));
        }

        response = JSON.parse(response[1]);
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
        var result = parseResponse(response);

        if (result[1] != null) {
            throw (result[1]);
        } else {
            response(result);
        }
    } catch (error) {
        error = parseResponse(error);
        throw (parseError(error));
    }
}




exports.getComponent = async function (componentID) {
    var select = encodeURI('select=id,name,folder');
    var options = {
        protocol: 'https:',
        host: 'graph.microsoft.com',
        path: '/v1.0/me/drive/items/' + encodeURI(componentID) + '?expand=children(select=id,name)' +'&'+select,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'bearer ' + oneDriveToken
        }
    };

    try {
        var response = await httpRequest.httpRequest(options);
        var result = parseResponse(response);
        if (result[1] != null) {
            return (JSON.parse(result[1]));
        } else {
            return (response);
        }
    } catch (error) {
        console.log(error);
        error = parseResponse(error);
        throw (parseError(error));

    }
}



