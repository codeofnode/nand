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

isEqual(obj.read(), undefined);
isEqual(obj.read('ROOT'), '');
isEqual(obj.read('3'), undefined);

isEqual(obj.write('ROOT','39','hello world'), true);
isEqual(obj.read('ROOT'), 'hello world');

isEqual(obj.write('RT','39','hd'), undefined);
isEqual(obj.read('ROOT'), 'hello world');

isEqual(obj.write('ROOT','39','(function(){ return true; })()'), true);
isEqual(obj.fire('ROOT', '39', 'eval'), true);

console.log('!!!-----SUCCESS-----!!!')
