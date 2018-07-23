'use strict';

const errorApi = require('../error/error');
var oneDriveService = require('../oneDrive/oneDriveService');
const csv = require('csvtojson');
const Stopwatch = require("node-stopwatch").Stopwatch;



exports.getComponent = async function (componentID) {

    /* var stopwatch = Stopwatch.create();

    var options = {
        noheader: true,
        output: 'csv',
        delimiter: 'auto'
    }
    try {
        let result = await oneDriveService.getComponent(componentID);
        let csvArray = await csv(options).fromString(result)
        result = await parseArray({},csvArray);
        
        return (result);
    } catch (error) {
        console.log(error);
        throw (error);
    } */

    try {
        let result = await oneDriveService.getComponent(componentID);
       
        var componentsChildren = 'children' in result ? componentsChildren = result['children'] : componentsChildren=[];
        var componentsChildrenLength = componentsChildren.length;
        if(componentsChildrenLength > 0){
            for(var i=0,n=componentsChildrenLength;i<n;i++){
                if(componentsChildren[i].name === 'T-Data'){
                    console.log("T_data found");
                }
            }
        }else{
            throw(errorApi.create500Error('folder does not contain any children'));
        }
        
        console.log(test);
        return(result)
    } catch (error) {
        throw(error);
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

function downloadComponent(componentID){

}

function parseRunArray(options,array){
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