'use strict';

var dbApi = require('../database/database');
var genApi = require('./querygen/gen')(__dirname + "/scripts");

const table_conflicts = {
    course_answers: ["id"],
    session_answers :["id"], 
    session_completion:["id"]
}

const publish_states = {
    PUBLISHED : 1,
    DEPRECATED : 2
}

class Sql {
    static getDefaultIntroSurveyId() {
        return 'be7a4c65-3ddc-45d5-a134-4eb75d9e3e81';
    }

    static getDefaultOutcomeSurveyId() {
        return '86363221-fa57-496d-8fec-36a3d4771512';
    }

    static getDefaultOutcomeSurveySchedule() {
        return {
            every: 1,
            period: 3,
            from_date: null
        }
    };


    static async createUser(externalId) {
        var result = null;
        var query = genApi.gen("create_user", [externalId])
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            var row = response.rows[0];
            result = row[dbApi.tables.users.columns.id];
        }
        return result;
    }

    static async readUser(externalId) {
        var result = null;
        var query = genApi.gen("read_user", [externalId])
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            var row = response.rows[0];
            result = row[dbApi.tables.users.columns.id];
        }
        return result;
    }

    static async deleteUser(externalId) {
        var result = null;
        var query = genApi.gen("delete_user", [externalId])
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            var row = response.rows[0];
            result = row[dbApi.tables.users.columns.id];
        }
        return result;
    }


    static async createCourseForUser(userId) {
        var result = null;
        var schedule = Sql.getDefaultOutcomeSurveySchedule();
        var query = genApi.gen(
            "create_course_for_user",
            [userId,
                Sql.getDefaultIntroSurveyId(),
                Sql.getDefaultOutcomeSurveyId(),
                schedule.every,
                schedule.period,
                schedule.from_date]
        );
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            var row = response.rows[0];
            result = row[dbApi.tables.user_to_course_mapping.columns.course];
        } else {
            throw new Error("could not create course for user.");
        }
        return result;
    }

    static async getUserCourses(userId, page, size) {
        var result = [];

        if (page < 1 || size < 1) {
            throw new Error("pagination error. Size and page are 1-based.");
        }

        var limit = size;
        var offset = limit * (page - 1);

        var query = genApi.gen("get_user_courses", [userId, limit, offset]);
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            result = response.rows;
        }
        return result;
    }

    static async isUserOwnerOfPlan(userId, planId) {
        var result = false;
        var query = genApi.gen("get_user_plan_association", [userId, planId])
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            result = true;
        }
        return result;
    }



    static async isUserOwnerOfCourse(userId, courseId) {
        var result = false;
        var query = genApi.gen("get_user_course_association", [userId, courseId])
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            result = true;
        }
        return result;
    }




    static async isConsumerOwnerOfCourse(deploymentId, courseId) {
        var result = false;
        var query = genApi.gen("get_consumer_course_association", [deploymentId, courseId])
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            result = true;
        }
        return result;
    }

    static async getConsumerCourseVersion(courseId) {
        var result = null;
        var query = genApi.gen("get_consumer_course_version", [courseId])
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            result = response.rows[0].version;

            result = {
                version : response.rows[0].version,
                data_version : response.rows[0].data_version
            }


        }
        return result;
    }


    static async deleteCourse(courseId) {
        var result = null;
        var query = genApi.gen("delete_course", [courseId]);
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            var row = response.rows[0];
            result = row[dbApi.tables.courses.columns.id];
        }
        return result;
    }

    static async deleteDeployment(deploymentId) {
        var result = null;
        var query = genApi.gen("delete_deployment", [deploymentId]);
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            var row = response.rows[0];
            result = row[dbApi.tables.deployments.columns.id];
        }
        return result;
    }

    static async getDeployment(deploymentId) {
        var result = null;
        var query = genApi.gen("get_deployment", [deploymentId]);
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            result = response.rows[0];
        }
        return result;
    }


    static async getCourseDeployments(courseId, page, size) {
        var result = [];

        if (page < 1 || size < 1) {
            throw new Error("pagination error. Size and page are 1-based.");
        }

        var limit = size;
        var offset = limit * (page - 1);

        var query = genApi.gen("get_course_deployments", [courseId, limit, offset]);
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            result = response.rows;
        }
        return result;
    }

    static async createDeploymentEntry(courseId, deploymentState) {
        var result = null;
        var deploymentStateParam = null;
        var defaultStateParam = dbApi.constants.DEPLOYMENT_STATE_TYPES.DOWNLOAD;

        if (deploymentState) {
            var dsQuery = genApi.gen("get_deployment_state", [deploymentState]);
            var dsResponse = await dbApi.query(dsQuery.text, dsQuery.values);
            if (dsResponse.rows.length > 0) {
                var value = dsResponse.rows[0].id;
                deploymentStateParam = value;
            } else {
                throw new Error('invalid deployment state. Valid values are: ' + JSON.stringify(dbApi.constants.DEPLOYMENT_STATE_TYPES));
            }
        } else {
            deploymentStateParam = defaultStateParam;
        }

        var query = genApi.gen("create_deployment", [courseId, deploymentStateParam])
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            result = response.rows[0];
        }

        return result;

    }

    static async updateDeploymentEntry(deploymentId, deploymentState, token) {
        var result = null;
        var deploymentStateParam = null;

        var dsQuery = genApi.gen("get_deployment_state", [deploymentState]);
        var dsResponse = await dbApi.query(dsQuery.text, dsQuery.values);
        if (dsResponse.rows.length > 0) {
            var value = dsResponse.rows[0].id;
            deploymentStateParam = value;
        } else {
            throw new Error('invalid deployment state. Valid values are: ' + JSON.stringify(dbApi.constants.DEPLOYMENT_STATE_TYPES));
        }


        var query = genApi.gen("update_deployment", [deploymentId, deploymentStateParam, token])
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            result = response.rows[0];
        }

        return result;
    }


    static async createActivePlan(templatePlanId, courseId, userId) {
        var result = null;


        var queries = [];

        queries.push(genApi.gen("create_temp_id_mapping_drop_on_commit", []));
        queries.push(genApi.gen("create_active_plan_in_course_for_user", [templatePlanId, courseId, userId]));
        var responses = await dbApi.multiQuery(queries);
        if (responses.length > 0) {
            var response = responses[responses.length - 1]; // get the last response
            if (response.rows.length > 0) {
                result = response.rows[0];
            }
        }

        return result;

    }


    static async deleteActivePlan(activePlanId) {

        var result = null;

        var query = genApi.gen("delete_active_plan", [activePlanId]);
        var response = await dbApi.query(query.text, query.values);
        if (response.rows.length > 0) {
            result = response.rows[0];
        }

        return result;


    }



    static tokenise(param) {

        var result = [];

        if ((param) && (param.length > 0)) {
            result = param.split(/\s+/);
        }

        return result;
    }

    static parameteriseTokenArray(array) {
        var result = "";
        if (array && array.length > 0) {
            var search = "";
            for (var index = 0; index < array.length; index++) {
                search += array[index];
                if (array.length > 1 && index < array.length - 1) {
                    search += " & ";
                }
            }
            result = "'" + search + ":*'";
        }


        return result;
    }

    static parameteriseToken(token) {
        var result = ""

        if (token && token.length > 0) {
            result = "%" + token + "%";
        }


        return result;
    }




    /**
     * expect integer, null or undefined
     * @param {*} page 
     * @param {*} size 
     */
    static buildPaginator(page, size) {
        var result = "";


        if (typeof page === 'number' && typeof (size === 'number')) {
            if (page < 1 || size < 1) {
                throw new Error("pagination error. Size and page are 1-based.");
            }
            var limit = size;
            var offset = limit * (page - 1);

            result = " LIMIT " + limit + " OFFSET " + offset;

        } else {
            if (!(typeof page === 'undefined' && typeof size === 'undefined')) {
                // page AND size must be undefined, or there's an error.
                throw new Error("pagination error. Page or size is not defined properly.");
            }
        }

        return result;
    }

    static buildPlanSearchQueryBase(based_on) {

        var result = {
            text: "",
            params: []
        };

        var text = "(SELECT id, based_on, name, description, instructions, TO_CHAR(plans.created,'YYYY-MM-DD HH24:MI:SS.US') created FROM plans WHERE based_on"
        var rightSide = " is null";

        if (typeof based_on === 'string') {
            if (based_on.length > 0) {
                rightSide = " = '" + based_on + "'";
            } else {
                rightSide = " is not null";
            }
        }
        text += rightSide + " )";

        result.text = text;

        return result;

    }

    static buildPlanSearchQueryUnion(name, description, instructions, published) {
        var result = {
            text: "",
            params: []
        };

        var subQueryBuilder = [];
        var subQueryParams = [];

        var subQueryName = "(SELECT id, based_on, name, description, instructions, TO_CHAR(created,'YYYY-MM-DD HH24:MI:SS.US') created FROM plans WHERE to_tsvector(name) @@ to_tsquery($X) OR name ILIKE $Y)";
        var subQueryDescription = "(SELECT id, based_on, name, description, instructions, TO_CHAR(created,'YYYY-MM-DD HH24:MI:SS.US') created FROM plans WHERE to_tsvector(description) @@ to_tsquery($X) OR description ILIKE $Y)";
        var subQueryInstructions = "(SELECT id, based_on, name, description, instructions, TO_CHAR(created,'YYYY-MM-DD HH24:MI:SS.US') created FROM plans WHERE to_tsvector(instructions) @@ to_tsquery($X) OR instructions ILIKE $Y)";
        var subQueryPublished =  "(SELECT t1.id, t1.based_on, t1.name, t1.description, t1.instructions, TO_CHAR(created,'YYYY-MM-DD HH24:MI:SS.US') created FROM plans t1 join published t2 on t1.id = t2.id_of_published_entity and t2.state = 1)";

        if (name && name.length > 0) {
            subQueryBuilder.push(subQueryName);
            subQueryParams.push(Sql.parameteriseTokenArray(Sql.tokenise(name)));
            subQueryParams.push(Sql.parameteriseToken(name));
        }
        if (description && description.length > 0) {
            subQueryBuilder.push(subQueryDescription);
            subQueryParams.push(Sql.parameteriseTokenArray(Sql.tokenise(description)));
            subQueryParams.push(Sql.parameteriseToken(description));
        }
        if (instructions && instructions.length > 0) {
            subQueryBuilder.push(subQueryInstructions);
            subQueryParams.push(Sql.parameteriseTokenArray(Sql.tokenise(instructions)));
            subQueryParams.push(Sql.parameteriseToken(instructions));
        }




        // map sub queries to parameterization
        for (var index = 0; index < subQueryBuilder.length; index++) {
            var parameterIndex = (index * 2) + 1; // parameterisation for postgres is 1 based, and we have two parameters per sub-query
            subQueryBuilder[index] = subQueryBuilder[index].replace("$X", "$" + parameterIndex);
            subQueryBuilder[index] = subQueryBuilder[index].replace("$Y", "$" + (parameterIndex + 1));
        }

        if(published){
            subQueryBuilder.push(subQueryPublished); // added as bolt-on later. Has no parameters.
        }
        var text = "";

        // build the sub-queries
        for (var index = 0; index < subQueryBuilder.length; index++) {
            text += subQueryBuilder[index];
            if (subQueryBuilder.length > 1 && index < subQueryBuilder.length - 1) {
                text += " INTERSECT ";
            }
        }

        result.text = text;
        result.params = subQueryParams;

        return result;
    }


    static buildPlanSearchQueryJoinCourses(planSearchQuery, courseId) {
        var result = planSearchQuery;

        if (courseId) {

            var parenthesisedQuery = "SELECT t1.*, t2.completed FROM (" + result.text + ") t1";
            result.params.push(courseId);
            var joinQuery = " JOIN course_to_plan_mapping t2 on (t1.id = t2.plan) INNER JOIN courses t3 on t2.course = t3.id where t3.id = $"
                + result.params.length;// parameterisation for postgres is 1 based.

            result.text = (parenthesisedQuery + joinQuery);

        }

        return result;
    }





    static buildPlanSearchQueryJoinUsers(planSearchQuery, userIds) {
        var result = planSearchQuery;

        if (userIds && userIds.length > 0) {

            var parenthesisedQuery = "SELECT t1.* created FROM (" + result.text + ") t1";


            var joinParamTerm = "";
            for (var index = 0; index < userIds.length; index++) {
                result.params.push(userIds[index]);
                joinParamTerm += ("t3.id = $" + result.params.length); // parameterisation for postgres is 1 based.
                if (index < userIds.length - 1) {
                    joinParamTerm += " OR ";
                }
            }

            var joinQuery = " JOIN user_to_plan_mapping t2 on (t1.id = t2.plan) INNER JOIN users t3 on t2.user = t3.id where " + joinParamTerm;

            result.text = (parenthesisedQuery + joinQuery);
        }

        return result;
    }




    static async searchPlans(page, size, name, description, instructions, based_on, published, options) {

        var result = [];

        var query = {
            text: "",
            params: []
        };

        var queryBase = Sql.buildPlanSearchQueryBase(based_on);
        var queryUnion = Sql.buildPlanSearchQueryUnion(name, description, instructions, published);
        var queryPagination = Sql.buildPaginator(page, size);
        var queryOrderBy = " ORDER BY created DESC";


        query.text = queryBase.text;

        if (queryUnion.text.length > 0) {
            query.text += " INTERSECT (" + queryUnion.text + ")";
            query.params = queryUnion.params;
        }

        if (options) {
            if (options.userId && options.courseId) {
                throw (new Error("ambiguous options supplied as parameters: user id suplied as well as course id"));
            }
            if (options.userIds) {
                Sql.buildPlanSearchQueryJoinUsers(query, options.userIds);
            } else if (options.courseId) {
                Sql.buildPlanSearchQueryJoinCourses(query, options.courseId);
            }
        }

        query.text += queryOrderBy;
        query.text += queryPagination;
        query.text += ";"

        var response = await dbApi.query(query.text, query.params);
        if (response.rows.length > 0) {
            result = response.rows;
        }

        return result;
    }






    static createTableQuery(tableName, query) {
        var result = dbApi.createTabularQuery(query);
        result.name = tableName;
        return result;
    }


    static createColumnList(header){
        var result = "";

        for(var index=0; index < header.length; index++){

            result += header[index];
            if(index < header.length - 1){
                result += ", ";
            }

        }


        return result;
    }

    static createConflictList(conflicts){
        var result = "";

        for(var index=0; index < conflicts.length; index++){

            result += conflicts[index];
            if(index < conflicts.length - 1){
                result += ", ";
            }

        }


        return result;
    }


    static createValueList(row){
        var result = "";

        for(var index=0; index < row.length; index++){

            var value = row[index];
            var item = value;

            if (typeof value === 'string') {
                item = "'" + value + "'";
            }


            result += item;

            

            if(index < row.length - 1){
                result += ", ";
            }

        }


        return result;
    }


    static createUpsert(name, header, row, conflicts) {
        var result = null;

        if (name && name.length > 0) {
            if (header && header.length > 0) {
                if (row && row.length > 0) {

                    var columnList = Sql.createColumnList(header);
                    var valueList = Sql.createValueList(row);
                    var conflictList = Sql.createConflictList(conflicts);
                    
                    result = "insert into " + name + " ( ";
                    result += columnList;
                    result += " ) values ("
                    result += valueList;
                    result += " ) ";
                    result += "on conflict (";
                    result += conflictList; 
                    result += ") do update set ( ";
                    result += columnList;
                    result += " ) = ( ";
                    result += valueList;
                    result += " ); ";

                }
            }
        }

        return result;
    }


    static getConflictHeadersForTable(tableName){
        return table_conflicts[tableName]; // can throw
    }


    static createTableUpserts(courseId, table) {
        var name = table.name;
        var header = table.header;
        var rows = table.rows;
        var result = [];


        if (rows && rows.length > 0) {
            for (var index = 0; index < rows.length; index++) {
                var conflicts = Sql.getConflictHeadersForTable(name);
                var upsert = Sql.createUpsert(name, header, rows[index], conflicts);
                if(upsert){
                    var query = {
                        text: upsert,
                        values: []
                    }
                    result.push(query);
                }
            }
        }


        return result;
    }

    static createCourseMultiQuery(courseId) {

        var result = [];
        result.push(Sql.createTableQuery("courses", genApi.gen("list_courses", [courseId])));
        result.push(Sql.createTableQuery("course_answers", genApi.gen("list_course_answers", [courseId])));
        result.push(Sql.createTableQuery("course_state_types", genApi.gen("list_course_state_types")));
        result.push(Sql.createTableQuery("course_survey_schedule", genApi.gen("list_course_survey_schedule", [courseId])));
        result.push(Sql.createTableQuery("course_to_plan_mapping", genApi.gen("list_course_to_plan_mapping", [courseId])));
        result.push(Sql.createTableQuery("course_to_survey_mapping", genApi.gen("list_course_to_survey_mapping", [courseId])));
        result.push(Sql.createTableQuery("course_to_survey_types", genApi.gen("list_course_to_survey_types")));
        result.push(Sql.createTableQuery("days_of_the_week", genApi.gen("list_days_of_the_week")));
        result.push(Sql.createTableQuery("exercise_to_media_mapping", genApi.gen("list_exercise_to_media_mapping", [courseId])));
        result.push(Sql.createTableQuery("exercises", genApi.gen("list_exercises", [courseId])));
        result.push(Sql.createTableQuery("base64_resources", genApi.gen("list_base64_resources", [courseId])));
        result.push(Sql.createTableQuery("flow_action_types", genApi.gen("list_flow_action_types")));
        result.push(Sql.createTableQuery("media", genApi.gen("list_media", [courseId])));
        result.push(Sql.createTableQuery("media_context_types", genApi.gen("list_media_context_types")));
        result.push(Sql.createTableQuery("message_types", genApi.gen("list_message_types")));
        result.push(Sql.createTableQuery("messages", genApi.gen("list_messages")));
        result.push(Sql.createTableQuery("period_type", genApi.gen("list_period_type")));
        result.push(Sql.createTableQuery("plan_to_session_mapping", genApi.gen("list_plan_to_session_mapping", [courseId])));
        result.push(Sql.createTableQuery("plans", genApi.gen("list_plans", [courseId])));
        result.push(Sql.createTableQuery("question_types", genApi.gen("list_question_types")));
        result.push(Sql.createTableQuery("questions", genApi.gen("list_questions", [courseId])));
        result.push(Sql.createTableQuery("section_to_question_mapping", genApi.gen("list_section_to_question_mapping", [courseId])));
        result.push(Sql.createTableQuery("sections", genApi.gen("list_sections", [courseId])));
        result.push(Sql.createTableQuery("session_answers", genApi.gen("list_session_answers", [courseId])));
        result.push(Sql.createTableQuery("session_completion", genApi.gen("list_session_completion", [courseId])));
        result.push(Sql.createTableQuery("session_to_break_mapping", genApi.gen("list_session_to_break_mapping", [courseId])));
        result.push(Sql.createTableQuery("session_to_exercise_mapping", genApi.gen("list_session_to_exercise_mapping", [courseId])));
        result.push(Sql.createTableQuery("session_to_message_mapping", genApi.gen("list_session_to_message_mapping", [courseId])));
        result.push(Sql.createTableQuery("session_to_survey_mapping", genApi.gen("list_session_to_survey_mapping", [courseId])));
        result.push(Sql.createTableQuery("session_to_survey_types", genApi.gen("list_session_to_survey_types")));
        result.push(Sql.createTableQuery("sessions", genApi.gen("list_sessions", [courseId])));
        result.push(Sql.createTableQuery("survey_actions", genApi.gen("list_survey_actions")));
        result.push(Sql.createTableQuery("survey_flows", genApi.gen("list_survey_flows", [courseId])));
        result.push(Sql.createTableQuery("survey_to_section_mapping", genApi.gen("list_survey_to_section_mapping", [courseId])));
        result.push(Sql.createTableQuery("surveys", genApi.gen("list_surveys", [courseId])));
        return result;
    };


    static createCourseDataMultiQuery(courseId) {
        var result = [];
        result.push(Sql.createTableQuery("course_answers", genApi.gen("list_course_answers", [courseId])));
        result.push(Sql.createTableQuery("session_answers", genApi.gen("list_session_answers", [courseId])));
        result.push(Sql.createTableQuery("session_completion", genApi.gen("list_session_completion", [courseId])));
        return result;
    };




    static createCourseDataMultiUpsert(courseId, tables) {
        var result = [];
        if (tables) {
            for (var index = 0; index < tables.length; index++) {
                var table = tables[index];
                var queries = Sql.createTableUpserts(courseId, table);
               
                for(var queryIndex = 0; queryIndex < queries.length; queryIndex++){
                    result.push(queries[queryIndex]);
                }
            }
        }
        return result;
    }

    static createCourseDataVersionIncrement(courseId){
        return genApi.gen("update_course_data_version", [courseId]);
    }


    static async getConsumerCourse(courseId) {
        var result = null;
        result = await dbApi.multiTabularQuery(Sql.createCourseMultiQuery(courseId));
        return result;
    }




    static validateTableContent(courseId, tables){
        for(var tIndex=0; tIndex < tables.length; tIndex++){

        
            var cols = tables[tIndex].header;
            var rows = tables[tIndex].rows;

            for(var cIndex = 0; cIndex < cols.length; cIndex++){
                var col = cols[cIndex];
                // if we have a course mentioned in the data, make sure it is the course which is currenly being updated
                if(col.indexOf(dbApi.constants.COURSE_COL)!= dbApi.constants.NOT_FOUND){

                    for(var rIndex = 0; rIndex < rows.length; rIndex++){
                        var row = rows[rIndex];
                        var candidate = row[cIndex]; 
                        if(courseId != candidate){
                            throw new Error("data validation failed.");
                        }
                    }
                }
            }
        }
    }

    static async putConsumerCourseData(courseId, tables) {
        var result = null;
        if (tables) {
            Sql.validateTableContent(courseId, tables);

            var queries = Sql.createCourseDataMultiUpsert(courseId, tables);

            if(queries.length > 0){
                queries.push (Sql.createCourseDataVersionIncrement(courseId));
                await dbApi.multiQuery(queries);
            }
        }
        result = await dbApi.multiTabularQuery(Sql.createCourseDataMultiQuery(courseId));

        return result;
    }

};


module.exports = Sql;
