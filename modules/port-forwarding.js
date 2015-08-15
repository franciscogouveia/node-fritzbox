'use strict';

var request = require('request');
var xml2js = new require('xml2js').Parser({
  'strict': false,
  'trim': true,
  'normalize': true
});

/**
 * The exposed function
 **/
module.exports = function main(options, params, callback) {

  if(!params.length) {
    console.log('Missing parameter.\nUsage: node index.js port-forwarding [enable|disable|list]');
    return;
  }

  if(['enable', 'disable', 'list'].indexOf(params[0]) === -1) {
    console.log('Wrong parameter.\nUsage: node index.js port-forwarding [enable|disable|list]');
    return;
  }

  module.exports[params[0]].call(null, options.host, options.sid, callback);
};


/**
 * Makes the request to Fritzbox to enable the port forwarding
 **/
module.exports.enable = function enableForwarding(host, sid, callback) {
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
module.exports.disable = function disableForwarding(host, sid, callback) {
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
 * Lists the current forwardings
 **/
module.exports.list = function listForwarding(host, sid, callback) {
  request.get(
    'http://' + host + '/internet/port_fw.lua?sid=' + sid,
    function(error, response, body) {

      if(error) {
        return callback(error);
      }

      // Find <table> element with the information we want and strip it out
      var content = body.substr(body.indexOf('<table id="uiPorts"'));
      content = content.substr(0, content.indexOf('</table>') + '</table>'.length);

      xml2js.parseString(content, function(err, data) {

        if(err) {
          return callback(err);
        }

        var list = [];

        // First row is header
        for(var i = 1; i < data.TABLE.TR.length; i++) {
          var row = data.TABLE.TR[i].TD;

          var id = row[0].INPUT[0].$.NAME;
          var name = row[1].NOBR[0].SPAN[0]._;
          var state = row[0].INPUT[0].$.VALUE === '1' ? 'enabled':'disabled';

          console.log('  * ' + id + ' - ' + name + ' (state: ' + state + ')');
        }

        callback(null, {
          results: list
        });
      });
    }
  );
};
