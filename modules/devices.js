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
internals.readTables = function(body, callback) {

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
 * Read device information
 **/
internals.readForm = function(body, callback) {
  // Find <form> element with the information we want and strip it out
  var form = body.substr(body.indexOf('<form name="main_form"'));
  form = form.substr(0, form.indexOf('</form>') + '</form>'.length);

  xml2js.parseString(form, function(err, data) {

    if(err) {
      return callback(err);
    }

    var divs = data.FORM.INPUT[0].HR[0].DIV;

    var plc_desc = divs[0].INPUT[0].$.VALUE;
    var dev_name = divs[1].INPUT[0].$.VALUE;
    var static_dhcp = (divs[4].INPUT[0].$.CHECKED === 'checked')?'on':'';

    var kisi_profile;
    var kisi_profile_select = divs[21].HR[0].DIV[3].TABLE[0].TR[1].TD[2].SELECT[0].OPTION;
    for(var i = 0; i < kisi_profile_select.length; i++) {
      if(kisi_profile_select[i].$.SELECTED === 'selected') {
        kisi_profile = kisi_profile_select[i].$.VALUE;
      }
    }

    var auto_wakeup = (divs[22].HR[0].DIV[0].INPUT[0].$.CHECKED === 'checked')?'on':'';
    var btn_wake = '';

    callback(null, {
      result: {
        plc_desc: plc_desc,
        dev_name: dev_name,
        static_dhcp: static_dhcp,
        kisi_profile: kisi_profile,
        auto_wakeup: auto_wakeup,
        btn_wake: btn_wake
      }
    });
  });
};

/**
 * Obtains the currently configured devices
 **/
internals.getList = function(options, callback) {
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
 * Get specific device settings
 **/
internals.get = function(options, device_id, callback) {

  request.get(
    'http://' + options.host + '/net/edit_device.lua?dev=' + device_id + '&sid=' + options.sid,
    function(error, response, body) {

      if(error) {
        return callback(error);
      }

      callback(null, body);
    }
  );
};

internals.wake = function(options, form_params, callback) {

  request.post(
    'http://' + options.host + '/net/edit_device.lua?dev=' + form_params.dev + '&sid=' + options.sid,
    {
      form: form_params
    },
    function(error, response, body) {
      if(error) {
        return callback(error);
      }

      callback(null, body);
    }
  );
};

internals.print = {};

internals.print.list = function list(data) {
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
};

internals.print.info = function list(data) {

  console.log('  Device: ' + data.result.dev_name);
  console.log('  Static address: ' + (data.result.static_dhcp === ''?'off':'on'));
  console.log('  Child security profile: ' + data.result.kisi_profile);
  console.log('  Auto Wake On LAN: ' + (data.result.auto_wakeup === ''?'off':'on'));
};

/**
 * The exposed function
 **/
module.exports = function main(options, params, callback) {

  if(!params.length) {
    console.log('Missing parameter.\nUsage: node index.js devices [list|info <device_id>]|wake <device_id>');
    return;
  }

  if(['list', 'info', 'wake'].indexOf(params[0]) === -1) {
    console.log('Wrong parameter.\nUsage: node index.js devices [list|info <device_id>|wake <device_id>]');
    return;
  }

  module.exports[params[0]].call(null, options, params.slice(1), function(err, data) {

    if(err) {
      return callback(err);
    }

    if(options.print && internals.print[params[0]]) {
      internals.print[params[0]](data);
    }

    callback(null, data);
  });
};

/**
 * Lists the currently configured devices
 **/
module.exports.list = function list(options, params, callback) {

  internals.getList(options, function(error, body) {

      if(error) {
        return callback(error);
      }

      internals.readTables(body, callback);
    }
  );
};

/**
 * Retrieves information about a device
 **/
module.exports.info = function info(options, params, callback) {

  if(params.length === 0) {
    return callback(new Error('Missing device id'));
  }

  internals.get(options, params[0], function(error, body) {

    if(error) {
      return callback(error);
    }

    internals.readForm(body, callback);
  });
};

/**
 * Wakes the device (requires that the device has WOL configured)
 **/
module.exports.wake = function wake(options, params, callback) {

  module.exports.info(options, params, function(error, data) {

    if(error) {
      return callback(error);
    }

    var form_params = data.result;
    form_params.dev = params[0];
    form_params.btn_wake = '';
    form_params.last_action = '';

    internals.wake(options, form_params, callback);
  });
};
