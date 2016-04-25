'use strict';

var CONFIG = {}, PACKAGE = {}, DATA = '';
var EVAL_OPTIONS = new Map();

const path = require('path');

if(CONFIG.ENV !== 'test' && CONFIG.ENV !== 'prod'){ CONFIG.ENV = 'dev'; }
if(typeof CONFIG.ENV_PREFIX !== 'string'){ CONFIG.ENV_PREFIX = 'APP_'; }
if(typeof CONFIG.ENV_PARSE_PREFIX !== 'string'){ CONFIG.ENV_PARSE_PREFIX = 'PARSE_'; }

try { CONFIG = require(path.join(__dirname,'config.sample.json')); } catch(er){ }

try { Object.assign(CONFIG, require(path.join(__dirname,'config.json'))); } catch(er){ }

try { Object.assign(PACKAGE, require(path.join(__dirname,'package.json'))); } catch(er){ }

Object.assign(CONFIG, Object.keys(process.env).filter(key => (key.indexOf(CONFIG.ENV_PREFIX) === 0)).
  reduce(function(pv,cv){
    let val = process.env[cv], key = cv.substring(CONFIG.ENV_PREFIX.length);
    pv[key] = (process.env[CONFIG.ENV_PARSE_PREFIX+key]==='1') ? JSON.parse(val) : val;
    return pv;
  }, {}));

try { Object.assign(CONFIG, require(path.join(__dirname,CONFIG.ENV+'.json'))); } catch(er){ }

if(typeof CONFIG.INS_PREFIX !== 'string'){ CONFIG.INS_PREFIX = '_'; }
if(typeof CONFIG.DB_GRP_PREFIX !== 'string'){ CONFIG.DB_GRP_PREFIX = 'DB_GRP_'; }
if(typeof CONFIG.DEFAULT_PERMISSION !== 'string'){ CONFIG.DEFAULT_PERMISSION = '700'; }
if(typeof CONFIG.EVAL_OPTIONS !== 'string'){ CONFIG.EVAL_OPTIONS = 'eval'; }

var splits = CONFIG.EVAL_OPTIONS.split(',');
for(let v of splits){
  EVAL_OPTIONS.set(v,eval(v));
}

var ifNotString = str => Boolean(!(typeof str === 'string' && str.length));

function warn(msg){
  if(CONFIG.DEBUG === '1'){
    console.log('WARNING : '+msg);
  }
}

if(ifNotString(PACKAGE.name)){
  warn('Id could not be gernerated for module.');
  PACKAGE.name = 'ROOT_CHILD';
}

Object.freeze(CONFIG);
Object.freeze(PACKAGE);

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
  constructor(parentId,parentGroup,groupId,permission,dbRecord){
    if(ifNotString(parentId)){
      warn('Parent id must be a string.');
      parentId = 'ROOT';
    }
    if(ifNotString(parentGroup)){
      warn('Parent Group must be a string.');
      parentGroup = 'ROOT';
    }
    if(ifNotString(groupId)){
      warn('Group id must be a string.');
      groupId = PACKAGE.name;
    }
    if(ifNotString(permission)){
      warn('Permission entry must be a string. Taken default 700');
      permission = '700';
    } else if(permission.length !== 3){
      warn('Permission string must be of length 3. Taken no permission "000".');
      permission = '000';
    }
    this.group = groupId;
    if(dbRecord === undefined){
      dbRecord = Db;
    }
    if(dbRecord){
      this.db = new dbRecord(parentId,parentGroup,CONFIG.DB_GRP_PREFIX+groupId);
      this.id = CONFIG.INS_PREFIX+this.db.id;
    }
    if(ifNotString(this.id)){
      this.id = PACKAGE.name;
    }
    this.version = PACKAGE.version;
    this.description = PACKAGE.description;
    this.parentId = parentId;
    this.parentGroup = parentGroup;
    this.permission = new Array(3);
    this.permission[0] = getPermission(permission[0]);
    this.permission[1] = getPermission(permission[1]);
    this.permission[2] = getPermission(permission[2]);
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
    if(this.db && typeof this.db.write === 'function' && data !== undefined &&
        canWrite(this.permission[whoIs(user,group,this.parentId,this.parentGroup)])){
      return this.db.write(user,group,data);
    } else {
      return undefined;
    }
  }
  fire(user,group,ex){
    ex = EVAL_OPTIONS.get(ex);
    if(this.db && typeof this.db.read === 'function' && typeof ex === 'function' &&
        canExecute(this.permission[whoIs(user,group,this.parentId,this.parentGroup)])){
      return ex(this.read(user,group));
    } else {
      return undefined;
    }
  }
}

class Db extends nand {
  constructor(parentId,parentGroup,groupId){
    super(parentId,parentGroup,groupId,'700',false);
    this.id = PACKAGE.name;
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
