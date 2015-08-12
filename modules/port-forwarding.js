'use strict';

var request = require('request');

var internals = {};

internals.enable = function enableForwarding(sid, callback) {
  request.post(
    'http://192.168.1.1/internet/port_fw.lua',
    {
      form: {
        active_1: 1,
        active_2: 1,
        active_3: 1,
        box_upnp_control_activated: 1,
        sid: sid,
        apply: ''
      }
    },
    function (error, response, body) {
      return console.log(body);

      if (!error && response.statusCode == 200) {
        console.log(body)
      }

      callback(null, body);
    }
  );
};

internals.disable = function disableForwarding(sid, callback) {
  request.post(
    'http://192.168.1.1/internet/port_fw.lua',
    {
      form: {
        active_3: 1,
        box_upnp_control_activated: 1,
        sid: sid,
        apply: ''
      }
    },
    function (error, response, body) {
      return console.log(body);

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

  if(['enable', 'disable'].indexOf(params[0]) === -1) {
    console.log('Wrong parameter.\nUsage: node index.js port-forwarding [enable|disable]');
    return;
  }

  internals[params[0]].call(null, sid, callback);
};
