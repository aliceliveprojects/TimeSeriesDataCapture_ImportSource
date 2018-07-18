'use strict';

var service = require('./importService');

module.exports = {
   
    getComponent: function(componentID){
        return service.getComponent(componentID);
    },

    getComponentIDs: function(folderID){
        return service.getComponentIDs(folderID);
    },

    getOperations: function(){
        return service.getOperations();
    }
}