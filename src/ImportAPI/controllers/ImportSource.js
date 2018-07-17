'use strict';

var utils = require('../util/writer.js');
var ImportSource = require('./ImportSourceService');

module.exports.getComponent = function getComponent (req, res, next) {
  var componentID = req.swagger.params['componentID'].value;
  ImportSource.getComponent(componentID)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getComponentIDs = function getComponentIDs (req, res, next) {
  var componentIDs = req.swagger.params['componentIDs'].value;
  ImportSource.getComponentIDs(componentIDs)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getOperations = function getOperations (req, res, next) {
  ImportSource.getOperations()
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
