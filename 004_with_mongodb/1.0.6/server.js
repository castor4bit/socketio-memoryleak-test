var argv = require('argv');
var args = argv.option([
  { name: 'port',         short: 'p',   type: 'int' },
  { name: 'mongodb_host', short: 'mh',  type: 'string' },
  { name: 'mongodb_port', short: 'mp',  type: 'int' }
]).run();

var port = args.options.port  || 4000;
var mongodb_host = args.options.mongodb_host  || 'localhost';
var mongodb_port = args.options.mongodb_port  || 27017;

var io    = require('socket.io').listen(port);
var debug = require('debug')('memoryleak-test');

var mongoose = require('mongoose');
mongoose.connect('mongodb://'+ mongodb_host +':'+ mongodb_port +'/memoryleak-test');

var Idol = mongoose.model('Idol', mongoose.Schema({
  id: String,
  name: String
}));

io.sockets.on('connection', function(socket) {
  debug('connected: '+ socket.id);

  socket.on('message', function(data) {
    debug('receive message: '+ socket.id);

    var ichigo = new Idol({
      id: socket.id,
      name: 'Ichigo Hoshimiya'
    });
    ichigo.save(function(err) {
      if (err) console.error('error');

      io.sockets.emit('message', data);
    });
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
}, 3000);
