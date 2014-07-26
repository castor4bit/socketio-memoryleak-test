var _     = require('underscore');
var io    = require('socket.io-client');
var debug = require('debug')('memoryleak-test');

var argv = require('argv');
var args = argv.option([
  { name: 'host',       short: 'h', type: 'string' },
  { name: 'port',       short: 'p', type: 'int' },
  { name: 'client_num', short: 'c', type: 'int' },
  { name: 'data_type',  short: 'd', type: 'string' },
]).run();

var host        = args.options.host       || 'localhost';
var port        = args.options.port       || 4000;
var client_num  = args.options.client_num || 100;
var data_type   = args.options.data_type  || "string";

var url = 'http://'+ host +':'+ port;
var options = {
  forceNew: true
};

// dummy string ("XXXX..." 2000bytes)
var data = _.map(_.range(2000), function() { return "X"; }).join("");
if (data_type == "object") {
  data = { content: data };   // to object
}

var Client = function() {
  var id = null;
  var socket = null;

  return {
    connect: function(host, options) {
      var self = this;
      socket = io(url, options);

      socket.on('connect', function() {
        id = socket.io.engine.id;
        debug('connected: '+ id);

        socket.on('disconnect', function() {
          debug('disconnected');
        });

        self.onConnect();
      });
    },
    disconnect: function() {
      socket.disconnect();
    },
    getId: function() {
      return id;
    },
    onConnect: function() {}
  };
};

// initialize clients
var clients = [];
var init = function() {
  debug("----------------- initialize ----------------");

  var i;
  var client;
  var onConnect = function() {
    this.disconnect();
  };

  for (i = 0; i < client_num; i++) {
    client = new Client();
    client.onConnect = onConnect;
    client.connect(host, options);

    clients.push(client);
  }
};

// execute
init();
