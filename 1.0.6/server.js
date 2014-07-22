var argv = require('argv');
var args = argv.option([
  { name: 'port', short: 'p', type: 'int' }
]).run();

var port = args.options.port  || 4000;

var io    = require('socket.io').listen(port);
var debug = require('debug')('memoryleak-test');

io.sockets.on('connection', function(socket) {
  debug('connected: '+ socket.id);

  socket.on('message', function(data) {
    debug('receive message: '+ socket.id);

    io.sockets.emit('message', data);
  });
  socket.on('disconnect', function() {
    debug('disconnected: '+ socket.id);
  });
});

setInterval(function() {
  if (global.gc) {
    global.gc();
  }
  console.log(process.memoryUsage());
}, 5000);
