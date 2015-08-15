'use strict';

var request = require('request');

require('dotenv').config({silent: true});

var host = process.env.FB_HOST || 'fritz.box';

if(process.argv.length < 3) {
	console.log('Lack of parameters.\nUsage: node index.js <command> [<param>, ...]');
	process.exit(1);
}

var command = process.argv[2];

function _loadModule(name, callback) {
  try {
    var mod = require('./modules/' + name);

    if(!(mod instanceof Function)) {
      return callback(new Error('Module ' + name + ' is not valid'));
    }

    callback(null, mod);
  } catch(e) {
    if(e.code === '') {
      callback(new Error('Module not found'));
    } else {
      callback(e);
    }
  }
}

_loadModule(command, function(err, mod) {

  if(err) {
    if(err.code === 'MODULE_NOT_FOUND') {
      console.log('Invalid command');
    } else {
      console.log(err.message);
    }
    process.exit(-1);
  }

  // Callback handler
  var callback = function callback(err, result) {

    if(err) {
      return console.log(err);
    }

    // Success
    console.log('Done!');
  };

  // By default, modules require authentication
  if(mod.auth !== false) {

    var login = require('./modules/login');

    login.call(null, {
      'host': host
    }, [process.env.FB_PASSWORD], function(err, result) {

      if(err) {
        return console.log('Could not login: ' + err);
      }

      mod.call(null, {
        'host': host,
        'sid': result.sid
      }, process.argv.slice(3), callback);
    });
  } else {

    mod.call(null, {
      'host': host,
      'sid': '00000000000'
    }, process.argv.slice(3), callback);
  }
});
