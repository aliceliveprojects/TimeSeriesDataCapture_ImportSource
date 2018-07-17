'use strict';

class CourseData {
    constructor(id, state, version){
        this.id = id;
        this.state = state;
        this.version = version;
    };
}

module.exports = CourseData;