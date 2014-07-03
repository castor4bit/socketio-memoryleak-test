var io = require('socket.io-client');
var dummy = "X";
for (var i=0; i<11; i++) {
  dummy += dummy;
}

function _main() {
  var socket = io.connect('http://localhost/', {
    'force new connection': true,
    port: 9800
  });

  socket.on('connect', function() {
    var id = socket.socket.sessionid;
    console.log('connected: '+ id);

    setInterval(function() {
      socket.emit("message", dummy);
    }, 3000);

    socket.on('message', function(data) {
      //console.log('message: '+ id +" : "+ data);
      console.log('message: '+ id);
    });
    socket.on('disconnect', function() {
      console.log('disconnected');
    });
  });
}

_main();
_main();
_main();
