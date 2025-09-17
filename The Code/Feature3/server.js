const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 3000;

let driverLocation = { lat: 31.9515, lng: 35.9396 };

app.get('/driver-location', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send an initial comment to keep connection open
  res.write(': connected\n\n');

  const sendLocation = () => {
    // Update driver location (simulate movement)
    driverLocation.lat += (Math.random() - 0.5) * 0.0005;
    driverLocation.lng += (Math.random() - 0.5) * 0.0005;

    res.write(`data: ${JSON.stringify(driverLocation)}\n\n`);
  };

  sendLocation();
  
  const intervalId = setInterval(sendLocation, 10000); // every 10 seconds
  req.on('close', () => {
    clearInterval(intervalId);
    console.log('Client disconnected');
  });
});

app.listen(PORT, () => console.log(`SSE server running on port ${PORT}`));

