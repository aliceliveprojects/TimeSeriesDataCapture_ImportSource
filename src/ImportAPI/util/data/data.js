'use strict';
var Promise = require('promise');
var UserData = require('../../model/UserData');
var errorApi = require('../error/error');
var dbApi = require('../database/database.js');
var Sql = require('../sql/sql');
var userCache = require('../users/userCache');
var auth = require('../authentication/authentication');

var EXTERNAL_SYSTEM_ID = null;
var CONSUMER_API_ADDRESS = null;
var CONSUMER_API_PORT = null;
var CONSUMER_API_SCHEME = null;

const UNDEFINED = -1;

/**
 * initialises the data API with an Id for a SYSTEM user.
 * The SYSTEM user represents a super-entity, which owns data within the database, 
 * such as the base templates for Plans. 
 * @param {*} externalIdSystem 
 */
var initialise = (externalIdSystem, consumerApiScheme, consumerApiAddress, consumerApiPort) => {

  EXTERNAL_SYSTEM_ID = externalIdSystem;
  CONSUMER_API_SCHEME = consumerApiScheme;
  CONSUMER_API_ADDRESS = consumerApiAddress;
  CONSUMER_API_PORT = consumerApiPort;

}

var getExternalSystemId = () => {
  var result = null;
  if (EXTERNAL_SYSTEM_ID) {
    result = EXTERNAL_SYSTEM_ID;
  } else {
    throw errorApi.create500Error("SYSTEM WAS NOT INITIALISED.");
  }


  return result;
}

var createConsumerApiAddress = () => {
  
    // Local ip address that we're trying to calculate
  var  address = null;
    // Provides a few basic operating-system related utility functions (built-in)
  var os = require('os')
    // Network interfaces
    , ifaces = os.networkInterfaces();


  // Iterate over interfaces ...
  for (var dev in ifaces) {

    // ... and find the one that matches the criteria
    var iface = ifaces[dev].filter(function (details) {
      return details.family === 'IPv4' && details.internal === false;
    });

    if (iface.length > 0) address = iface[0].address;
  }

  if(!address){
    throw new Error("unable to generate consumer API address.");
  }
  
  return address;

}


var getConsumerApiAddress = () => {
  var result = null;
  if (!CONSUMER_API_ADDRESS) {
    CONSUMER_API_ADDRESS = createConsumerApiAddress();
  }
  result = CONSUMER_API_ADDRESS;
  return result;
}

var getConsumerApiScheme = () => {
    return CONSUMER_API_SCHEME;
}


var getConsumerApiPort = () => {
  return CONSUMER_API_PORT;
}


// ------- USERS

var createScopeInfo = (externalId, scopes) => {
  return {
    externalId: externalId,
    scopes: scopes
  }
};

var adminGetUserIds = (page, size, organisationId, authentication) => {
  return new Promise((resolve, reject) => {
    if (!organisationId) {
      memberGetUserIds(page, size, organisationId, authentication)
        .then((internalIds) => {
          resolve(internalIds)
        })
        .catch((err) => { reject(err) });
    } else {
      reject(errorApi.createNotYetImplemented("adminGetUserIds"));
    }
  });
};

var memberGetUserIds = (page, size, organisationId, authentication) => {
  return new Promise((resolve, reject) => {
    if (page > 1) {
      setTimeout(() => {
        resolve([]);
      });
    } else {
      userCache.mapUser(authentication.externalId)
        .then((internalId) => {
          var array = [];
          var user = new UserData(authentication.externalId, internalId);
          array.push(user);
          resolve(array);
        })
        .catch((err) => {
          reject(err);
        });
    }
  });
};


/**
 * returns an array of internal user ids
 * if the organisation id is not specified, returns only the internal user id for an external user id.
 * if the organisation id is specified, returns internal user ids associated with the organsiation id, but only if the userid
 */
var getUserIds = (page, size, organisationId, scopeInfo) => {
  return new Promise(
    (resolve, reject) => {
      if (scopeInfo.scopes.indexOf(auth.SUPPORTED_SCOPES.admin) != UNDEFINED) {
        adminGetUserIds(page, size, organisationId, scopeInfo)
          .then((result) => { resolve(result) })
          .catch((err) => { reject(err) });
      } else if (scopeInfo.scopes.indexOf(auth.SUPPORTED_SCOPES.member) != UNDEFINED) {
        memberGetUserIds(page, size, organisationId, scopeInfo)
          .then((result) => {
            resolve(result)
          })
          .catch((err) => { reject(err) });
      } else {
        setTimeout(() => {
          reject(errorApi.create403Error("wrong scope for operation."));
        });
      }
    }
  );
}

