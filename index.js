'use strict';

var request = require('request');

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

    console.log(result);
  };

  // By default, modules require authentication
  if(mod.auth !== false) {

    var login = require('./modules/login');

    login(null, [], function(err, result) {
      if(err) {
        return console.log('Could not login: ' + err);
      }

      mod.call(null, result.sid, process.argv.slice(3), callback);
    });
  } else {

    mod.call(null, '00000000000', process.argv.slice(3), callback);
  }
} catch(e) {
  if(e.code === 'MODULE_NOT_FOUND') {
    console.log('Invalid command');
  } else {
    console.log(e);
  }
  process.exit(1);
}

/*
request.post(
  'http://www.yoursite.com/formpage',
  { form: { key: 'value' } },
  function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body)
    }
  }
);
*/
