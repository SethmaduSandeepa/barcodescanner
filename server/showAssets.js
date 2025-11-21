// Run this script with: node showAssets.js
// It will print all barcode documents and their asset fields for debugging

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const Barcode = require('./models/Barcode');

async function showAssets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    const docs = await Barcode.find({}, { asset: 1, productName: 1, barcodeValue: 1 });
    console.log('Barcodes with asset field:');
    docs.forEach(doc => {
      console.log(doc);
    });
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

showAssets();
