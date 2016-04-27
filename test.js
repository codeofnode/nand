'use strict';

const Nand = require('./index'),
      assert = require('assert');

function isEqual(a,b,description){
  assert[(typeof a === 'object' || typeof b === 'object')?'deepStrictEqual':'strictEqual'](a,b,description);
}

Nand.init({ version : '0.0.1' });

var obj = new Nand();

isEqual(obj.group, 'group1');
isEqual(obj.db.group, 'DB_GRP_group1');
isEqual(obj.db.id, 'db1');
isEqual(obj.db.parentId, 'uid1');
isEqual(obj.db.parentGroup, 'gid1');
isEqual(obj.db.permission, [7,0,0]);
isEqual(obj.id, '_db1');
isEqual(obj.version, '0.0.1');
isEqual(obj.parentId, 'uid1');
isEqual(obj.parentGroup, 'gid1');
isEqual(obj.permission, [7,0,0]);

isEqual(obj.read(), undefined);
isEqual(obj.read('uid1'), '');
isEqual(obj.read('3'), undefined);

isEqual(obj.write('uid1','39','hello world'), true);
isEqual(obj.read('uid1'), 'hello world');

isEqual(obj.write('RT','39','hd'), undefined);
isEqual(obj.read('uid1'), 'hello world');

isEqual(obj.write('uid1','39','(function(){ return true; })()'), true);
isEqual(obj.exec('uid1', '39', 'eval'), true);

console.log('!!!-----SUCCESS-----!!!');
