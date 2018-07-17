'use strict';

/**
 * The user cache is the gateway (bottleneck?) to a mapping of the identifiers of users belonging to the external authentication service, with their representations internal to this service.
 * This means that we can partially de-couple the authentication service from the main application.
 * All useage of the API is authenticated. The user (member / admin) part of the API relies on the user's external id and authorised scopes being passed in the authentication header,
 * so that it can work out what access can be granted internally.
 * The external id is mapped to an internal id, so that other internal mappings are independent.
 * On every single call to the API, the external id is checked to see that it corresponds with an internal id. If it doesn't then one is created. All external ids are cached locally, so that calls to th DB are minimsed.
 */

var cache = null;
const error = require('../error/error');
const Sql = require('../sql/sql');


var initialise = function (isClustered) {
  if (isClustered) {
    cache = require('memored');
  } else {
    cache = require('./impl/singleProcessCache')
  }
}

var cacheRead = function (key) {
  return new Promise(
    (resolve, reject) => {
      cache.read(key, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    }
  );
};
var cacheWrite = function (key, value) {
  return new Promise(
    (resolve, reject) => {
      cache.store(key, value, (err, expiry) => {
        if (err) {
          reject(err);
        } else {
          resolve(expiry);
        }
      });
    }
  );
};
var cacheRemove = function (key) {
  return new Promise(
    (resolve, reject) => {
      cache.remove(key, () => {
        resolve();
      });
    }
  );
};



/**
 * Creates a new internal id for an external id. 
 * If an entry for the external id already exists, then return the internal id.
 * @param {*} externalId 
 */
var createInternalId = (externalId) => {
  return new Promise(
    (resolve, reject) => {

      Sql.createUser(externalId)
        .then((internalId) => {
          if (!internalId) {
            reject(error.create500Error("could not find new interal id"));
          } else {
            resolve(internalId);
          }
        })
        .catch((err) => {
          reject(error.create500Error("could not create new internal id"));
        });
    }
  );
};

var remove = (externalId) => {
  return new Promise((resolve, reject) => {

    Sql.deleteUser(externalId)
      .then((internalId) => {
        cacheRemove(externalId)
          .then(
          () => {
            if (!internalId) {
              reject(error.create500Error("proof of delete was not found. Deleted already?"));
            } else {
              resolve(internalId);
            }
          });
      })
      .catch((err) => { reject(err) });
  });
}

var read = (externalId) => {
  return new Promise(
    (resolve, reject) => {

      Sql.readUser(externalId)
        .then(
        (internalId) => {
          if (!internalId) {
            createInternalId(externalId)
              .then((internalId) => {
                cacheWrite(externalId, internalId)
                  .then((expiry) => {
                    resolve(internalId);
                  }
                  );
              })
              .catch((err) => {
                reject(err);
              })
          } else {
            cacheWrite(externalId, internalId);
            resolve(internalId);
          }
        }
        )
        .catch(
        (err) => {
          reject(error.create500Error("there was a problem getting to the database"));
        }
        );
    }
  );
}



var mapUser = function (externalId) {
  return new Promise(
    (resolve, reject) => {
      // attempt to get the internalId from the cache

      cacheRead(externalId)
        .then((internalId) => {
          if (internalId) {
            resolve(internalId);
          } else {
            read(externalId)
              .then((internalId) => {
                resolve(internalId);
              })
              .catch((err) => {
                reject(err);
              })
          }
        }, (err) => { reject(err); });

    });


}


var removeUser = function (externalId) {
  return remove(externalId);
}




module.exports = {
  removeUser: removeUser,
  mapUser: mapUser,
  initialise: initialise
}