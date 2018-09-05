'use strict'

var service = require('./databaseServiceWrapper');

module.exports = {
    createRun: function (run) {
        return service.createRun(run);
    },

    updateRuns: function (query, updateRun) {
        return service.updateRuns(query, updateRun);
    },

    deleteRun: function (run) {
        return service.deleteRun(run);
    },

    queryRun: function (query) {
        return service.queryRun(query);
    },

    getRun: function (runId){
        return service.getRun(runId);
    },

    filterIds: function(runIds){
        return service.filterIds(runIds);
    },

    getAuthentication: function(profileId){
        return service.getAuthentication(profileId);
    },

    createFileStorageAuthentication: function(authentication){
        return service.createFileStorageAuthentication(authentication);
    },

    updateFileStorageAuthentication: function(authentication){
        return service.updateFileStorageAuthentication(authentication);
    },

    getFileStorageAuthentication: function(){
        return service.getFileStorageAuthentication();
    },

    deleteFileStorageAuthentication: function(profileId){
        return service.deleteFileStorageAuthentication(profileId);
    },

    getTag: function(tag){
        return service.getTag(tag);
    },

    getTagById: function(tagId){
        return service.getTagById(tagId);
    },

    queryTag : function(tag){
        return service.queryTag(tag);
    },

    createTag: function(tag){
        return service.createTag(tag);
    },

    deleteTagById : function(componentId,tagId){
        return service.deleteTagbyId(componentId,tagId);
    },

    deleteAnnotation: function(componentId,annotationId){
        return service.deleteAnnotation(componentId,annotationId);
    },

    createAlgorithm: function (algorithm) {
        return service.createAlgorithm(algorithm);
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