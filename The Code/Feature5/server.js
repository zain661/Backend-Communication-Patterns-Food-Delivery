const express = require('express');
const http = require('http');
/*The WebSocket protocol provides a persistent, full-duplex communication channel over a single TCP connection,
allowing both the client and server to send messages independently. It achieves this through a handshake process that begins with a 
standard HTTP request. This initial HTTP request includes a header that asks to "upgrade" the connection. If the server agrees, it responds with a special status code (101 Switching Protocols), and the connection is then switched from HTTP to WebSocket. */
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const chatHistory = [];

//static file
app.use(express.static('public'));

// when new client connect to server by webSocket, this code runs
wss.on('connection', ws => {
  console.log('New client connected!');
  //send all the previous chat to show them on her conversation
  ws.send(JSON.stringify({ type: 'history', messages: chatHistory }));

  // listen messages from the client
  ws.on('message', message => {
    const data = JSON.parse(message);
    console.log(`Received data type: ${data.type}`);

    if (data.type === 'message') {
      console.log(`Received message: ${data.text}`);

      chatHistory.push(data);

      // send the message to all clients on chat
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'message', message: data }));
        }
      });
    }
    
    else if (data.type === 'typing') {
      // send the type message pointer to all other clients on chat
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'typing', user: data.user }));
        }
      });
    }
  });

  
  ws.on('close', () => {
    console.log('Client has disconnected!');
  });
});

// It starts listening for connections on port 3000.
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});