'use strict';


/**
 * Downloads a specific component
 * Downloads a specific component by component ID
 *
 * componentID String Component ID specifies which component to download 
 * returns File
 **/
exports.getComponent = function(componentID) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Gets IDs available for import
 * Gets all the component IDs available for import
 *
 * componentIDs List 
 * returns List
 **/
exports.getComponentIDs = function(componentIDs) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ "component_id", "component_id" ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * Gets supported operations
 * Gets currently supported operations
 *
 * returns List
 **/
exports.getOperations = function() {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = [ "Compare", "Compare" ];
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

