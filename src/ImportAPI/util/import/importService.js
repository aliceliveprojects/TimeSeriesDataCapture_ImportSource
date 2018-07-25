'use strict';

const document = require('../database/documentTemplate');
const databaseService = require('../database/database')
const oneDriveService = require('../oneDrive/oneDriveService');
const uuidv4 = require('uuid/v4');
const csv = require('csvtojson');
const errorApi = require('../error/error');



function extractId(array, key) {
    var arrayLength = array.length;
    if (arrayLength > 0) {
        for (var i = 0, n = arrayLength; i < n; i++) {
            if (array[i].name === key) {
                return (array[i].id);

            }
        }
    }

    return null;
}

async function parseRunData(data) {

    var options = {
        noheader: true,
        output: 'csv',
        delimiter: 'auto'
    }

    var csvArray = await csv(options).fromString(data);

    var jsonOptions = {
        headers: [],
        rowStart: 2
    }

    for (var i = 0, n = csvArray[0].length; i < n; i++) {
        jsonOptions.headers.push(csvArray[0][i]);
    }

    var jsonObject = await parseRunArray(jsonOptions, csvArray);
    return jsonObject;
}

function parseRunArray(options, array) {
    var object = {
    }

    var headers = false || options.hasOwnProperty('headers');

    var rowStart = 0;

    if (options.hasOwnProperty('rowStart')) {
        rowStart = options.rowStart;
    }


    if (headers) {
        for (var i = 0, n = options.headers.length; i < n; i++) {
            object[options.headers[i]] = [];
        }
    } else {
        for (var i = 0, n = array[rowStart].length; i < n; i++) {
            object[i] = [];
        }
    }


    for (var row = rowStart, n = array.length; row < n; row++) {
        for (var element = 0, m = array[row].length; element < m; element++) {
            if (headers) {
                object[options.headers[element]].push(array[row][element]);
            } else {
                object[element].push(array[row][element]);
            }

        }
    }

    return object;
}

async function downloadTdata(result, algorithmID) {

    try {
        var tDataId = extractId(result['children'], 'T-Data');
        if (tDataId != null) {
            var tDataresult = await oneDriveService.getComponent(tDataId);
            var tempLogID = extractId(tDataresult['children'], 'Temperature_Log.txt');
            var runData = await oneDriveService.downloadComponent(tempLogID);

            runData = await parseRunData(runData);
            runData = await RthCalculation(algorithmID, runData);

            return runData;
        }

        return null

    } catch (error) {
        throw(error);
    }

}

async function downloadRemarks(result) {
    var remarksId = extractId(result['children'], 'Remarks');
    if (remarksId != null) {
        var remarksData = await oneDriveService.getComponent(remarksId);
        var children = remarksData['children'];
        const remarkPromises = children.map(downloadRemark)
        var annotations = await Promise.all(remarkPromises);
        return annotations;
    }

    return null;
}

async function downloadRemark(child) {
    var remark = await oneDriveService.downloadComponent(child.id);
    return (parseRemark(remark));
}

function parseRemark(remark) {
    var numberExpression = /[-0-9]+/

    var seconds = numberExpression.exec(remark)[0];
    var description = remark.split('seconds')[1];
    description = description.replace(/\r/g, '');
    description = description.replace(/\n/g, '');

    return ([seconds, description]);

}

function parseDateAndTime(dateTimeStamp) {
    dateTimeStamp = dateTimeStamp.split('-');

    return ([dateTimeStamp[0], dateTimeStamp[1]]);
}

async function RthCalculation(algorithmID, data) {

    try {
        var response = await getAlgorithm(algorithmID);
        console.log(response);
        var params = response.parameters


        var algorithmFn = Function('T1', 'T2', 'DAC', response.algorithm);
        data['RTH'] = []
        for (var i = 0, n = data['Time'].length; i < n; i++) {
            var T1 = data[params[0]][i];
            var T2 = data[params[1]][i];
            var DAC = data[params[1]][i];

            var RTH = algorithmFn(T1, T2, DAC);

            data['RTH'].push(RTH);
        }

        return data;

    } catch (error) {
        throw(error);
    }


}

async function getAlgorithm(algorithmID) {
    try {
        var response;
        if (algorithmID != undefined) {
            response = await databaseService.getAlgorithm(algorithmID);
            if (response === undefined) {
                response = await databaseService.getDefaultAlgorithm();
                console.log(response);
            }

        } else {
            response = await databaseService.getDefaultAlgorithm();
        }

        return response;

    } catch (error) {
        throw (errorApi.create500Error(error))
    }

}

async function downloadProcess(result, algorithmID) {



    try {
        var dateTimeStamp = parseDateAndTime(result['name']);
        var annotationObject = {

        }

        var data = await Promise.all([downloadTdata(result, algorithmID), downloadRemarks(result)]);
        var runData = data[0];
        var annotations = data[1];
        for (var i = 0, n = annotations.length; i < n; i++) {
            var id = uuidv4();
            var annotation = new document.Annotation(annotations[i][0], annotations[i][1]);
            annotationObject[id] = annotation;
        }

        runData = new document.Component(result.id, dateTimeStamp[0], dateTimeStamp[1], runData, annotationObject);
        console.log(runData);
        var databaseResult = await databaseService.insertRun(runData);
        console.log(databaseResult);
        databaseResult = await databaseService.queryRun(runData);
        console.log(databaseResult);
    } catch (error) {
        throw (error);
    }
}



exports.getComponent = async function (componentID, algorithmID) {
    try {
        let result = await oneDriveService.getComponent(componentID);
        await downloadProcess(result, algorithmID);
        return (componentID);
    } catch (error) {
        console.log(error)
        throw (error);
    }
}

exports.getComponentIDs = async function (folderID) {

    console.log(folderID);
    try {
        let result = await oneDriveService.getComponentIDs(folderID);
        return (result);
    } catch (error) {
        console.log(error);
        throw (error);
    }
}

exports.getOperations = async function () {

}


