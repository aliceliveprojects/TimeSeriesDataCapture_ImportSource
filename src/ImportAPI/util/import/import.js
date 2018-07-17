'use strict';

var service = require('./importService');

module.exports = {
   
    getComponent: function(componentID){
        return service.getComponent(componentID);
    },

    postComponentIDs: function(componentIDs){
        return service.postComponentIDs(componentIDs);
    },

    getOperations: function(){
        return service.getOperations();
    }

    

}