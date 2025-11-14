import JsBarcode from 'jsbarcode';

export const generateBarcodeSVG = (value, type = 'CODE128') => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, value, {
    format: type,
    displayValue: true,
    fontSize: 16,
    lineColor: '#000',
    backgroundColor: '#fff',
    margin: 10
  });
  return canvas.toDataURL('image/png');
};