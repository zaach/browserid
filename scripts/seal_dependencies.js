#!/usr/bin/env node

const path = require('path');
const exec = require('child_process').exec;
const fs   = require('fs');
const seal = require('seal');

const parentDir = path.resolve(path.join(__dirname, '..'));

// remove node_modules

console.log('Blowing away node_modules');
rmdir(path.join(parentDir, 'node_modules'));

// install only production dependencies
console.log('Installing production dependencies');
var child = exec("npm i --production", {cwd: parentDir}, function (err) {
  exec("npm shrinkwrap", {cwd: parentDir}, genSeal);
});
child.stdout.pipe(process.stdout);

// generate sealed dependency json
// reinstalls dev dependencies afterward
function genSeal () {
  seal.generate(path.join(parentDir, 'npm-shrinkwrap.json'), {cache: process.env['HOME'] + '/.npm'},
    function (err, wrap) {
      if (err) throw err;
      fs.writeFile(path.join(parentDir, 'sealed-npm-shrinkwrap.json'), JSON.stringify(wrap, null, '  '));
      console.log('Sealed shrinkwrap generated');
      fs.unlink(path.join(parentDir, 'npm-shrinkwrap.json'), function (err) {
        console.log('Reinstalling dev dependencies');
        var child = exec("npm i", {cwd: parentDir});
        child.stdout.pipe(process.stdout);
      });
    });
}

function rmdir (dir) {
  var list = fs.readdirSync(dir);
  for(var i = 0; i < list.length; i++) {
    var filename = path.join(dir, list[i]);
    var stat = fs.statSync(filename);

    if(filename == "." || filename == "..") {
      // pass these files
    } else if(stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename);
    } else {
      // rm fiilename
      fs.unlinkSync(filename);
    }
  }
  fs.rmdirSync(dir);
}
