exports.Component = function Component(id,date,time,runData={},annotations={},tags={},visibility = 'private'){
    this.id = id;
    this.time = time;
    this.date = date;
    this.runData = runData;
    this.annotations = annotations;
    this.tags = tags;
    this.visibility = visibility;
}


exports.Algorithm = function Algorithm(name,algorithm,parameters = []){
    this.name = name;
    this.algorithm = algorithm;
    this.parameters = parameters;
}

exports.Tag = function Tag(tag){
    this.tag = tag;
}

exports.Authentication = function Authentication(profileID,fileStorageToken){
    this.profileID = profileID;
    this.fileStorageToken = fileStorageToken;
}

exports.Annotation = function Annotation(position,description){
    this.position = position;
    this.description = description;
}


