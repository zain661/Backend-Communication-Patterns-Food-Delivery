const express = require('express');
const app = express();
const PORT = 5500;

// يخدم كل الملفات في المجلد الحالي
app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`Dashboard server running on http://localhost:${PORT}`);
});

//Summary For me
/*Why a Frontend Server (5500) is Needed

Opening index.html via file:// → Browser blocks SSE due to CORS / cross-origin rules.

Running a simple server (serverDashboard.js) → serves HTML over HTTP → browser allows SSE to connect to http://localhost:3000/orders/stream.

Alternative: add Access-Control-Allow-Origin: * on SSE endpoint or use Live Server in VSCode. */