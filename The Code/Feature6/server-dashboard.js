const express = require('express');
const app = express();
const PORT = 5500;

app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`Dashboard server running on http://localhost:${PORT}`);
});