const mongoose = require('mongoose');

const barcodeSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  serialNumber: { type: String },
  barcodeValue: { type: String, required: true, unique: true },
  barcodeType: { type: String, default: 'CODE128' },
  lastUpdate: { type: String },
  remark: { type: String },
  areaManager: { type: String, required: true },
  supervisor: { type: String, required: true },
  mobileNumber: { type: String },
  location: { type: String },
  fault: { type: String },
  accepted: { type: String },
  deliveredBy: { type: String },
  asset: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Barcode', barcodeSchema);