var argv = require('argv');
var args = argv.option([
  { name: 'port', short: 'p', type: 'int' }
]).run();

var port = args.options.port  || 4000;

var io    = require('socket.io').listen(port);
var debug = require('debug')('memoryleak-test');

var heapdump = require('heapdump');

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

var count = 0;
setInterval(function() {
  if (global.gc) {
    global.gc();
  }
  console.log(++count, process.memoryUsage());

  var begin = 5;
  var end   = 20;
  if ((count == begin) || (count == end)) {
    var dumpfile = '/tmp/heapdump-'+ process.pid +'-'+ ((count == begin)? 'begin' : 'end') +'.heapsnapshot';
    console.log('Output heapdump to '+ dumpfile);
    heapdump.writeSnapshot(dumpfile);

    if (count == end) {
      process.exit();
    }
  }
}, 3000);
