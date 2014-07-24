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
  'force new connection': true
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
      socket = io.connect(url, options);

      socket.on('connect', function() {
        id = socket.socket.sessionid;
        debug('connected: '+ id);

        socket.on('message', function(data) {
          debug('message: '+ id);
          onMessage();
        });
        socket.on('disconnect', function() {
          debug('disconnected');
          onDisconnect();
        });

        onConnect();
      });
    },
    disconnect: function() {
      socket.disconnect();
    },
    getId: function() {
      return id;
    },
    sendMessage: function(data) {
      socket.emit("message", data);
    },
    onConnect: function() {},
    onDisconnect: function() {},
    onMessage: function() {}
  };
};

// initialize clients
var clients = [];
var init = function() {
  debug("----------------- initialize ----------------");

  var i;
  var client;
  onConnect = _.after(client_num, main);
  onDisconnect = _.after(client_num, init);
  onMessage = _.after(client_num * client_num, reset);

  for (i = 0; i < clients.length; i++) {
    clients[i] = null;
  }
  clients = [];

  for (i = 0; i < client_num; i++) {
    client = new Client();
    client.onConnect = onConnect;
    client.onDisconnect = onDisconnect;
    client.onMessage = onMessage;
    client.connect(host, options);

    clients.push(client);
  }
};

// reset
var reset = function() {
  debug("----------------- reset ----------------");

  for (var i = 0; i < client_num; i++) {
    clients[i].disconnect();
  }
};

// main
var main = function() {
  debug("----------------- main ----------------");

  var idx = 0;
  var wait = 1000 / client_num;
  var timer = setInterval(function() {
    if (idx >= client_num) {
      clearInterval(timer);
      return;
    }
    debug("send message: "+ idx);
    clients[idx].sendMessage(data);
    idx++;
  }, wait);
};

// execute
var onConnect = _.after(client_num, main);
var onMessage = _.after(client_num * client_num, reset);
init();

/*
setInterval(function() {
  if (global.gc) {
    global.gc();
  }
  console.log(process.memoryUsage());
}, 5000);
*/