/**
 * Deletes a user, from their internal username.
 * The current scope allows a user only to remove themselves
 * from the application. 
 * Removal of anyone else is forbidden  
 * @param {*} user_id 
 * @param {*} scopeInfo 
 */
var deleteUser = (userId, scopeInfo) => {
  return new Promise(
    (resolve, reject) => {
      userCache.mapUser(scopeInfo.externalId)
        .then((internalId) => {
          if (internalId == userId) { //can only remove ourselves!
            var user = new UserData(scopeInfo.externalId, internalId);
            userCache.removeUser(user.external_id)
              .then(resolve(user))
              .catch((err) => { reject(err) });
          } else {
            reject(errorApi.create403Error("cannot delete a user which is not yourself."));
          }
        })
        .catch((err) => {
          reject(err);
        });
    }
  );
}
/**
 * returns a not yet implemeneted error
 * The API doesn't really have a need to add a user.
 * All users should be added to the system, when they authenticate,
 * and use an API.
 * Even admin users, shouldn't be able to 'add' users. They should
 * simply be able to remove them from organisations.
 * @param {*} external_id 
 * @param {*} scopeInfo 
 */
var putUser = (externalId, scopeInfo) => {
  return new Promise(
    (resolve, reject) => {
      setTimeout(() => {
        reject(errorApi.create403Error("cannot PUT a new user. Sorry."));
      });
    });
}


// ------- COURSES

/**
 * creates a course for the specified user only
 * 
 * @param {*} userId
 */
var createUserCourse = async (userId) => {
  var result = null;

  try {
    result = await Sql.createCourseForUser(userId);
  } catch (e) {
    throw errorApi.create500Error(e.message);
  }
  return result;
}


var isUserOwnerOfCourse = async (userId, courseId) => {
  var result = null;
  try {
    result = await Sql.isUserOwnerOfCourse(userId, courseId);
  } catch (e) {
    throw errorApi.create500Error(e.message);
  }
  return result;
}

var isConsumerOwnerOfCourse = async (deploymentId, courseId) => {
  var result = null;
  try {
    result = await Sql.isConsumerOwnerOfCourse(deploymentId, courseId);
  } catch (e) {
    throw errorApi.create500Error(e.message);
  }
  return result;
}


var canUserAccesPlan = async (userId, planId) => {
  var result = false;
  try {

    var systemUserId = await userCache.mapUser(getExternalSystemId());
    var systemOwnsPlan = await Sql.isUserOwnerOfPlan(systemUserId, planId);

    if (systemOwnsPlan) {
      result = true;
    } else {
      var userOwnsPlan = await Sql.isUserOwnerOfPlan(userId, planId);
      if (userOwnsPlan) {
        result = true;
      }
    }
  } catch (e) {
    throw errorApi.create500Error(e.message);
  }
  return result;
}

var doDeleteCourse = async (courseId) => {
  var result = null;
  try {
    result = await Sql.deleteCourse(courseId);
  } catch (e) {
    throw errorApi.create500Error(e.message);
  }
  return result;
}

var doGetUserCourses = async (userId, page, size) => {
  var result = null;
  try {
    result = await Sql.getUserCourses(userId, page, size);
  } catch (e) {
    throw errorApi.create500Error(e.message);
  }
  return result;
}


