exports.Component = function Component(id,date,time,runData={},annotations={},tags={}){
    this.id = id;
    this.time = time;
    this.date = date;
    this.runData = runData;
    this.annotations = annotations;
    this.tags = tags;
}

exports.Algorithm = function Algorithm(name,algorithm){
    this.name = name;
    this.algorithm = algorithm;
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