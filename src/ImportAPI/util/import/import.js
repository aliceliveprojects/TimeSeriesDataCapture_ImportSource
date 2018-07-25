'use strict';

var service = require('./importService');

module.exports = {
   
    getComponent: function(componentID,algorithmID){
        return service.getComponent(componentID,algorithmID);
    },

    getComponentIDs: function(folderID){
        return service.getComponentIDs(folderID);
    },

    getOperations: function(){
        return service.getOperations();
    }
}