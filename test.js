'use strict';

const Nand = require('./index'),
      assert = require('assert');

function isEqual(a,b,description){
  assert[(typeof a === 'object' || typeof b === 'object')?'deepStrictEqual':'strictEqual'](a,b,description);
}

Nand.init({ version : '0.0.1' });

var obj = new Nand();

isEqual(obj.group, 'home');
isEqual(obj.db.group, '_home');
isEqual(obj.db.id, '_index');
isEqual(obj.db.parentId, 'root');
isEqual(obj.db.parentGroup, 'root');
isEqual(obj.db.permission, [7,0,0]);
isEqual(obj.id, 'index');
isEqual(obj.version, '0.0.1');
isEqual(obj.parentId, 'root');
isEqual(obj.parentGroup, 'root');
isEqual(obj.permission, [7,0,0]);

isEqual(obj.read(), undefined);
isEqual(obj.read('root'), '');
isEqual(obj.read('3'), undefined);

isEqual(obj.write('root','39','hello world'), true);
isEqual(obj.read('root'), 'hello world');

isEqual(obj.write('RT','39','hd'), undefined);
isEqual(obj.read('root'), 'hello world');

isEqual(obj.write('root','39','(function(){ return true; })()'), true);
isEqual(obj.exec('root', '39', 'eval'), true);

console.log('!!!-----SUCCESS-----!!!');
