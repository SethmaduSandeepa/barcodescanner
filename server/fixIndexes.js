const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('barcodes');
    
    // Get existing indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);
    
    // Drop the productId index if it exists
    try {
      await collection.dropIndex('productId_1');
      console.log('✅ Dropped productId_1 index');
    } catch (err) {
      console.log('productId_1 index does not exist or already dropped');
    }
    
    console.log('✅ Index cleanup complete');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

fixIndexes();
