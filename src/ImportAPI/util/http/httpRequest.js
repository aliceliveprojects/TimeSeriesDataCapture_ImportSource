'use strict'

var https = require('https');

exports.httpRequest = function (options) {
    return new Promise(function (resolve, reject) {
        var result = ''
        var request = https.request(options, function (res) {

            res.on('data', function (chunk) {
                result += chunk
            });

            res.on('end', function () {

                result = {
                    statusCode: res.statusCode,
                    result: result
                }

                result = JSON.stringify(result);
              
                if(res.statusCode == 200 || res.statusCode == 302){
                    console.log('httpGood');
                    resolve(result);
                }else{
                    console.log('httpBad')
                    reject(result); 
                }
                
            });
        });

        request.on('error', function (error) {
            console.log(error);
            reject(error)
        });

        request.end();
    });
}