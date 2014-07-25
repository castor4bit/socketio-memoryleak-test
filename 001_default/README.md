## socket.io memory-leak test

```
0.9.17/
  client.js
  server.js
1.0.6/
  client.js
  server.js
```

### How to use

```sh
$ cd 0.9.17/
$ npm install
$ node --expose_gc server.js
$ node client.js
```

```sh
# show memory usage per 5 minutes

$ node --expose_gc server.js
{ rss: 24551424, heapTotal: 15551232, heapUsed: 5286496 }
{ rss: 24367104, heapTotal: 16571136, heapUsed: 5279760 }
{ rss: 24383488, heapTotal: 16571136, heapUsed: 5290424 }
...
```

#### debug messages

```sh
$ DEBUG=* node --expose_gc server.js
$ DEBUG=* node client.js
```

#### options

```sh
$ node client.js -d string    # send message as string
$ node client.js -d object    # send message as object
```
