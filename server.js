const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const io = new Server(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log(`Device Connected: ${socket.id}`);
    
    socket.broadcast.emit('device-status', { online: true });

    // UPDATE THIS PART: Receive the object {percent: 85, charging: true}
    socket.on('battery-status', (data) => {
        // Log it to your console to verify it's working
        console.log("Battery Update:", data); 
        
        // Send the whole object to the HTML dashboard
        socket.broadcast.emit('ui-battery', data);
    });

    socket.on('disconnect', () => {
        console.log("Device Offline");
        socket.broadcast.emit('device-status', { online: false });
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});



