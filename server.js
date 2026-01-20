const http = require('http');
const WebSocket = require('ws');
const port = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('WebRTC Signaling Server is Running');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Relay signaling data (SDP/Ice Candidates) to the other client
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
});

server.listen(port, '0.0.0.0', () => console.log(`Signaling on port ${port}`));
