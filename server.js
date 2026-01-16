const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const io = new Server(server, {
    cors: { origin: "*" },
    maxHttpBufferSize: 2e7 
});

io.on('connection', (socket) => {
    console.log(`Device Connected: ${socket.id}`);
    
    // 1. Tell the web dashboard a device just came online
    socket.broadcast.emit('device-status', { online: true });

    // 2. Relay Battery Data (from your MonitorService.java)
    socket.on('battery-status', (data) => {
        socket.broadcast.emit('ui-battery', data); 
    });

    // 3. General Data Relays
    socket.on('data-stream', (data) => socket.broadcast.emit('data-stream', data));
    socket.on('audio-stream', (data) => socket.broadcast.emit('audio-stream', data));
    socket.on('file-list', (data) => socket.broadcast.emit('file-list', data));
    socket.on('file-download-ready', (data) => socket.broadcast.emit('file-download-ready', data));
    socket.on('notif-data', (data) => socket.broadcast.emit('notif-data', data));

    socket.on('command', (cmd) => socket.broadcast.emit('command', cmd));

    // 4. Handle Disconnection immediately
    socket.on('disconnect', () => {
        console.log("Device Offline");
        socket.broadcast.emit('device-status', { online: false });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
