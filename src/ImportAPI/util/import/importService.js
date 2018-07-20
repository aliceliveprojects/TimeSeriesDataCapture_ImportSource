'use strict';

const errorApi = require('../error/error');
var oneDriveService = require('../oneDrive/oneDriveService');
const csv = require('csvtojson');
const Stopwatch = require("node-stopwatch").Stopwatch;



exports.getComponent = async function (componentID) {

    var stopwatch = Stopwatch.create();

    var options = {
        noheader: true,
        output: 'csv',
        delimiter: 'auto'
    }
    try {
        let result = await oneDriveService.getComponent(componentID);
        var csvArray = await csv(options).fromString(result)
        stopwatch.start();
        result = await parseArray(csvArray);
        console.log(result)
        stopwatch.stop();
        console.log(stopwatch.elapsedMilliseconds);
        return (result);
    } catch (error) {
        throw (error);
    }

}

exports.getComponentIDs = async function (folderID) {

    console.log(folderID);
    try {
        let result = await oneDriveService.getComponentIDs(folderID);
        return (result);
    } catch (error) {
        throw (error);
    }




}

exports.getOperations = async function () {

}

function parseArray(options,array){
    var object = {
        0 : [],
        1 : [],
        2 : [],
        3 : [],
        4 : [],
        5 : [],
        6 : []
    }

    var columns =0;
    array.forEach(row => {
        row.forEach(element => {
            object[columns].push(element);
            columns++;
        })    
        columns =0 ;
    });

   return object;
}