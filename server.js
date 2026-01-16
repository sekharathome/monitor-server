const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const io = new Server(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log(`Device Connected: ${socket.id}`);
    
    // Immediately tell the web that a device is online
    socket.broadcast.emit('device-status', { online: true });

    // Relay the battery number (e.g., 85) directly to the web
    socket.on('battery-status', (data) => {
        socket.broadcast.emit('ui-battery', data);
    });

    socket.on('disconnect', () => {
        console.log("Device Offline");
        socket.broadcast.emit('device-status', { online: false });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
