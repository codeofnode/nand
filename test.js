'use strict';

const Nand = require('./index'),
      assert = require('assert');

function isEqual(a,b,description){
  assert[(typeof a === 'object' || typeof b === 'object')?'deepStrictEqual':'strictEqual'](a,b,description);
}

var obj = new Nand();

isEqual(obj.group, 'nand');
isEqual(obj.db.group, 'DB_GRP_nand');
isEqual(obj.db.id, 'nand');
isEqual(obj.db.parentId, 'ROOT');
isEqual(obj.db.parentGroup, 'ROOT');
isEqual(obj.db.permission, [7,0,0]);
isEqual(obj.id, '_nand');
isEqual(obj.parentId, 'ROOT');
isEqual(obj.parentGroup, 'ROOT');
isEqual(obj.permission, [7,0,0]);

console.log('!!!-----SUCCESS-----!!!')
