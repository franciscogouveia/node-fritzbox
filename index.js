'use strict';

var request = require('request');

require('dotenv').config({silent: true});

var host = process.env.FB_HOST || 'fritz.box';

if(process.argv.length < 3) {
	console.log('Lack of parameters.\nUsage: node index.js <command> [<param>, ...]');
	process.exit(1);
}

var command = process.argv[2];

try {
  var mod = require('./modules/' + command);

  if(!(mod instanceof Function)) {
    console.log('Invalid module');
    process.exit(1);
  }

  // Callback handler
  var callback = function callback(err, result) {
    if(err) {
      return console.log(err);
    }

    console.log('Done!');
  };

  // By default, modules require authentication
  if(mod.auth !== false) {

    var login = require('./modules/login');

    login(host, null, [process.env.FB_PASSWORD], function(err, result) {
      if(err) {
        return console.log('Could not login: ' + err);
      }

      mod.call(null, host, result.sid, process.argv.slice(3), callback);
    });
  } else {

    mod.call(null, host, '00000000000', process.argv.slice(3), callback);
  }
} catch(e) {
  if(e.code === 'MODULE_NOT_FOUND') {
    console.log('Invalid command');
  } else {
    console.log(e);
  }
  process.exit(1);
}
