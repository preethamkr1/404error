const express = require('express');
const cors = require('cors');
const fileRoutes = require('./routes/fileRoutes');
const shopRoutes = require('./routes/shopRoutes');
const hardwarePrintRoutes = require('./routes/hardwarePrintRoutes');

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
  exposedHeaders: ["Content-Disposition"]
}));
app.use(express.json());

app.use('/api/files', fileRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/hardware-print', hardwarePrintRoutes);

const PORT = 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app; 