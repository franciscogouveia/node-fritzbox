'use strict';

var request = require('request');
var xml2js = new require('xml2js').Parser();

var internals = {};


/**
 * Obtain session info, including challenge.
 *
 * Result:
 *  {
 *    sid: '0000000000000000',
 *    challenge: 'xxxxxx',
 *    blocktime: '0',
 *    rights: [ '' ]
 *  }
 **/
internals.getSessionInfo = function getSessionInfo(callback) {
  request.get('http://192.168.1.1/login_sid.lua', function(err, response, body) {
    xml2js.parseString(body, function(err, data) {

      callback(err, {
        sid: data.SessionInfo.SID[0],
        challenge: data.SessionInfo.Challenge[0],
        blocktime: data.SessionInfo.BlockTime[0],
        rights: data.SessionInfo.Rights
      });
    });
  });
};

/**
 * Obtain the password from the parameters. When not provided, ask the user to input it.
 **/
internals.getPassword = function getPassword(parameters, callback) {
  if(parameters.length) {
    return callback(null, parameters[0]);
  }

  // Password not provided
  process.stdin.setEncoding('utf8');

  process.stdin.on('readable', function() {
    var value = process.stdin.read();

    if(value) {
      value = value.toString().trim();

      if(value.length > 0) {
        process.stdin.pause();

        callback(null, value);
      }
    }
  });
};

/**
 * Attempts to login
 **/
internals.login = function _login(sid, challenge, password, callback) {
  return;
  request.post(
    'http://192.168.1.1/',
    { form: { key: 'value' } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
      }
    }
  );
};

module.exports = function login(sid, parameters, callback) {

  internals.getSessionInfo(function(err, result) {
    if(err) {
      return console.log(err);
    }

    console.log(result);

    var sid = result.sid,
        challenge = result.challenge;

    internals.getPassword(parameters, function(err, password) {

      internals.login(result.sid, result.challenge, password, callback);
    });
  });


};

module.exports.auth = false;
