// Run this script with: node fixAssets.js
// It will update all barcode documents to set the asset field based on productName or barcodeValue

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const Barcode = require('./models/Barcode');

async function fixAssets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Example: Set asset for DELL as Head Office, HP as Branch Office
    const dellResult = await Barcode.updateMany(
      { productName: /dell/i },
      { $set: { asset: 'Head Office' } }
    );
    console.log('Updated DELL barcodes:', dellResult.modifiedCount);

    const hpResult = await Barcode.updateMany(
      { productName: /hp/i },
      { $set: { asset: 'Branch Office' } }
    );
    console.log('Updated HP barcodes:', hpResult.modifiedCount);

    // Set asset to Head Office for any missing asset field
    const defaultResult = await Barcode.updateMany(
      { asset: { $exists: false } },
      { $set: { asset: 'Head Office' } }
    );
    console.log('Set default asset for missing:', defaultResult.modifiedCount);

    console.log('✅ Asset field update complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixAssets();
