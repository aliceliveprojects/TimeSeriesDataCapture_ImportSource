'use strict'

var service = require('./databaseServiceWrapper');

module.exports = {
    insertRun: function (run) {
        return service.insertRun(run);
    },

    updateRuns: function (query, updateRun) {
        return service.updateRuns(query, updateRun);
    },

    deleteRun: function (run) {
        return service.deleteRun(run);
    },

    queryRun: function (query, filter) {
        return service.queryRun(query,filter);
    },

    getAuthentication: function(profileID, filter){
        return service.getAuthentication(profileID,filter);
    },

    setAuthentication: function(authentication){
        return service.setAuthentication(authentication);
    },

    getTag: function(tag,filter){
        return service.getTag(tag,filter);
    },

    addTag: function(tag){
        return service.addTag(tag,filter);
    },

    insertAlgorithm: function (algorithm) {
        return service.insertAlgorithm(algorithm);
    },

    getAllAlgorithms: function(){
        return service.getAllAlgorithms();
    },

    getAlgorithm: function(id){
        return service.getAlgorithm(id);
    },

    getDefaultAlgorithm : function(){
        return service.getDefaultAlgorithm();
    }
}