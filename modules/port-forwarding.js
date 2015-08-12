'use strict';

var request = require('request');

var internals = {};

/**
 * Makes the request to Fritzbox to enable the port forwarding
 **/
internals.enable = function enableForwarding(host, sid, callback) {
  request.post(
    'http://' + host + '/internet/port_fw.lua',
    {
      form: {
        /* TODO This should be not hardcoded */
        active_1: 1,
        active_2: 1,
        active_3: 1,
        box_upnp_control_activated: 1,
        sid: sid,
        apply: ''
      }
    },
    function (error, response, body) {

      if(error) {
        return callback(error);
      }

      callback(null, body);
    }
  );
};

/**
 * Makes the request to Fritzbox to disable specific port forwarding settings (by not mentioning them)
 **/
internals.disable = function disableForwarding(host, sid, callback) {
  request.post(
    'http://' + host + '/internet/port_fw.lua',
    {
      form: {
        /* TODO This should be not hardcoded */
        active_3: 1,
        box_upnp_control_activated: 1,
        sid: sid,
        apply: ''
      }
    },
    function (error, response, body) {

      if(error) {
        return callback(error);
      }

      callback(null, body);
    }
  );
};

/**
 * The exposed function
 **/
module.exports = function main(host, sid, params, callback) {

  if(!params.length) {
    console.log('Missing parameter.\nUsage: node index.js port-forwarding [enable|disable]');
    return;
  }

  if(['enable', 'disable'].indexOf(params[0]) === -1) {
    console.log('Wrong parameter.\nUsage: node index.js port-forwarding [enable|disable]');
    return;
  }

  internals[params[0]].call(null, host, sid, callback);
};
