'use strict';

var service = require('./browseService');

module.exports = {
   

    componentSearch: function(search,page,pagesize){
        return service.componentSearch(search,page,pagesize);
    },

    deleteComponent: function(componentID){
        return service.deleteComponent(componentID);
    },

    getAuthenticate: function(){
        return service.getAuthentication();
    },

    getComponent: function(componentID){
        return service.getComponent(componentID)
    },

    getComponentIDs: function(){
        return service.getComponentIDs();
    },

    postAuthenticate: function(fileStorageToken){
        return service.postAuthenticate(fileStorageToken);
    },

    postComponentIDs : function(componentIDs){
        return service.postComponentIDs(componentIDs);
    },

    updateComponent: function(componentID,component){
        return service.updateComponent(componentID,component)
    }

}