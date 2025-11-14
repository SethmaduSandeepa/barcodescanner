const express = require('express');
const router = express.Router();
const {
  getAllBarcodes,
  getBarcodeByValue,
  createBarcode,
  updateBarcode,
  deleteBarcode
} = require('../controllers/barcodeController');

router.get('/', getAllBarcodes);
router.get('/scan', getBarcodeByValue); // ?value=12345
router.post('/', createBarcode);
router.put('/:id', updateBarcode);
router.delete('/:id', deleteBarcode);

module.exports = router;