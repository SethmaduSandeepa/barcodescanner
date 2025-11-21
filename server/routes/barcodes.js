
const express = require('express');
const router = express.Router();
const {
  getAllBarcodes,
  getBarcodeByValue,
  createBarcode,
  updateBarcode,
  deleteBarcode
} = require('../controllers/barcodeController');

// Route to get counts for all unique asset values
router.get('/asset-counts', async (req, res) => {
  const Barcode = require('../models/Barcode');
  try {
    console.log('Fetching distinct asset values...');
    const assets = await Barcode.distinct('asset');
    console.log('Assets found:', assets);
    const counts = {};
    for (const asset of assets) {
      const count = await Barcode.countDocuments({ asset });
      console.log(`Count for ${asset}:`, count);
      counts[asset] = count;
    }
    res.json(counts);
  } catch (err) {
    console.error('Error in /asset-counts:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route to get total count of registered laptops
router.get('/laptop-count', async (req, res) => {
  const Barcode = require('../models/Barcode');
  try {
    const laptopCount = await Barcode.countDocuments({ productName: /laptop/i });
    res.json({ laptopCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', getAllBarcodes);
router.get('/scan', getBarcodeByValue); // ?value=12345
router.post('/', createBarcode);
router.put('/:id', updateBarcode);
router.delete('/:id', deleteBarcode);

// Route to get counts of Head Office and Branch Office laptops
router.get('/counts', async (req, res) => {
  const Barcode = require('../models/Barcode');
  try {
    const headOfficeCount = await Barcode.countDocuments({ asset: { $regex: /head/i } });
    const branchOfficeCount = await Barcode.countDocuments({ asset: { $regex: /branch/i } });
    res.json({ headOfficeCount, branchOfficeCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;