/**
 * Test starter - with this version of sails.js we can only start one sails server,
 * to solve this problem we use only one before All and after All to start and
 * stop the server
 */

var Sails = require('sails');
var _ = require('lodash');
var server;

global.DOMAIN = 'http://localhost';
global.PORT = 3000;
global.HOST = DOMAIN + ':' + PORT;

before(function(callback) {
  this.timeout(10000);

  var configs = {
    log: {
      level: 'info'
    },
    connections: {
      memory: {
        // lets use memory tests ...
        adapter: 'sails-memory'
      }
    },
    models: {
      connection: 'memory'
    },
    port: PORT,
    environment: 'test',

    // @TODO needs suport to csrf token
    csrf: false,

    // we dont need this configs in API test
    hooks: {
      grunt: false,
      socket: false,
      pubsub: false
    }
  };

  Sails.load(configs, function(err, sails) {
    if (err) {
      console.error(err);
      return callback(err);
    }

    // here you can load fixtures, etc.
    server = sails;
    callback(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  server.lower(done);
});