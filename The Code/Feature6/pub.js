const express = require('express');
const { EventEmitter } = require('events');
const cors = require('cors'); 

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json());
class PubSub extends EventEmitter {}
const pubsub = new PubSub();

let clients = [];
app.get('/announcements/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.push(res);
  console.log(`New client connected. Total clients: ${clients.length}`);

  res.write('data: {"text": "Welcome! Connected to announcements stream."}\n\n');

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
    console.log(`Client disconnected. Total clients: ${clients.length}`);
  });
});

pubsub.on('newAnnouncement', (announcement) => {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(announcement)}\n\n`); 
  });
  console.log('Announcement sent to clients:', announcement);
});

app.post('/announcements/send', (req, res) => {
  const announcement = req.body;
  console.log('Publisher: New announcement received:', announcement);
  pubsub.emit('newAnnouncement', announcement);

  console.log('Publisher: Event "newAnnouncement" emitted');
  res.status(200).send({ status: 'Announcement published' });
});

app.listen(PORT, () => {
  console.log(`Announcements server running on http://localhost:${PORT}`);
});