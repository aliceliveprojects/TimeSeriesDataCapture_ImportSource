'use strict';

var service = require('./oneDriveService');


module.exports = {
    getComponentIDs : function(folderID){
        
        return service.getComponentIDs(folderID);
    }
}