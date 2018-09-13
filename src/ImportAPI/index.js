
'use strict';

var debug = require('debug');
var error = debug('app:error');
var log = debug('app:log');
var userCache = require('./util/users/userCache');
var fs = require('fs');



// set this namespace to log via console.log 
log.log = console.log.bind(console); // don't forget to bind to console! 
debug.log = console.info.bind(console);
error('LOGGING: Errors to stdout via console.info');
log('LOGGING: Log to stdout via console.info');
log("ENVIRONMENT: **********************");
log(process.env);
log("**********************");
console.log(process.env.debug);
var getAsBoolean = function(key){
  var result = false; 

  var ev = process.env[key] || false;

  if(ev === "true"){
    result = true;
  }

  return result;

}


var initialiseWithClustering = function () {

  var throng = require('throng');
  var WORKERS = process.env.WEB_CONCURRENCY || 1;

  log("CLUSTERING: workers: " + WORKERS);

  throng({
    workers: WORKERS,
    lifetime: Infinity
  }, initialise);

};


var initialise = function () {

  if(!process.env.SYSTEM_EXTERNAL_ID) throw new Error("undefined in environment: SYSTEM_EXTERNAL_ID");
  var systemId = process.env.SYSTEM_EXTERNAL_ID;


  var consumerApiAddress = process.env.CONSUMER_API_ADDRESS;
  var serverPort = process.env.PORT || 8000;

  log("Node: " + process.version);

  var cors = require('cors');
  var app = require('connect')();
  var http = require('http');
  var path = require('path');
  var swaggerTools = require('swagger-tools');
  var jsyaml = require('js-yaml');
  var data = require('./util/data/data');
  var auth = require('./util/authentication/authentication');
  
  app.use(cors());

  // swaggerRouter configuration
  var options = {
    swaggerUi: '/swagger.json',
    controllers: __dirname + '/controllers',
    useStubs: process.env.NODE_ENV === 'development' ? true : false // Conditionally turn on stubs (mock mode)
  };

  // The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
  var spec = fs.readFileSync(__dirname + '/api/swagger.yaml', 'utf8');
  var swaggerDoc = jsyaml.safeLoad(spec);
  var consumerApiPort = swaggerDoc.host.split(':')[1];  //WILL THROW IF PORT NOT DEFINED IN DOC
  var consumerApiScheme = swaggerDoc.schemes[0];  //WILL THROW IF SCHEMES NOT DEFINED IN DOC
  


  data.initialise(systemId, consumerApiScheme, consumerApiAddress, consumerApiPort);


  // change the standard definition to suit the server environment
  var hostAddrPort = data.getConsumerApiAddress() + ":" + data.getConsumerApiPort(); 
  swaggerDoc.host = hostAddrPort;



  // Initialize the Swagger middleware
  swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

  
    // Provide the security handlers
    app.use(middleware.swaggerSecurity({
      timeseries_admin_auth: auth.timeseries_admin_auth
    }));

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi(
       {swaggerUiDir: path.join(__dirname, '/import/swagger-ui-v2')}
    ));

    // Start the server
    var server = http.createServer(app).listen(serverPort, function () {
      var address = data.getConsumerApiAddress();
      log('SERVER: listening on %s , port %d ', address, serverPort);
    });    
  });
}

// this is for unhandled async rejections. See https://blog.risingstack.com/mastering-async-await-in-nodejs/
process.on('unhandledRejection', (err) => {  
  console.error(err);
  process.exit(1);
});

var disableClustering = getAsBoolean("DISABLE_CLUSTERING");
log("CLUSTERING: disableClustering?: " + disableClustering);
userCache.initialise(!disableClustering);
if (disableClustering === false) {
    log("CLUSTERING: initialiseWithClustering");
  initialiseWithClustering();
}else{
  log("CLUSTERING: initialise");
  initialise();
}  