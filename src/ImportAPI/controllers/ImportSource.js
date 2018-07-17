'use strict';

var utils = require('../util/writer.js');
var ImportSource = require('./ImportSourceService');

module.exports.getComponent = function getComponent (req, res, next) {
  ImportSource.getComponent(req.swagger.params,res,next);
};

module.exports.getComponentIDs = function getComponentIDs (req, res, next) {
  ImportSource.getComponentIDs(req.swagger.params,res,next);
};

module.exports.getOperations = function getOperations (req, res, next) {
  ImportSource.getOperations(req.swagger.params,res,next);
};
