'use strict';

var request = require('request');

var internals = {};

internals.enable = function enableForwarding(sid, callback) {
  return;
  request.post(
    'http://192.168.1.1/',
    { form: { key: 'value' } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
      }

      callback(null, body);
    }
  );
};

internals.disable = function disableForwarding(sid, callback) {
  return;
  request.post(
    'http://192.168.1.1/',
    { form: { key: 'value' } },
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
      }

      callback(null, body);
    }
  );
};

module.exports = function portForwarding(sid, params, callback) {

  if(!params.length) {
    console.log('Missing parameter.\nUsage: node index.js port-forwarding [enable|disable]');
    return;
  }

  if(['enable', 'disable'].indexOf(setStatus) === -1) {
    console.log('Wrong parameter.\nUsage: node index.js port-forwarding [enable|disable]');
    return;
  }

  internals[setStatus].call(null, sid, callback);

};
