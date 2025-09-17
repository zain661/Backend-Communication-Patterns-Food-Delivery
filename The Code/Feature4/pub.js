const express = require('express');
const { EventEmitter } = require('events');
const cors = require('cors'); 

const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json());

class PubSub extends EventEmitter {}
//the topic is represented by the EventEmitter (pubsub), /Role: Acts as the intermediary between Publisher (POST /orders) and Subscribers (Dashboards via SSE)
const pubsub = new PubSub();

let clients = [];

app.get('/orders/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

pubsub.on('newOrder', (order) => {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(order)}\n\n`); //The official formula for sending a new message via an open SSE connection.
  });
  console.log('Notification sent to dashboards:', order);
});

app.post('/orders', (req, res) => {
  const order = req.body;
  console.log('Publisher: New order received:', order);
//All subscribers receive any new order immediately.
  pubsub.emit('newOrder', order);

  console.log('Publisher: Event "newOrder" emitted');
  res.status(200).send({ status: 'Order placed' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//Summary For me
/*Issue When Notification Server is Separate

Problem: EventEmitter only works within the same Node.js process.
If you run Publisher and Notification Service in separate processes without Redis or a message broker, 
the Notification Service never receives events → dashboards don’t update.

Solution: Keep Publisher + Notification Service in the same process OR use Redis/pub-sub for cross-process communication. 

the keys:
EventEmitter = in-process pub-sub (topic layer).

SSE = one-way real-time updates to dashboards.

Dashboards can be multiple clients → all receive same events.

Separate processes break EventEmitter → need central broker for cross-process.

Frontend server needed only to bypass browser CORS restrictions.

the workflow:
Customer → POST /orders.

Publisher → emit event → topic.

Notification Service → hears event.

SSE (already open from dashboard) → server pushes data.

Dashboard → updates UI.

*/
