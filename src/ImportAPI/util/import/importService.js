'use strict';

const errorApi = require('../error/error');


exports.getComponent = async function(componentID){
    return {
        componentID:componentID
    }
}

exports.getComponentIDs = async function(componentIDs){
    return {
        componentIDs: componentIDs
    }
}

exports.getOperations = async function(){
    return {
        good: 'ok'
    }
}
    
