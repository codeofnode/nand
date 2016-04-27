'use strict';

var CONFIG = {
  "DB_PREFIX": "_",
  "DB_GRP_PREFIX": "_",
  "EVAL_OPTIONS": "eval,JSON.parse",
  "_PERMISSION": "700",
  "_GROUP": "home",
  "_ID": "index",
  "_UID": "root",
  "_GID": "root"
}, DATA = '', EVAL_OPTIONS = new Map();

const path = require('path');

function setEvals(){
  EVAL_OPTIONS.clear();
  if(typeof CONFIG.EVAL_OPTIONS === 'string'){
    var splits = CONFIG.EVAL_OPTIONS.split(',');
    for(let v of splits){
      if(v.length){
        EVAL_OPTIONS.set(v,eval(v));
      }
    }
  }
}

setEvals();

var ifNotString = str => Boolean(!(typeof str === 'string' && str.length));

function warn(msg){
  if(CONFIG.DEBUG === '1'){
    console.log('WARNING : '+msg);
  }
}

function getPermission(nm){
  nm = parseInt(nm);
  if(nm >=0 && nm <= 7){
    return nm;
  } else {
    warn('Permission entry can not be smaller than 0 and can not be greater than 7.');
    return 0;
  }
}

var canRead = num => Boolean(num > 3),
  canWrite = num => Boolean(num === 2 || num === 3 || num === 6 || num === 7),
  canExecute = num => Boolean(num === 1 || num === 3 || num === 5 || num === 7),
  whoIs = (u,g,_u,_g) => ((u === _u) ? 0 : ((g === _g)  ? 1 : 2 ));

class nand {
  constructor(parentId,parentGroup,group,id,permission,dbRecord){
    if(ifNotString(parentId)){
      warn('Parent id must be a string.');
      parentId = CONFIG._UID;
    }
    if(ifNotString(parentGroup)){
      warn('Parent Group must be a string.');
      parentGroup = CONFIG._GID;
    }
    if(ifNotString(group)){
      warn('Group id must be a string.');
      group = CONFIG._GROUP;
    }
    if(ifNotString(id)){
      warn('id parameter not found..!');
      id = CONFIG._ID;
    }
    if(typeof permission !== 'string' || permission.length !== 3){
      warn('Permission entry must be a string of length 3. Taken default '+CONFIG._PERMISSION);
      permission = CONFIG._PERMISSION;
    }
    if(dbRecord === undefined){
      dbRecord = Db;
    }
    if(dbRecord){
      this.db = new dbRecord(parentId,parentGroup,CONFIG.DB_GRP_PREFIX+group,CONFIG.DB_PREFIX+id);
    }
    this.parentId = parentId;
    this.parentGroup = parentGroup;
    this.group = group;
    this.id = id;
    this.permission = new Array(3);
    this.permission[0] = getPermission(permission[0]);
    this.permission[1] = getPermission(permission[1]);
    this.permission[2] = getPermission(permission[2]);
    this.version = CONFIG.version;
  }
  read(user,group){
    if(this.db && typeof this.db.read === 'function' &&
        canRead(this.permission[whoIs(user,group,this.parentId,this.parentGroup)])){
      return this.db.read(user,group);
    } else {
      return undefined;
    }
  }
  write(user,group,data){
    if(this.db && typeof this.db.write === 'function' && typeof data === 'string' &&
        canWrite(this.permission[whoIs(user,group,this.parentId,this.parentGroup)])){
      return this.db.write(user,group,data);
    } else {
      return undefined;
    }
  }
  exec(user,group,ex){
    ex = EVAL_OPTIONS.get(ex);
    if(this.db && typeof this.db.read === 'function' && typeof ex === 'function' &&
        canExecute(this.permission[whoIs(user,group,this.parentId,this.parentGroup)])){
      return ex(this.read(user,group));
    } else {
      return undefined;
    }
  }
  static init(config){
    if(typeof config === 'object' && config){
      Object.assign(CONFIG, Object.keys(config).filter((val) => !(ifNotString(config[val]))).reduce(function(pv,cv){ pv[cv] = config[cv]; return pv; }, {}));
      if(typeof config.EVAL_OPTIONS === 'string'){
        setEvals();
      }
    }
  }
}

class Db extends nand {
  constructor(parentId,parentGroup,group,id){
    super(parentId,parentGroup,group,id,'700',false);
  }
  read(user,group){
    return ((this.parentId === user) ? DATA : undefined);
  }
  write(user,group,data){
    if(this.parentId === user){
      DATA = data;
      return true;
    } else {
      return false;
    }
  }
}

module.exports = nand;
