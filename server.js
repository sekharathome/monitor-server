const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Fix: Use __dirname instead of __currentDir
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('User connected to dashboard');

    // Relays commands from Web -> Phone
    socket.on('parent-command', (data) => {
        io.emit('phone-execute', data);
    });

    // Relays data from Phone -> Web
    socket.on('data-stream', (data) => socket.broadcast.emit('render-feed', data));
    socket.on('snapshot-received', (data) => socket.broadcast.emit('render-snapshot', data));
    socket.on('battery-update', (lvl) => socket.broadcast.emit('render-battery', lvl));
    socket.on('location-update', (coords) => socket.broadcast.emit('render-location', coords));
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));