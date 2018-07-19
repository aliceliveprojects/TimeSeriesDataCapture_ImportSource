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

    queryRun: function (query) {
        return service.queryRun(query);
    },

    insertAlgorithm: function (algorithm) {
        return service.insertAlgorithm(algorithm);
    },

    deleteAlgorithm: function (algorithm) {
        return service.deleteAlgorithm(algorithm);
    },


    queryAlgorithm: function (query) {
        return service.queryAlgorithm(query);
    }
}