const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');

// Fix: Add CORS and compatibility for Android Socket.io clients
const io = require('socket.io')(http, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    },
    allowEIO3: true // Required if your Android app uses Socket.io v2.x
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('✅ A device connected (Phone or Dashboard):', socket.id);

    // Relays commands from Web Dashboard -> Phone
    socket.on('parent-command', (data) => {
        console.log('📡 Dashboard sent command:', data);
        io.emit('phone-execute', data);
    });

    // Relays data from Phone -> Web Dashboard
    socket.on('data-stream', (data) => {
        socket.broadcast.emit('render-feed', data);
    });

    socket.on('battery-update', (lvl) => {
        console.log('🔋 Battery Level:', lvl);
        socket.broadcast.emit('render-battery', lvl);
    });

    socket.on('location-update', (coords) => {
        console.log('📍 Location Received:', coords);
        socket.broadcast.emit('render-location', coords);
    });

    socket.on('disconnect', () => {
        console.log('❌ Device disconnected');
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`🚀 Server monitoring active on port ${PORT}`);
});
