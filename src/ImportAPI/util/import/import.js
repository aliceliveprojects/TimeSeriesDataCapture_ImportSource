'use strict';

var service = require('./importService');

module.exports = {
   
    getComponent: function(componentID){
        return service.getComponent(componentID);
    },

    getComponentIDs: function(componentIDs){
        return service.getComponentIDs(componentIDs);
    },

    getOperations: function(){
        return service.getOperations();
    }

    

}