'use strict';

var Code = require('code');
var Lab = require('lab');

var proxyquire =  require('proxyquire');
var fs = require('fs');
var lab = exports.lab = Lab.script();
var experiment = lab.experiment;
var it = lab.it;
var expect = Code.expect;

var login = require('../modules/login');

experiment('Port forwardings', function() {
  require('dotenv').load();

  var options = {
    'host': process.env.FB_HOST || 'fritz.box'
  };


  lab.test('Obtain list of configured port forwardings', function(done) {

    var pf = proxyquire('../modules/port-forwarding', {
      'request': {
        'get': function get(url, callback) {

          if(url.indexOf('/internet/port_fw.lua') === -1) {
            return callback(new Error('Not supposed to happen...'));
          }

          // Open dummy file
          fs.readFile(__dirname + '/artifacts/port-forwarding-list.html', 'utf8', function(err, data) {
            // err, request, body
            callback(err, undefined, data);
          });
        }
      }
    });

    pf.call(null, options, ['list'], function(err, result) {

      Code.expect(err).to.not.exist();
      Code.expect(result.results).to.exist();
      Code.expect(result.results.length).to.equal(3);

      Code.expect(result.results[0].id).to.equal('active_1');
      Code.expect(result.results[0].name).to.equal('HTTP-Server');
      Code.expect(result.results[0].state).to.equal('disabled');

      Code.expect(result.results[1].id).to.equal('active_2');
      Code.expect(result.results[1].name).to.equal('HTTPS-Server');
      Code.expect(result.results[1].state).to.equal('disabled');

      Code.expect(result.results[2].id).to.equal('active_3');
      Code.expect(result.results[2].name).to.equal('SSH');
      Code.expect(result.results[2].state).to.equal('enabled');

      done();
    });
  });
});
