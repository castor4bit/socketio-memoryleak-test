var argv = require('argv');
var args = argv.option([
  { name: 'port',       short: 'p',   type: 'int' },
  { name: 'redis_host', short: 'rh',  type: 'string' },
  { name: 'redis_port', short: 'rp',  type: 'int' }
]).run();

var port = args.options.port  || 4000;
var redis_host = args.options.redis_host  || 'localhost';
var redis_port = args.options.redis_port  || 6379;

var io    = require('socket.io').listen(port);
var debug = require('debug')('memoryleak-test');

var RedisStore = require('socket.io/lib/stores/redis');
var redis = require('socket.io/node_modules/redis');

io.configure(function() {
  io.set('store', new RedisStore({
    redisPub:     redis.createClient(redis_port, redis_host),
    redisSub:     redis.createClient(redis_port, redis_host),
    redisClient:  redis.createClient(redis_port, redis_host)
  }));

  io.set('log level', 1);
});

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
}, 3000);
