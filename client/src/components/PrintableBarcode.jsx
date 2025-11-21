import React, { forwardRef } from 'react';

const PrintableBarcode = forwardRef(({ barcode }, ref) => (
  <div
    ref={ref}
    style={{
      width: '4.33in',
      height: '2.56in',
      padding: '0.15in',
      margin: '0',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      pageBreakAfter: 'avoid',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflow: 'hidden',
      position: 'relative',
      zoom: 1
    }}
  >
    <style>{`
      @media print {
        @page {
          size: 4.33in 2.56in;
          margin: 0;
        }
        body, html {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .barcode-label, #root > div {
          width: 4.33in !important;
          height: 2.56in !important;
          margin: auto !important;
          padding: 0.15in !important;
          box-sizing: border-box !important;
          background: white !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      }
    `}</style>
    <div style={{ textAlign: 'center', marginBottom: '0.08in' }}>
        {barcode.productName && (
          <h3 style={{ margin: '0 0 0.05in 0', fontSize: '18px', fontWeight: '900', letterSpacing: '1px' }}>
            {barcode.productName}
          </h3>
        )}
        {barcode.serialNumber && (
          <p style={{ margin: '0', fontSize: '12px', color: '#222', fontWeight: '700', letterSpacing: '0.5px' }}>
            SN: {barcode.serialNumber}
          </p>
        )}
        {barcode.asset && (
          <div style={{ fontSize: '14px', marginBottom: '2px', color: '#333' }}><strong>Asset:</strong> {barcode.asset}</div>
        )}
        {barcode.asset === 'Head Office'
          ? barcode.areaManager && (
              <div style={{ fontSize: '14px', marginBottom: '2px', color: '#333' }}><strong>User:</strong> {barcode.areaManager}</div>
            )
          : barcode.areaManager && (
              <div style={{ fontSize: '14px', marginBottom: '2px', color: '#333' }}><strong>Area Manager:</strong> {barcode.areaManager}</div>
            )
        }
        {barcode.supervisor && (
          <div style={{ fontSize: '14px', marginBottom: '2px', color: '#333' }}><strong>Supervisor:</strong> {barcode.supervisor}</div>
        )}
        {barcode.mobileNumber && (
          <div style={{ fontSize: '14px', marginBottom: '2px', color: '#333' }}><strong>Contact Number:</strong> {barcode.mobileNumber}</div>
        )}
    </div>
    <div style={{ textAlign: 'center', flex: '1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {barcode.barcodeValue ? (
        <svg ref={(el) => {
          if (el) {
            import('jsbarcode').then(({ default: JsBarcode }) => {
              JsBarcode(el, barcode.barcodeValue, {
                format: barcode.barcodeType || 'CODE128',
                displayValue: true,
                fontSize: 12,
                lineColor: '#000',
                width: 2,
                height: 40,
                margin: 0
              });
            });
          }
        }} />
      ) : (
        <span style={{ color: '#c00', fontSize: '12px' }}>Enter a valid barcode value</span>
      )}
    </div>
    <div style={{ marginTop: 'auto' }}>
        {barcode.lastUpdate && (
          <p style={{
            textAlign: 'center',
            fontSize: '10px',
            color: '#059669',
            margin: '0.03in 0',
            fontWeight: '700',
            wordWrap: 'break-word',
            lineHeight: '1.2',
            letterSpacing: '0.5px'
          }}>
            Last Updated: {barcode.lastUpdate}
          </p>
        )}
    </div>
  </div>
));

export default PrintableBarcode;