'use strict';

var request = require('request');
var xml2js = new require('xml2js').Parser({
  'strict': false,
  'trim': true,
  'normalize': true
});

var internals = {};

/**
 * Parses the port_fw.lua page to obtain the port-forwarding rules
 **/
internals.readHTML = function(body, callback) {
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
      var state = row[0].INPUT[0].$.CHECKED === 'checked' ? 'enabled':'disabled';

      list.push({
        id: id,
        name: name,
        state: state
      });
    }

    callback(null, {
      results: list
    });
  });
};

/**
 * Enables/Disables the port-forwarding rules
 **/
internals.set = function(options, form_params, callback) {
  request.post(
    'http://' + options.host + '/internet/port_fw.lua',
    {
      form: form_params
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
 * Obtains the current port-forwarding rules
 **/
internals.get = function(options, callback) {
  request.get(
    'http://' + options.host + '/internet/port_fw.lua?sid=' + options.sid,
    function(error, response, body) {

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
module.exports = function main(options, params, callback) {

  if(!params.length) {
    console.log('Missing parameter.\nUsage: node index.js port-forwarding [enable|disable|list]');
    return;
  }

  if(['enable', 'disable', 'list'].indexOf(params[0]) === -1) {
    console.log('Wrong parameter.\nUsage: node index.js port-forwarding [enable|disable|list]');
    return;
  }

  module.exports[params[0]].call(null, options, params, function(err, data) {

    if(err) {
      return callback(err);
    }

    if(options.print) {
      for(var i = 0; i < data.results.length; i++) {
        console.log('  * ' + data.results[i].id + ' - ' + data.results[i].name + ' (state: ' + data.results[i].state + ')');
      }
    }

    callback(null, data);
  });
};

/**
 * Enables specific port-forwardings (params: id of the setting)
 **/
module.exports.enable = function enableForwarding(options, params, callback) {
  var form_params = {};

  var pf_list_options = Object.create(options);
  pf_list_options.print = false;

  // Get current settings
  module.exports.list(pf_list_options, [], function(err, data) {

    if(err) {
      return callback(err);
    }

    for(var i = 0; i < data.results.length; i++) {
      var option = data.results[i];

      if(params.indexOf(option.id) !== -1 || option.state === 'enabled') {
        form_params[option.id] = 1;
      }
    }

    // TODO: read current values from fritzbox - should not be hardcoded
    form_params.box_upnp_control_activated = 1;
    form_params.sid = options.sid;
    form_params.apply = '';

    internals.set(options, form_params, function(err, body) {

      if(err) {
        return callback(err);
      }

      internals.readHTML(body, callback);
    });
  });
};

/**
 * Disables specific port-forwardings (params: id of the setting)
 **/
module.exports.disable = function disableForwarding(options, params, callback) {
  var form_params = {};

  // Get current settings
  module.exports.list(options, [], function(err, data) {

    if(err) {
      return callback(err);
    }

    for(var i = 0; i < data.results.length; i++) {
      var option = data.results[i];

      if(params.indexOf(option.id) === -1 && option.state === 'enabled') {
        form_params[option.id] = 1;
      }
    }

    // TODO: read current values from fritzbox - should not be hardcoded
    form_params.box_upnp_control_activated = 1;
    form_params.sid = options.sid;
    form_params.apply = '';

    internals.set(options, form_params, function(err, body) {

      if(err) {
        return callback(err);
      }

      internals.readHTML(body, callback);
    });
  });
};

/**
 * Lists the current forwardings
 **/
module.exports.list = function listForwarding(options, params, callback) {

  internals.get(options, function(error, body) {

      if(error) {
        return callback(error);
      }

      internals.readHTML(body, callback);
    }
  );
};
