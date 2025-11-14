const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const barcodeRoutes = require('./routes/barcodes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/barcodes', barcodeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Barcode API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});