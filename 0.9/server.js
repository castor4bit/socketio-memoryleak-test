var io = require('socket.io').listen(9800);
io.set("log level", 1);

io.sockets.on('connection', function(socket) {
  console.log('connected: '+ socket.id);

  socket.on('message', function(data) {
    //console.log('message: '+ socket.id +" : "+ data);
    console.log('message: '+ socket.id);

    io.sockets.emit('message', data);
  });
  socket.on('disconnect', function() {
    console.log('disconnected: '+ socket.id);
  });
});

setInterval(function() {
  if (global.gc) {
    global.gc();
  }
  console.log(process.memoryUsage());
}, 5000);
