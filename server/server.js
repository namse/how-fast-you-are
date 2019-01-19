const express = require('express');
const socket = require('socket.io');
const http = require('http');
const fs = require('fs');
const path = require('path');
const dgram = require('dgram');

const app = express();
const server = http.Server(app);
const io = socket(server);

const clientPath = path.join(__dirname, '../../../../client/dist');
app.use(express.static(clientPath));
server.listen(58825);

const sockets = [];

io.on('connection', (socket) => {
  sockets.push(socket);

  socket.on('disconnect', () => {
    const index = sockets.indexOf(socket);
    if (index < 0) {
      return;
    }
    sockets.splice(index, 1);
  });

  socket.on('log', json => {
    console.log(json);
  });
});

function broadcast(event, ...args) {
  sockets.forEach(socket => socket.emit(event, ...args));
}

fs.watch(clientPath, () => {
  broadcast('refresh');
});

const udpServer = dgram.createSocket('udp4');

udpServer.on('error', (err) => {
  console.log(`udpServer error:\n${err.stack}`);
  udpServer.close();
});

udpServer.on('message', (msg, rinfo) => {
  console.log(`udpServer got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  broadcast('key', msg);
});

udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`udpServer listening ${address.address}:${address.port}`);
});

udpServer.bind(58825);