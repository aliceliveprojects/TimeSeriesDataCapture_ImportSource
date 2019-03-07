'use strict';

var debug = require('debug');
var error = debug('app:error');
var log = debug('app:log');
var fs = require('fs');


// set this namespace to log via console.log 
log.log = console.log.bind(console); // don't forget to bind to console! 
debug.log = console.info.bind(console);
error('LOGGING: Errors to stdout via console.info');
log('LOGGING: Log to stdout via console.info');
log("ENVIRONMENT: **********************");
log(process.env);
log("**********************");

if (!process.env.DATABASE_HOSTNAME) throw new Error("undefined in environment: DATABASE_HOSTNAME");
if (!process.env.DATABASE_PORT) throw new Error("undefined in environment: DATABASE_PORT");
if (!process.env.DATABASE_USERNAME) throw new Error("undefined in environment: DATABASE_USERNAME");
if (!process.env.DATABASE_PASSWORD) throw new Error("undefined in environment: DATABASE_PASSWORD");
if( !process.env.DATABASE_NAME) throw new Error("undefined in environment: DATABASE_NAME");


var initialise = function () {
  var serverPort = process.env.PORT || 8000;

  log("Node: " + process.version);
 

  var cors = require('cors');
  var app = require('connect')();
  var http = require('http');
  var path = require('path');
  var swaggerTools = require('swagger-tools');
  var jsyaml = require('js-yaml');


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

  var getSwaggerUIConfig = function(){
    var result = {};
  
    result.scheme = process.env.API_SCHEME;
    result.domain = process.env.API_DOMAIN;
    result.port = process.env.API_PORT;
    result.existingPort = process.env.PORT; // assigned by Heroku if deployed.
    
    return result;
  
  }
  
  var writeSwaggerUIConfig = function(swaggerDoc, env){
  
    var doc = {};
    doc.scheme = swaggerDoc.schemes[0];  //WILL THROW IF SCHEMES NOT DEFINED IN DOC
    doc.domain = swaggerDoc.host.split(':')[0];  //WILL THROW IF HOST NOT DEFINED IN DOC 
    doc.port = swaggerDoc.host.split(':')[1];  //WILL THROW IF PORT NOT DEFINED IN DOC  
    
    if (env.existingPort){
      console.log("remote deployment has already defined port");
      if(env.port){
        
        doc.port = env.port; // override (useful for consistency, or if the remote service is not heroku, and listening on a different port.)
        console.log("external facing port env variable is set. Updating swagger.yaml with this value: %s", doc.port);
      }else{
        doc.port = 443; // override the setting with Heroku's default external facing port
        console.log("external facing port env variable is unset. Updating swagger.yaml with default value: %s", doc.port);
      }
    }else{
      console.log("local deployment.");
      if(env.port){
          doc.port = env.port; //override (useful if you have lots of servers running on local host)
          console.log("overriding swagger.yaml port to env variable: %s", doc.port);
      }else{
          env.port = doc.port;
          console.log("env varable not defined for port. Setting to default from swagger.yaml: %s ", env.port );
      }
    }
    if(env.domain){
      doc.domain = env.domain; //override (useful if you want to deploy to a different server than specified in the yaml)
      console.log("overriding swagger.yaml domain to env variable: %s", doc.domain);
    }
    if(env.scheme){
      doc.scheme = env.scheme; // override (useful if you want to deploy to a different comms scheme than that defined in the yaml.
      console.log("overriding swagger.yaml scheme to env variable: %s", doc.scheme);
    }
    
    var hostAddrPort = doc.domain + ":" + doc.port;
    var schemes = [doc.scheme];
  
    swaggerDoc.host = hostAddrPort;
    swaggerDoc.schemes = schemes;
    
    return swaggerDoc;
  }
  
  var swaggerUIConfig = getSwaggerUIConfig();
  swaggerDoc = writeSwaggerUIConfig(swaggerDoc, swaggerUIConfig);
  var serverPort = swaggerUIConfig.existingPort || swaggerUIConfig.port;
  
  // Initialize the Swagger middleware
  swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());


    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi(
      { swaggerUiDir: path.join(__dirname, './import/swagger-ui-v2') }
    ));

    
    log(__dirname);

    // Start the server
    var server = http.createServer(app).listen(serverPort, function () {
      const address = '192.168.2.1';
      log('SERVER: listening on %s , port %d ', address, serverPort);
    });

  });
}





// this is for unhandled async rejections. See https://blog.risingstack.com/mastering-async-await-in-nodejs/
process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});


initialise();
