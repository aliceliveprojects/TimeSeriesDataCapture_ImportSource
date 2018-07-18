'use strict';


const httpRequest = require('../http/httpRequest');
var oneDriveToken = 'EwBQA8l6BAAURSN/FHlDW5xN74t6GzbtsBBeBUYAARqG3ipnpQiC6jYxxU2LmohcAck/MXoWckn4qgb/6UexU8eeBXT28nRbMM0WkSOsPYyxecqMEgNKivMwS2ahY+9HRwXM19lghZz7R5nbXuerJ3XXtkkgGg1Ct48pwmFW6Ucbl0z6X0yDEhH+yiagcRGWGFBYK0D1dhgCA6MiYQwo4cZT7bbihoRltrnBZz5oLB5GMYDXyneoQb9UqxQgH7obfW9DgbL71ZIfA9gRxsB6ksuQTUnKTBgRleteqcGcasxcjW9ZjS7Wcc2Z22j4BNGgAzf0H1FiGVeaVwwSmE38zBCyOq0fvEPLcV7E2iPHdZK9M7sZ4oYPoWpPu+p3Wn4DZgAACDRNoqNTkPh3IAIhXcnrxdEQZG0nRXIUWrpwWbi7nGaMvIRvcV++qWLu7scJWdJ3GJO/MwFGwsxW2bhsm47wmKQLsCOVEzpgrI8l40eGTjjXYhi3hGKamjqSi7K24jz/GoDWEgHlZquRBHWTtxAkp6QC+qXG3XCfSDo7XxAkf6X2E4he4SodRyTKiPMRdw8WAL7eQqPCAI0CECkhvJxl5dGdhOb12sH3GuDPjzXrRXms2cgOKvxtO2oent7HJXG54fVaDIBFCm0AZYBztb5bc7iUwZdzqTuSbi0CjaFkeESL5Y1y3hteI2DuO2wuzYAx/hDElWquper6UIGNOTA7kyVjbbaQ2FxUFUsJFA/6ODIX6SMnwKuT/i8FoMSQU8DpBbEmXHcxeMVyrPivP6A9LMrnAlN+qC/nUF2qc+IMRn0S+8CPzVMmxirWL+TgRhDRhPr843ByS2CGY7M7cAyFh1MYQGajqE/iUAw4mzV13FQ6mybCgEB7pIE8cdnB04eSWqz2FMselbmt0yIZYJf4C59vp50e5AGhT1c9eh5vPVO4oC/EQjvPpDSuwQfAmn+HFMNudCco0vjTUZMzDcrV1r8c3uXfF+PoV7AAtR5IC4RNd3Os58w7CF2SBvBrXmm2Sha54/ilDMkq86IsMr9HszIXvyGnbxuC+iDeCVWrqLRw6o+XfrKS81Z23jOMxHGKv+FOmZwoLQXnVtXrxV6+/EOX0DTaevkYFQwVZgI='

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

function parseURL(URL){

}

exports.getComponentIDs = function (folderID) {
    return new Promise(function (resolve, reject) {
        var options = {
            protocol: 'https:',
            host: 'graph.microsoft.com',
            path: '/v1.0/me/drive/root/children',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'bearer ' + oneDriveToken
            }
        };

        httpRequest.httpRequest(options)
            .then((result) => {
                result = JSON.parse(result);
                console.log(result);
                resolve((result));
            })
            .catch((error) => {
                reject(error);
            })
    });

}

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
                result = JSON.parse(result);
                return result
            })
            .then((result) => {
                console.log(result);
                var url = new URL(result['@microsoft.graph.downloadUrl']);
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
                    resolve(result);
                })
                .catch((error) => {
                    reject(error)
                })
    

            })
            .catch((error) => {
                reject(error);
            })
            
    });

}
