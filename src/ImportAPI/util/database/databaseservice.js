'use strict';

var {Pool} = require('pg');
var debug = require('debug');
var log = debug('app:log');
var error = require('../error/error');

var thePool = null;
var theConfig = null;


var initialise = function (url, needsSSL) {
  if (needsSSL == true) {
    url += "?sslmode=require"
  } 

  if (thePool) {
    thePool.end();
  };

  theConfig = null;

  theConfig = {
    connectionString: url,
    ssl:needsSSL
  };

  log("DB: " + url);
  thePool = new Pool(theConfig);
};

var old_query = function (text, params) {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    thePool.query(text, params, (err, res) => {
        const duration = Date.now() - start;
       
        if(err){
          console.log('executed query', { text, duration});
          reject(error.create500Error("SQL error"));
        }else{
          console.log('executed query', { text, duration, rows: res.rowCount });
          resolve(res);
        }
    });
  });

};

var query = async function (text, params){
  var result = null;
  const client = await thePool.connect();
  try{
    result = client.query(text, params);
  }catch(e){
    throw (error.create500Error("SQL error"));    
  }finally{
    client.release();
  }
  return result;

};


var multiQuery = async function (queries){

  var results = [];
  const client = await thePool.connect();
  try{
    await client.query('BEGIN');
    for (var index = 0; index < queries.length; index++){
      var query = queries[index];
      var text = query.text;
      var values = query.values;
      results.push( await client.query(text, values));
    }
    await client.query('COMMIT');
  }catch(e){
    await client.query('ROLLBACK');
    
    throw(error.create500Error("SQL error"));    
  }finally{
    client.release();
  }
  return results;

}




var createTabularQuery = (query) => { 
    return {
      query: query,
      header: [],
      rows: []
    }
  };


  var createTableHeader = (jsonRow) => {
    var result =  Object.keys(jsonRow);
    return result;
  }

  var createRow = (header, jsonRow) => {
    var result = null;

    var row = []; 
    for(var index = 0; index < header.length; index++){
      var colName = header[index];
      var value = jsonRow[colName];
      row.push(value);
    }

    result = row;

    return result;
  }


  var createRows = (header, jsonRows) => {
    var result = null;
    var rows = [];

    for (var index = 0; index < jsonRows.length; index++){
      rows.push(createRow(header,jsonRows[index]));
    }
    result = rows;

    return result;
  }

  var populateAsTable = (tabularOutput, jsonRows) => {

    var header = [];
    var rows = [];
    if(jsonRows && jsonRows.length > 0){
      header = createTableHeader(jsonRows[0]);
      rows = createRows(header, jsonRows);
    }
    tabularOutput.header = header;
    tabularOutput.rows = rows;
    delete tabularOutput.query;

  }


  var multiTabularQuery = async (
    tabularQueries
    )=>{

      var results = null;
      const client = await thePool.connect();
      try{
        await client.query('BEGIN');
        for (var index = 0; index < tabularQueries.length; index++){
          var tabularQuery = tabularQueries[index];
          var query = tabularQuery.query;
          var text = query.text;
          var values = query.values;
          var response = await client.query(text, values);
          var rows = null;
          if(response.rows){
            if(response.rows.length > 0){
              rows = response.rows;
            }
          }

          populateAsTable(tabularQuery,rows);

        }
        await client.query('COMMIT');
        results = tabularQueries;
      }catch(e){
        await client.query('ROLLBACK');
        
        throw(error.create500Error("SQL error"));    
      }finally{
        client.release();
      }
      return results;

      return result;
    }


module.exports = {
  initialise: initialise,
  query: query,
  multiQuery: multiQuery,
  createTabularQuery: createTabularQuery,
  multiTabularQuery: multiTabularQuery


};