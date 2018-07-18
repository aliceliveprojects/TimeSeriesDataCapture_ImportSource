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
                if(res.statusCode == 200 || res.statusCode == 302){
                    resolve(result);
                }else{
                    result = JSON.parse(result)
                    result.statusCode = res.statusCode;
         
                    result = JSON.stringify(result);
                    reject(result)
                   
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