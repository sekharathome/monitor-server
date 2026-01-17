const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Forward battery data to web
    socket.on('battery-status', (data) => {
        socket.broadcast.emit('ui-battery', data);
    });

    // Web Dashboard requests SMS from Phone
    socket.on('get-sms-request', () => {
        socket.broadcast.emit('get-sms-request');
    });

    // Phone sends SMS logs to Web
    socket.on('sms-data-log', (data) => {
        socket.broadcast.emit('ui-sms-display', data);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('device-status', { online: false });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
