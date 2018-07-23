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
        result = await parseArray({},csvArray);
        console.log(result)
        stopwatch.stop();
        console.log(stopwatch.elapsedMilliseconds);
        return (result);
    } catch (error) {
        console.log(error);
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
    console.log(array[0]);
    var object = {
    }

    var headers = false || options.hasOwnProperty('headers');

    if(headers){
        for(var i=0,n=options.headers.length;i<n;i++){
            object[header] = [];
        }
    }else{
        for(var i=0, n=array[rowStart].length;i<n;i++){
            object[i] = [];
        }
    }


    for(var row=0, n=array.length;row<n;row++){
        for(var element=0, m =array[row].length;element<m;element++){
            object[element].push(array[row][element]);
        }
    }
   
   return object;
}