var doPutUserCoursesDeploy = async (courseId, tokenState) => {
  var result = null;
  try {
    var intermediate = await Sql.createDeploymentEntry(courseId, tokenState);
    var apiAddrPort = getConsumerApiScheme() + "://" + getConsumerApiAddress() + ":" + getConsumerApiPort();

    var token = auth.createConsumerToken(apiAddrPort,intermediate.id, intermediate.state);

    var entry = await Sql.updateDeploymentEntry(intermediate.id, intermediate.state, token);

    result = {
      token: token,
      token_state: entry.state,
      id: entry.id
    };

  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return result;

}


var doGetUserCoursesDeploy = async (courseId, page, size) => {
  var result = null;
  try {
    result = await Sql.getCourseDeployments(courseId, page, size);
  } catch (e) {
    throw errorApi.create500Error(e.message);
  }
  return result;
}

var doGetConsumerCourseVersion = async (courseId) => {
  var result = null;

  try {
    result = await Sql.getConsumerCourseVersion(courseId);

  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return result;
};



var doGetConsumerCourse = async (courseId) => {

  var result = null;

  try {
    var result = await Sql.getConsumerCourse(courseId);

  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return result;


}


var doGetDeployedCourseInfo = async (deploymentId) => {
  var result = null;

  try {
    result = await Sql.getDeployment(deploymentId);

  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return result;

}


var doDeleteUserCoursesDeploy = async (deploymentId) => {
  var result = null;

  try {
    result = await Sql.deleteDeployment(deploymentId);

  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return result;
};


var doUpdateUserCoursesDeploy = async (deploymentId, tokenState) => {
  var result = null;

  try {
    var token = auth.createConsumerToken(deploymentId, tokenState);

    var entry = await Sql.updateDeploymentEntry(deploymentId, tokenState, token);

    result = {
      token: token,
      token_state: entry.state,
      id: entry.id
    };

  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return result;
}


var doSearchTemplatePlans = async ($page, $size, name, description, instructions, userId) => {
  var result = null;
  var page = undefined;
  var size = undefined;


  if ($page) { // page is 1 based
    page = parseInt($page);
  }

  if ($size) { // size is 1 based
    size = parseInt($size);
  }

  var list = null;

  try {

    var systemUserId = await userCache.mapUser(getExternalSystemId());
    var userIds = [systemUserId]; // system templates and templates owned by the user.
    if (userId) {
      userIds.push(userId);
    }

    list = await Sql.searchPlans(page, size, name, description, instructions, null, true, { userIds: userIds });

    result = list;

  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return result;

}

var doSearchActivePlans = async ($page, $size, name, description, instructions, courseId) => {
  var result = null;
  var page = undefined;
  var size = undefined;


  if ($page) { // page is 1 based
    page = parseInt($page);
  }

  if ($size) { // size is 1 based
    size = parseInt($size);
  }

  var list = null;

  try {

    list = await Sql.searchPlans(page, size, name, description, instructions, "", false, { courseId: courseId }); // options: {courseId: courseId, userId: userId} are mutually exclusive;

    result = list;

  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return result;

}

var doPutUserActivePlan = async (templatePlanId, courseId, userId) => {

  var result = null;

  try {

    var response = await Sql.createActivePlan(templatePlanId, courseId, userId);

    result = response;


  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return response;
};
var doPutConsumerCourseData = async (courseId, tables) => {

  var result = null;

  try {

    var response = await Sql.putConsumerCourseData(courseId, tables);



    result = response;


  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return response;
};

var doDeleteUserActivePlan = async (activePlanId) => {

  var result = null;

  try {

    var response = await Sql.deleteActivePlan(activePlanId);
    result = response;


  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return response;
};



/**
 * creates a course for the specified user, within the specified organisation
 * @param {*} userId 
 * @param {*} organisationId 
 * @param {*} scopeInfo 
 */
var createCourse = async (userId, organisationId, scopeInfo) => {
  var result = null;
  var internalId = await userCache.mapUser(scopeInfo.externalId);
  if (!organisationId) {
    if (userId && (userId != internalId)) {
      throw errorApi.createNotYetImplemented("creating a course for someone else is not yet supported.");
    } else {
      result = await createUserCourse(internalId);
    }
  } else {
    throw errorApi.createNotYetImplemented("creating a course for association with an organisation is not yet supported");
  }
  return result;
};

/**
 * deletes a course 
 * @param {*} courseId 
 * @param {*} scopeInfo 
 */
var deleteCourse = async (courseId, scopeInfo) => {
  var result = null;
  var internalId = await userCache.mapUser(scopeInfo.externalId);
  var isOwner = await isUserOwnerOfCourse(internalId, courseId);
  if (!isOwner) {
    throw errorApi.createNotYetImplemented("deleting a course for someone else is not yet supported.");
  } else {
    var result = doDeleteCourse(courseId);
  }
  return result;
}


var getUserCourses = async (userId, organisationId, page, size, scopeInfo) => {
  var result = null;
  var internalId = await userCache.mapUser(scopeInfo.externalId);
  if (!organisationId) {
    if (userId && (userId != internalId)) {
      throw errorApi.createNotYetImplemented("listing other user's courses is not yet supported.");
    } else {
      result = await doGetUserCourses(internalId, page, size);
    }
  } else {
    throw errorApi.createNotYetImplemented("courses by organisation is not yet supported.");
  }
  return result;
}


var putUserCoursesDeploy = async (courseId, tokenState, scopeInfo) => {
  var result = null;

  var internalId = await userCache.mapUser(scopeInfo.externalId);

  var userOwnsCourse = await isUserOwnerOfCourse(internalId, courseId);
  if (userOwnsCourse) {
    result = await doPutUserCoursesDeploy(courseId, tokenState);
  } else {
    throw errorApi.createNotYetImplemented("deploying other user's courses is not yet supported.");
  }


  return result;
}

var deleteUserCoursesDeploy = async (deploymentId, scopeInfo) => {
  var result = null;

  var internalId = await userCache.mapUser(scopeInfo.externalId);

  var deploymentInfo = await doGetDeployedCourseInfo(deploymentId);

  var courseId = deploymentInfo.course_id;

  if (courseId) {
    var userOwnsCourse = await isUserOwnerOfCourse(internalId, courseId);
    if (userOwnsCourse) {
      result = await doDeleteUserCoursesDeploy(deploymentId);
    } else {
      throw errorApi.createNotYetImplemented("deleting other user's courses is not yet supported.");
    }
  } else {
    throw errorApi.createNotYetImplemented("deployment not found.");
  }


  return result;
}


var postUserCoursesDeploy = async (deploymentId, tokenState, scopeInfo) => {
  var result = null;

  var internalId = await userCache.mapUser(scopeInfo.externalId);

  var deploymentInfo = await doGetDeployedCourseInfo(deploymentId);

  var courseId = deploymentId.courseId;


  if (courseId) {
    var userOwnsCourse = await isUserOwnerOfCourse(internalId, courseId);
    if (userOwnsCourse) {
      result = await doUpdateUserCoursesDeploy(deploymentId, tokenState);
    } else {
      throw errorApi.createNotYetImplemented("deleting other user's courses is not yet supported.");
    }
  } else {
    throw errorApi.createNotYetImplemented("deployment not found.");
  }


  return result;
}



var getUserCoursesDeploy = async (courseId, page, size, scopeInfo) => {
  var result = null;
  var internalId = await userCache.mapUser(scopeInfo.externalId);
  var userOwnsCourse = await isUserOwnerOfCourse(internalId, courseId);
  if (userOwnsCourse) {
    var result = await doGetUserCoursesDeploy(courseId, page, size);
  } else {
    throw errorApi.createNotYetImplemented("listing other user's course deployments is not yet supported.");
  }

  return result;
}


var getConsumerCoursesVersion = async (
  deploymentId, 
  courseId, 
  headerInfo, 
  scopeInfo) => {
  var result = null;

  await throwInvalidConsumerToken(deploymentId, headerInfo);

  var consumerOwnsCourse = await isConsumerOwnerOfCourse(deploymentId, courseId);
  if (consumerOwnsCourse) {
    result = await doGetConsumerCourseVersion(courseId);
  } else {
    throw errorApi.create403Error("the authorisation does not match the course requested.");
  }

  return result;
}



var getUserTemplatePlans = async (
  $page,
  $size,
  name,
  description,
  instructions,
  userId,
  organisationId,
  scopeInfo) => {

  var result = null;

  var internalId = await userCache.mapUser(scopeInfo.externalId);

  if (userId) {
    if (internalId != userId) {
      throw errorApi.createNotYetImplemented("listing other user's template plans is not yet supported.");
    }
  }
  if (organisationId) {
    throw errorApi.createNotYetImplemented("listing template plans defined by another organisation is not yet supported.");
  }

  result = doSearchTemplatePlans($page, $size, name, description, instructions, userId);

  return result;

}


var getUserActivePlans = async (
  $page,
  $size,
  name,
  description,
  instructions,
  userId,
  organisationId,
  course_id,
  scopeInfo) => {

  var result = null;

  var internalId = await userCache.mapUser(scopeInfo.externalId);

  if (userId) {
    if (internalId != userId) {
      throw errorApi.createNotYetImplemented("listing other user's active plans is not yet supported.");
    }
  }
  if (organisationId) {
    throw errorApi.createNotYetImplemented("listing active plans defined by another organisation is not yet supported.");
  }

  result = doSearchActivePlans($page, $size, name, description, instructions, course_id);

  return result;

}

var deleteUserActivePlans = async (
  activePlanId,
  scopeInfo) => {

  var result = null;

  if (!activePlanId) {
    throw errorApi.create400Error("the active plan id was not specified");
  }



  var internalId = await userCache.mapUser(scopeInfo.externalId);

  var canAccessPlan = await canUserAccesPlan(internalId, activePlanId);

  if (canAccessPlan) {
    result = doDeleteUserActivePlan(activePlanId);

  }


  return result;


}




var putUserActivePlans = async (
  templatePlanId,
  courseId,
  scopeInfo) => {

  var result = null;

  if (!templatePlanId) {
    throw errorApi.create400Error("the template plan id was not specified");
  }

  if (!courseId) {
    throw errorApi.create400Error("the course id was not specified");
  }

  var internalId = await userCache.mapUser(scopeInfo.externalId);
  var ownsCourse = await isUserOwnerOfCourse(internalId, courseId);

  if (!ownsCourse) {
    throw errorApi.createNotYetImplemented("altering another user's course is not yet supported.");
  }

  var canAccessPlan = await canUserAccesPlan(internalId, templatePlanId);

  if (!canAccessPlan) {
    throw errorApi.create403Error("the plan is not accessible");
  }

  var response = await doPutUserActivePlan(templatePlanId, courseId, internalId);

  result = response;

  return result;

}


var getConsumerCourses = async (
  deploymentId,
  headerInfo,
  scopeInfo) => {


  var result = null;

  await throwInvalidConsumerToken(deploymentId, headerInfo);

  var deploymentInfo = await doGetDeployedCourseInfo(deploymentId);
  var state = deploymentInfo.state;
  var courseId = deploymentInfo.course_id;
  var accessible = false;

  switch(state){
    case dbApi.constants.DEPLOYMENT_STATE_TYPES.DOWNLOAD:
    case dbApi.constants.DEPLOYMENT_STATE_TYPES.DEMO:
    accessible = true;
  }

  if(accessible){
    var consumerOwnsCourse = await isConsumerOwnerOfCourse(deploymentId, courseId);
    if (consumerOwnsCourse) {
      var data = await doGetConsumerCourse(courseId);
 
      var newDeploymentInfo = await renewDeploymentToken(deploymentId);
      result = {
        data: data,
        authorisation: {
           data: newDeploymentInfo.token
        }
      };

    } else {
      throw errorApi.create403Error("the authorisation does not match the course requested.");
    }
  }else{
    throw errorApi.create403Error("this course isn't accessible for download right now.");
  }
  return result;


}


/**
 * We intended making out data transfer easier, by transferring items in tables. 
 * Each table would comprise:
 * a header - an array of strings, giving column names
 * rows - an array of unrestricted primitive types.
 * It is possible to have an array of different types of primitives in JSON, but since this is
 * non-deterministic in swagger, it can't be done.
 * The best we can do in swagger is specify a row of 'Objects'.
 * So, we are making an unenforcable note in the swagger document, and asking clients to comply:
 * RowItems must be objects. They must specify an attribute of 'v' which holds the value of the RowItem.
 * As long as clients specify the value, 'v' it can be anything, even null.
 * If an object is found in a row which does not have a 'v' value, then it's assumed that the 'v' value is null.
 * @param {*} tables 
 */
var removeObjectWrappersFromTables = function (tables) {
  var result = tables;
  if (tables) {
    for (var tIndex = 0; tIndex < tables.length; tIndex++) {
      var table = tables[tIndex];
      var rows = table.rows;
      var rRows = []; // empty, replacement row container
      table.rows = rRows; // replace the old row with the empty one.
      if (rows) {
        for (var rIndex = 0; rIndex < rows.length; rIndex++) {
          var row = rows[rIndex];
          var rRow = []; //empty replacement row container
          rRows.push(rRow);
          if (row) {
            for (var oIndex = 0; oIndex < row.length; oIndex++) {
              var rowObject = row[oIndex];
              if (!(typeof (rowObject.v) == 'undefined')) { // there is a v value
                rRow.push(rowObject.v); // push it onto the new row, without its object wrapper
              } else {
                rRow.push(null); // otherwise, assume it is null.
              }
            }
          }
        }
      }
    }
  }
  return result;
}

var doPutUserCoursesDeploy = async (courseId, tokenState) => {
  var result = null;
  try {
    var intermediate = await Sql.createDeploymentEntry(courseId, tokenState);
    var apiAddrPort = getConsumerApiScheme() + "://" + getConsumerApiAddress() + ":" + getConsumerApiPort();

    var token = auth.createConsumerToken(apiAddrPort,intermediate.id, intermediate.state);

    var entry = await Sql.updateDeploymentEntry(intermediate.id, intermediate.state, token);

    result = {
      token: token,
      token_state: entry.state,
      id: entry.id
    };

  } catch (e) {
    throw errorApi.create500Error(e.message);
  }

  return result;

}

var throwInvalidConsumerToken = async (deploymentId, headerInfo) => {
  try{
    var candidateToken = headerInfo.token;
    var deploymentInfo = await doGetDeployedCourseInfo(deploymentId);
    var currentToken = deploymentInfo.token;


    if(candidateToken.valueOf() != currentToken.valueOf()){
      throw("possible token re-use! Have you deployed to more than one device?"); 
    }

  }catch(e){
    throw errorApi.create403Error(e.message);
  }
}



var renewDeploymentToken = async (deploymentId) => {

  var deploymentInfo = await doGetDeployedCourseInfo(deploymentId);
  var apiAddrPort = getConsumerApiScheme() + "://" + getConsumerApiAddress() + ":" + getConsumerApiPort();
  var state = deploymentInfo.state;
  var token = deploymentInfo.token;
  var destination_token = token;
  var destination_state = state;

  switch(state){

    case dbApi.constants.DEPLOYMENT_STATE_TYPES.SUSPENDED:
    throw errorApi.create403Error("the course has been suspended");

    case dbApi.constants.DEPLOYMENT_STATE_TYPES.DOWNLOAD: 
    case dbApi.constants.DEPLOYMENT_STATE_TYPES.ACTIVE:
        destination_token = auth.createConsumerToken(apiAddrPort, deploymentId, dbApi.constants.DEPLOYMENT_STATE_TYPES.ACTIVE);
        destination_state = dbApi.constants.DEPLOYMENT_STATE_TYPES.ACTIVE;
        break;

    case dbApi.constants.DEPLOYMENT_STATE_TYPES.DEMO:
        destination_token = token;
        destination_state = dbApi.constants.DEPLOYMENT_STATE_TYPES.DEMO;
        break;

    default:
      throw errorApi.create403Error("unsupported deployment state was asked for"); 
  }
  var entry = await Sql.updateDeploymentEntry(deploymentId, destination_state, destination_token);


  return entry;

};


var putConsumerCoursesData = async (
  deploymentId,
  headerInfo,
  scopeInfo,
  tables) => {


  var result = null;

  await throwInvalidConsumerToken(deploymentId, headerInfo);

  tables = removeObjectWrappersFromTables(tables);

  var deploymentInfo = await doGetDeployedCourseInfo(deploymentId);

  var courseId = deploymentInfo.course_id;
  var state = deploymentInfo.state;
  var update_allowed = true;

  switch(state){
    case dbApi.constants.DEPLOYMENT_STATE_TYPES.DEMO:
        update_allowed = false;
  }

  var consumerOwnsCourse = await isConsumerOwnerOfCourse(deploymentId, courseId);
  if (consumerOwnsCourse) {

      var data = null;
      if(update_allowed){
          data = await doPutConsumerCourseData(courseId, tables);
      }else{
          data = await doGetConsumerCourse(courseId);
      }

      var newDeploymentInfo = await renewDeploymentToken(deploymentId);
      result = {
        data: data,
        authorisation: {
           data: newDeploymentInfo.token
        }
      };

  } else {
    throw errorApi.create403Error("the authorisation does not match the course requested.");
  }

  return result;


}


module.exports = {
  initialise: initialise,
  createScopeInfo: createScopeInfo,
  getUserIds: getUserIds,
  deleteUser: deleteUser,
  createCourse: createCourse,
  deleteCourse: deleteCourse,
  getUserCourses: getUserCourses,
  putUserCoursesDeploy: putUserCoursesDeploy,
  deleteUserCoursesDeploy: deleteUserCoursesDeploy,
  getUserCoursesDeploy: getUserCoursesDeploy,
  postUserCoursesDeploy: postUserCoursesDeploy,
  putUser: putUser,
  getConsumerCoursesVersion: getConsumerCoursesVersion,
  getUserTemplatePlans: getUserTemplatePlans,
  getUserActivePlans: getUserActivePlans,
  putUserActivePlans: putUserActivePlans,
  deleteUserActivePlans: deleteUserActivePlans,
  getConsumerCourses: getConsumerCourses,
  putConsumerCoursesData: putConsumerCoursesData,
  getConsumerApiAddress : getConsumerApiAddress,
  getConsumerApiPort: getConsumerApiPort,
  renewDeploymentToken: renewDeploymentToken
};

