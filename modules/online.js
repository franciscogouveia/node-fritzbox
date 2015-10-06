'use strict';

var request = require('request');
var xml2js = new require('xml2js').Parser({
  'strict': false,
  'trim': true,
  'normalize': true
});

var internals = {};

internals.stripOutElement = function(body, element, id, callback) {
  var startTag = '<' + element + '';
  var closeTag = '</' + element + '>';
  var idAttr = ' id="' + id + '"';

  // Find <element> with the information we want and strip it out
  var content = body;
  var found = false;

  do {
    // console.log('Searching for startTag... ' + content.substr(0, 30));
    var index = content.indexOf(startTag);

    if(index === -1) {
      return callback(new Error('Could not find element ' + startTag + idAttr + '>'));
    }

    content = content.substr(index);

    var attrIndex = content.indexOf(idAttr);

    if(attrIndex === -1) {
      // Try again with single quote
      idAttr = ' id=\'' + id + '\'';
      attrIndex = content.indexOf(idAttr);

      if(attrIndex === -1) {
        return callback(new Error('Could not find element ' + startTag + idAttr + '>'));
      }
    }

    if(content.indexOf('>') < attrIndex) {
      // found = false;
      content = content.substr(startTag.length);
    } else {
      found = true;
    }
  } while(!found);

  // Found element <element ... id="id"...>

  // Now, search for the closing tag
  var currentIndex = 1;
  var levels = 0;
  found = false;

  do {
    // console.log('Searching for closeTag... ' + currentIndex + ': ' + content.substr(currentIndex, 10));
    var nextStartTagIndex = content.indexOf(startTag, currentIndex);
    var nextCloseTagIndex = content.indexOf(closeTag, currentIndex);

    if(nextCloseTagIndex === -1) {
      return callback(new Error('Element ' + startTag + ' doesn\'t have a respective closing tag'));
    }

    if(nextStartTagIndex !== -1 && nextStartTagIndex < nextCloseTagIndex) {
      // There is another open tag
      currentIndex = nextStartTagIndex;
      levels++;
    } else {
      // Next is a closing tag
      currentIndex = nextCloseTagIndex;
      levels--;
    }

    currentIndex++;

  } while(levels > 0);

  var result = content.substr(0, currentIndex + closeTag.length - 1);

  callback(null, result);
};

internals.readIPAddress = function(body, callback) {
  var before = 'IP-Adresse: ';
  var after = '</span>';

  var indexStart = body.indexOf(before);

  if(indexStart === -1) {
    return callback(new Error('Could not retrieve IP address: Not found'));
  }

  var content = body.substr(indexStart + before.length);

  var indexEnd = content.indexOf(after);

  if(indexEnd === -1) {
    return callback(new Error('Could not retrieve IP address: Bad parsing. Please report to https://github.com/franciscogouveia/node-fritzbox'));
  }

  content = content.substr(0, content.indexOf(after));

  callback(null, {
    result: {
      ip: content
    }
  });
};

internals.getOnlineStatus = function(options, callback) {
  request.get(
    'http://' + options.host + '/internet/inetstat_monitor.lua?sid=' + options.sid + '&useajax=1&action=get_table',
    function(error, response, body) {

      if(error) {
        return callback(error);
      }

      callback(null, body);
    }
  );
};


internals.print = {};

internals.print.ip = function ip(data) {

  console.log('Current online IP: ' + data.result.ip);
};

/**
 * The exposed function
 **/
module.exports = function main(options, params, callback) {

  if(!params.length) {
    console.log('Missing parameter.\nUsage: node index.js online [ip]');
    return;
  }

  if(['ip'].indexOf(params[0]) === -1) {
    console.log('Wrong parameter.\nUsage: node index.js online [ip]');
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
 * Read the current online IP address
 **/
module.exports.ip = function ip(options, params, callback) {

  internals.getOnlineStatus(options, function(error, body) {

    if(error) {
      return callback(error);
    }

    internals.readIPAddress(body, callback);
  });
}
