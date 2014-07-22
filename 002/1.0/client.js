var _ = require('underscore');

var argv = require('argv');
var args = argv.option([
  { name: 'port', short: 'p', type: 'int' },
  { name: 'host', short: 'h', type: 'string' },
  { name: 'clients',    short: 'c', type: 'int' },
  { name: 'data_size',  short: 'd', type: 'int' },
]).run();

var port          = args.options.port         || 4000;
var host          = args.options.host         || 'localhost';
var client_num    = args.options.clients      || 100;
var data_size     = args.options.data_size    || 2000;

var io = require('socket.io-client');
var options = {
  forceNew: true
};
var _data = "";
for (var i=0; i<data_size; i++) {
  _data += "X";
}
var data = {
  content: _data
};

var received = 0;
var Client = function() {
  var id = null;
  var socket = null;

  return {
    connect: function(host, options) {
      socket = io('http://'+ host +":"+ port, options);

      socket.on('connect', function() {
        id = socket.io.engine.id;
        console.log('connected: '+ id);

        socket.on('message', function(data) {
          console.log('message: '+ id);
          onMessage();
        });
        socket.on('disconnect', function() {
          console.log('disconnected');
        });

        onConnect();
      });
    },
    getId: function() {
      return id;
    },
    sendMessage: function(data) {
      socket.emit("message", data);
    },
    onConnect: function() {},
    onMessage: function() {}
  };
};

// initialize clients
var clients = [];
var connected = 0;
var init = function() {
  console.log("----------------- initialize ----------------");

  var client;
  for (var i=0; i<client_num; i++) {
    client = new Client();
    client.onConnect = onConnect;
    client.onMessage = onMessage;
    client.connect(host, options);

    clients.push(client);
  }
};

// reset
var reset = function() {
  console.log("----------------- reset ----------------");

  onMessage = _.after(client_num * client_num, reset);
  for (var i=0; i<client_num; i++) {
    clients[i].onMessage = onMessage;
  }
  main();
};

// main
var main = function() {
  console.log("----------------- main ----------------");

  var idx = 0;
  var wait = 1000 / client_num;
  var timer = setInterval(function() {
    if (idx >= client_num) {
      clearInterval(timer);
      return;
    }
    console.log("send message: "+ idx);
    clients[idx].sendMessage(data);
    idx++;
  }, wait);
};

// execute
var onConnect = _.after(client_num, main);
var onMessage = _.after(client_num * client_num, reset);
init();

