'use strict';

class DeploymentData {
    constructor(id, state, course_id, created, token){
        this.id = id;
        this.state = state;
        this.course_id = course_id;
        this.created = created;
        this.token = token;

    };
}

module.exports = DeploymentData;