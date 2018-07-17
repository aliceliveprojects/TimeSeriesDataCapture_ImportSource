var service = require('./tokenService');

module.exports = {

    getAuthenticate: function(){
      return service.getAuthenticate()
    },
}
