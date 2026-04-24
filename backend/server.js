const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ mesaj: "Conexiune reușită cu SIGKILL Backend! 🚀" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🔥 Serverul rulează pe http://localhost:${PORT}`);
});