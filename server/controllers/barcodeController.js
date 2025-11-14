const Barcode = require('../models/Barcode');

const getAllBarcodes = async (req, res) => {
  try {
    const { barcodeValue } = req.query;
    let barcodes;
    if (barcodeValue) {
      barcodes = await Barcode.find({ barcodeValue });
    } else {
      barcodes = await Barcode.find().sort({ createdAt: -1 });
    }
    res.json(barcodes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBarcodeByValue = async (req, res) => {
  const { value } = req.query;
  if (!value) return res.status(400).json({ error: 'Barcode value required' });

  try {
    console.log('Searching for barcodeValue:', value);
    const barcode = await Barcode.findOne({ barcodeValue: value });
    console.log('Query result:', barcode);
    if (!barcode) return res.status(404).json({ error: 'Barcode not found' });
    res.json(barcode);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createBarcode = async (req, res) => {
  try {
    const newBarcode = new Barcode(req.body);
    await newBarcode.save();
    res.status(201).json(newBarcode);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate productId or barcodeValue' });
    }
    res.status(500).json({ error: err.message });
  }
};

const updateBarcode = async (req, res) => {
  try {
    const updated = await Barcode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteBarcode = async (req, res) => {
  try {
    const deleted = await Barcode.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllBarcodes,
  getBarcodeByValue,
  createBarcode,
  updateBarcode,
  deleteBarcode
};