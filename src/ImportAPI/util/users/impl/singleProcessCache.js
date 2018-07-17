'use strict';



var cache = {};
const EXPIRY = -1;

var read = function(key, cb){
    setTimeout(()=>{
        if(typeof cb == 'function'){
            cb(null,cache[key]);
        }
    });
}

var store = function(key, value, cb){
    setTimeout(()=>{
        cache[key]=value;
        if(typeof cb == 'function'){
            cb(null,EXPIRY); 
        }
    }); 
}

var remove = function(key, cb){
    setTimeout(()=>{
        delete cache[key];
        if(typeof cb == 'function'){
            cb(); 
        }
    }); 
}


module.exports = {
    read: read,
    store: store,
    remove: remove
};