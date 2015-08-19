'use strict';

var request = require('request');
var xml2js = new require('xml2js').Parser({
  'strict': false,
  'trim': true,
  'normalize': true
});

var internals = {};

internals.readDeviceTable = function(body, table_id, connected, callback) {
  // Find <table> element with the information we want and strip it out
  var active_table = body.substr(body.indexOf('<table id="' + table_id + '"'));
  active_table = active_table.substr(0, active_table.indexOf('</table>') + '</table>'.length);

  xml2js.parseString(active_table, function(err, data) {

    if(err) {
      return callback(err);
    }

    var list = [];

    // First row is header
    for(var i = 1; i < data.TABLE.TR.length; i++) {
      var row = data.TABLE.TR[i].TD;

      var id = row[6].BUTTON[0].$.VALUE;
      var name;

      if(row[1].A) {
        name = row[1].A[0]._;
      } else {
        name = row[1]._;
      }

      var address = row[2];
      var mac = row[3];
      var connection;

      if(row[4].DIV[0].A) {
        connection = row[4].DIV[0].A[0].IMG[0]._;
      } else if(row[4].DIV[0].IMG){
        connection = row[4].DIV[0].IMG[0]._;
      } else {
        connection = false;
      }

      list.push({
        id: id,
        name: name,
        address: address,
        mac: mac,
        connection: connection,
        state: connected
      });
    }

    callback(null, {
      results: list
    });
  });
};

/**
 * Parses the network_user_devices.lua page to obtain the port-forwarding rules
 **/
internals.readHTML = function(body, callback) {

  internals.readDeviceTable(body, 'uiLanActive', true, function(error, active) {

    if(error) {
      return callback(error);
    }

    internals.readDeviceTable(body, 'uiLanPassive', false, function(error, inactive) {

      if(error) {
        return callback(error);
      }

      var results = active.results;
      for(var i = 0; i < inactive.results.length; i++) {
        results.push(inactive.results[i]);
      }

      return callback(null, {
        results: results
      });
    });
  });
};

/**
 * Obtains the currently configured devices
 **/
internals.get = function(options, callback) {
  request.get(
    'http://' + options.host + '/net/network_user_devices.lua?sid=' + options.sid,
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
    console.log('Missing parameter.\nUsage: node index.js devices [list]');
    return;
  }

  if(['list'].indexOf(params[0]) === -1) {
    console.log('Wrong parameter.\nUsage: node index.js devices [list]');
    return;
  }

  module.exports[params[0]].call(null, options, params, function(err, data) {

    if(err) {
      return callback(err);
    }

    if(options.print) {
      for(var i = 0; i < data.results.length; i++) {
        if(data.results[i].state) {
          console.log('  [*] ' + data.results[i].id + ' - ' + data.results[i].name + ' (' + data.results[i].connection + ') IP: ' + data.results[i].address + ' MAC: ' + data.results[i].mac);
        } else {
          var row = '  [ ] ' + data.results[i].id + ' - ' + data.results[i].name;
          if(data.results[i].connection) {
            row += ' (' + data.results[i].connection + ')';
          }
          console.log(row);
        }
      }
    }

    callback(null, data);
  });
};

/**
 * Lists the currently configured devices
 **/
module.exports.list = function list(options, params, callback) {

  internals.get(options, function(error, body) {

      if(error) {
        return callback(error);
      }

      internals.readHTML(body, callback);
    }
  );
};
