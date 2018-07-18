'use strict';

var utils = require('../util/writer.js');
var ImportAPI = require('./ImportAPIService');

module.exports.getComponent = function getComponent (req, res, next) {
  ImportAPI.getComponent(req.swagger.params,res,next);
};

module.exports.getComponentIDs = function postComponentIDs (req, res, next) {
  ImportAPI.getComponentIDs(req.swagger.params,res,next);
};

module.exports.getOperations = function getOperations (req, res, next) {
  ImportAPI.getOperations(req.swagger.params,res,next);
};
