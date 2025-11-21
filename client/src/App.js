import React, { useState, useRef } from 'react';
import PrintableBarcode from './components/PrintableBarcode';
import './print-landscape.css';
import { useReactToPrint } from 'react-to-print';

export default function App() {
    // State for editing scanned barcode
    const [editingBarcode, setEditingBarcode] = useState(null);
    const [editMode, setEditMode] = useState(false);
    // State for asset counts
    const [assetCounts, setAssetCounts] = useState({});
    React.useEffect(() => {
      (async () => {
        try {
          const { api } = await import('./services/api');
          const res = await api.get('/barcodes/asset-counts');
          setAssetCounts(res);
        } catch (err) {
          setAssetCounts({ error: 'Error fetching asset counts' });
        }
      })();
    }, []);
  const [barcodeForm, setBarcodeForm] = useState({
    productName: '',
    serialNumber: '',
    barcodeValue: '',
    lastUpdate: '',
    areaManager: '',
    supervisor: '',
    mobileNumber: '',
    location: '',
    fault: '',
    accepted: '',
    deliveredBy: '',
    remark: ''
  });
  const barcodeRef = useRef();
  // Scan input state and scanned barcode details
  const [scanValue, setScanValue] = useState("");
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");

  // Fetch barcode details by scanned value
  const handleScan = async (e) => {
    const value = e.target.value.trim().toUpperCase();
    setScanValue(value);
    setScanError("");
    setScannedBarcode(null);
    if (value) {
      setScanLoading(true);
      try {
        const { api } = await import("./services/api");
        const res = await api.get(`/barcodes/scan?value=${value}`);
        console.log('API response:', res);
        if (res && !res.error) {
          setScannedBarcode(res);
        } else {
          setScanError("No barcode found.");
        }
      } catch (err) {
        // If error is due to invalid JSON (HTML response), show specific message
        if (err.message && err.message.includes('Unexpected token')) {
          setScanError("Error: Received invalid response from server. Backend may not be running or endpoint is incorrect.");
        } else {
          setScanError("Error: " + (err.message || "No barcode found."));
        }
      }
      setScanLoading(false);
    } else { 
      setScannedBarcode(null);
      setScanLoading(false);
    }
  };

  // Automatically update barcodeValue when serialNumber changes
  const handleSerialChange = (e) => {
    const serial = e.target.value.toUpperCase();
    setBarcodeForm(form => ({
      ...form,
      serialNumber: serial,
      barcodeValue: serial // barcodeValue is always the serial number
    }));
  };

  // Use react-to-print for printing
  const handlePrint = useReactToPrint({
    content: () => barcodeRef.current
  });

  return (
    <React.Fragment>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eef2f7 0%, #e0e7ff 100%)', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <nav style={{ background: 'white', borderRadius: '0 0 20px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', padding: '24px 40px', display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '32px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <img src="https://tse1.mm.bing.net/th/id/OIP.6ISiR68fTJizRexWth0ABQAAAA?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Logo" style={{ height: '80px', objectFit: 'contain', boxShadow: '0 2px 8px #e0e7ff', background: 'white', borderRadius: '20px', padding: '4px', marginBottom: '12px' }} />
            <span style={{ fontSize: '32px', fontWeight: '900', color: '#6366f1', letterSpacing: '2px', textAlign: 'center' }}>IT Department Asset Management System</span>
            {/* Asset counts display and Generate Report button */}
            <div style={{ marginTop: '18px', fontSize: '18px', fontWeight: '700', color: '#059669', background: '#f3f4f6', borderRadius: '12px', padding: '12px 24px', boxShadow: '0 2px 8px #05966922', display: 'inline-block', textAlign: 'left' }}>
              {assetCounts && typeof assetCounts === 'object' && !assetCounts.error ? (
                Object.entries(assetCounts).map(([asset, count]) => (
                  <div key={asset} style={{ marginBottom: '8px' }}>{asset}: <span style={{ color: '#2563eb' }}>{count}</span></div>
                ))
              ) : (
                <span style={{ color: 'red' }}>{assetCounts.error || 'No asset counts available'}</span>
              )}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <select id="assetReportSelect" style={{ padding: '10px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <option value="">Select Asset for Report</option>
                  {assetCounts && typeof assetCounts === 'object' && !assetCounts.error &&
                    Object.keys(assetCounts).map(asset => (
                      <option key={asset} value={asset}>{asset}</option>
                    ))}
                </select>
                <button
                  style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 2px 8px #2563eb33' }}
                  onClick={async () => {
                    const select = document.getElementById('assetReportSelect');
                    const selectedAsset = select.value;
                    if (!selectedAsset) {
                      alert('Please select an asset to download its report.');
                      return;
                    }
                    try {
                      const { api } = await import('./services/api');
                      const data = await api.get('/barcodes');
                      if (!Array.isArray(data)) {
                        alert('No barcode data found!');
                        return;
                      }
                      // Filter by selected asset
                      const filtered = data.filter(row => row.asset === selectedAsset);
                      if (filtered.length === 0) {
                        alert('No barcodes found for this asset.');
                        return;
                      }
                      const fields = ['productName','serialNumber','barcodeValue','barcodeType','lastUpdate','remark','areaManager','supervisor','mobileNumber','location','fault','accepted','deliveredBy','asset'];
                      const csvRows = [fields.join(',')];
                      for (const row of filtered) {
                        csvRows.push(fields.map(f => JSON.stringify(row[f] || '')).join(','));
                      }
                      const csvContent = csvRows.join('\n');
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `barcode_report_${selectedAsset.replace(/\s+/g,'_')}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    } catch (err) {
                      alert('Failed to generate report: ' + err.message);
                    }
                  }}
                >Download Asset Report</button>
              </div>
            </div>
          </div>
        </nav>
        {/* Scan Barcode Input */}
        <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)', padding: '24px 32px', maxWidth: '500px', width: '100%' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#2563eb', marginBottom: '12px', textAlign: 'center' }}>Scan Barcode</h2>
            <input
              type="text"
              placeholder="Scan or enter barcode value"
              value={scanValue}
              onChange={handleScan}
              style={{ width: '100%', padding: '12px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px' }}
            />
            {scanLoading && <div className="text-gray-500">Loading...</div>}
            {scanError && !scannedBarcode && <div className="text-red-500">{scanError}</div>}
            {scannedBarcode && (
              <div style={{
                background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)',
                borderRadius: '18px',
                boxShadow: '0 4px 24px rgba(99,102,241,0.10)',
                padding: '32px',
                marginTop: '24px',
                maxWidth: '600px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px solid #e0e7ff',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}>
                <h3 style={{
                  fontWeight: '900',
                  fontSize: '28px',
                  color: '#2563eb',
                  marginBottom: '18px',
                  letterSpacing: '1px',
                  textAlign: 'center',
                  borderBottom: '2px solid #6366f1',
                  paddingBottom: '10px',
                  width: '100%'
                }}>Barcode Details</h3>
                {editMode ? (
                  <form style={{ width: '100%' }} onSubmit={async e => {
                    e.preventDefault();
                    try {
                      const { api } = await import('./services/api');
                      const updateData = { ...editingBarcode };
                      await api.put(`/barcodes/${editingBarcode._id}`, updateData);
                      alert('Barcode updated!');
                      setEditMode(false);
                      setScannedBarcode(updateData);
                    } catch (err) {
                      alert('Update failed: ' + err.message);
                    }
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '18px 32px',
                      width: '100%',
                      marginBottom: '18px'
                    }}>
                      <div><strong>ID:</strong> <span>{editingBarcode._id}</span></div>
                      <div><strong>Product Name:</strong> <input type="text" value={editingBarcode.productName} onChange={e => setEditingBarcode({ ...editingBarcode, productName: e.target.value })} /></div>
                      <div><strong>Serial Number:</strong> <input type="text" value={editingBarcode.serialNumber} onChange={e => setEditingBarcode({ ...editingBarcode, serialNumber: e.target.value })} /></div>
                      <div><strong>Barcode Value:</strong> <input type="text" value={editingBarcode.barcodeValue} onChange={e => setEditingBarcode({ ...editingBarcode, barcodeValue: e.target.value })} /></div>
                      <div><strong>Barcode Type:</strong> <input type="text" value={editingBarcode.barcodeType} onChange={e => setEditingBarcode({ ...editingBarcode, barcodeType: e.target.value })} /></div>
                      <div><strong>Last Update:</strong> <input type="text" value={editingBarcode.lastUpdate} onChange={e => setEditingBarcode({ ...editingBarcode, lastUpdate: e.target.value })} /></div>
                      <div><strong>Remark:</strong> <input type="text" value={editingBarcode.remark} onChange={e => setEditingBarcode({ ...editingBarcode, remark: e.target.value })} /></div>
                      <div><strong>Area Manager:</strong> <input type="text" value={editingBarcode.areaManager} onChange={e => setEditingBarcode({ ...editingBarcode, areaManager: e.target.value })} /></div>
                      <div><strong>Supervisor:</strong> <input type="text" value={editingBarcode.supervisor} onChange={e => setEditingBarcode({ ...editingBarcode, supervisor: e.target.value })} /></div>
                      <div><strong>Mobile Number:</strong> <input type="text" value={editingBarcode.mobileNumber} onChange={e => setEditingBarcode({ ...editingBarcode, mobileNumber: e.target.value })} /></div>
                      <div><strong>Location:</strong> <input type="text" value={editingBarcode.location} onChange={e => setEditingBarcode({ ...editingBarcode, location: e.target.value })} /></div>
                      <div><strong>Fault:</strong> <input type="text" value={editingBarcode.fault} onChange={e => setEditingBarcode({ ...editingBarcode, fault: e.target.value })} /></div>
                      <div><strong>Accepted:</strong> <input type="text" value={editingBarcode.accepted} onChange={e => setEditingBarcode({ ...editingBarcode, accepted: e.target.value })} /></div>
                      <div><strong>Delivered By:</strong> <input type="text" value={editingBarcode.deliveredBy} onChange={e => setEditingBarcode({ ...editingBarcode, deliveredBy: e.target.value })} /></div>
                      <div><strong>Created At:</strong> <span>{new Date(editingBarcode.createdAt).toLocaleString()}</span></div>
                      <div><strong>Updated At:</strong> <span>{new Date(editingBarcode.updatedAt).toLocaleString()}</span></div>
                      <div><strong>Version:</strong> <span>{editingBarcode.__v}</span></div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <button type="submit" style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 32px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginRight: '12px' }}>Save</button>
                      <button type="button" style={{ background: '#e5e7eb', color: '#2563eb', border: 'none', borderRadius: '8px', padding: '12px 32px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }} onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '18px 32px',
                      width: '100%',
                      marginBottom: '18px'
                    }}>
                      <div><strong>ID:</strong> <span>{scannedBarcode._id}</span></div>
                      <div><strong>Product Name:</strong> <span>{scannedBarcode.productName}</span></div>
                      <div><strong>Serial Number:</strong> <span>{scannedBarcode.serialNumber}</span></div>
                      <div><strong>Barcode Value:</strong> <span>{scannedBarcode.barcodeValue}</span></div>
                      <div><strong>Barcode Type:</strong> <span>{scannedBarcode.barcodeType}</span></div>
                      <div><strong>Last Update:</strong> <span>{scannedBarcode.lastUpdate}</span></div>
                      <div><strong>Remark:</strong> <span>{scannedBarcode.remark}</span></div>
                      <div><strong>Area Manager:</strong> <span>{scannedBarcode.areaManager}</span></div>
                      <div><strong>Supervisor:</strong> <span>{scannedBarcode.supervisor}</span></div>
                      <div><strong>Mobile Number:</strong> <span>{scannedBarcode.mobileNumber}</span></div>
                      <div><strong>Location:</strong> <span>{scannedBarcode.location}</span></div>
                      <div><strong>Fault:</strong> <span>{scannedBarcode.fault}</span></div>
                      <div><strong>Accepted:</strong> <span>{scannedBarcode.accepted}</span></div>
                      <div><strong>Delivered By:</strong> <span>{scannedBarcode.deliveredBy}</span></div>
                      <div><strong>Created At:</strong> <span>{new Date(scannedBarcode.createdAt).toLocaleString()}</span></div>
                      <div><strong>Updated At:</strong> <span>{new Date(scannedBarcode.updatedAt).toLocaleString()}</span></div>
                      <div><strong>Version:</strong> <span>{scannedBarcode.__v}</span></div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <button type="button" style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 32px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }} onClick={() => { setEditingBarcode(scannedBarcode); setEditMode(true); }}>Update</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)' }}>
          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '48px 40px', maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center', justifyContent: 'center', marginTop: '48px' }}>
            <form style={{ background: 'white', borderRadius: '16px', padding: '0', boxShadow: 'none', maxWidth: '600px', width: '100%' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '16px', color: '#059669', letterSpacing: '1px', textAlign: 'center' }}>Create Barcode</h2>
              <div style={{ borderBottom: '2px solid #e5e7eb', marginBottom: '24px' }}></div>
              <div style={{ marginBottom: '24px', background: '#f3f4f6', borderRadius: '12px', padding: '24px 20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#059669', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                  Product Details
                </h3>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                  <input type="text" placeholder="Product Name" value={barcodeForm.productName} onChange={e => setBarcodeForm({ ...barcodeForm, productName: e.target.value })} style={{ flex: 1, padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                  <select value={barcodeForm.asset} onChange={e => setBarcodeForm({ ...barcodeForm, asset: e.target.value })} style={{ flex: 1, padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd', marginRight: '20px' }} required>
                    <option value="">Select Asset</option>
                    <option value="Head Office">Head Office</option>
                    <option value="Branch Office">Branch Office</option>
                    <option value="Printers">Printers</option>
                    <option value="Camera">Camera</option>
                    <option value="Fingerprint Machine">Fingerprint Machine</option>
                    <option value="TV">TV</option>
                    <option value="Knuck">Knuck</option>
                  </select>
                  <input type="text" placeholder="Serial Number" value={barcodeForm.serialNumber} onChange={handleSerialChange} style={{ flex: 1, padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
              </div>
              <div style={{ marginBottom: '24px', background: '#f3f4f6', borderRadius: '12px', padding: '24px 20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#059669', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                  Management
                </h3>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                  {barcodeForm.asset === 'Head Office' ? (
                    <input type="text" placeholder="User" value={barcodeForm.areaManager} onChange={e => setBarcodeForm({ ...barcodeForm, areaManager: e.target.value })} style={{ flex: 1, padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  ) : (
                    <>
                      <input type="text" placeholder="Area Manager" value={barcodeForm.areaManager} onChange={e => setBarcodeForm({ ...barcodeForm, areaManager: e.target.value })} style={{ flex: 1, padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }} />
                      <input type="text" placeholder="Supervisor" value={barcodeForm.supervisor} onChange={e => setBarcodeForm({ ...barcodeForm, supervisor: e.target.value })} style={{ flex: 1, padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }} />
                    </>
                  )}
                </div>
              </div>
              <div style={{ marginBottom: '24px', background: '#f3f4f6', borderRadius: '12px', padding: '24px 20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#059669', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                  Location & Status
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '12px' }}>
                  <input type="text" placeholder="Mobile Number" value={barcodeForm.mobileNumber} onChange={e => setBarcodeForm({ ...barcodeForm, mobileNumber: e.target.value })} style={{ padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  {barcodeForm.asset === 'Head Office' ? (
                    <select value={barcodeForm.location} onChange={e => setBarcodeForm({ ...barcodeForm, location: e.target.value })} style={{ padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }}>
                      <option value="">Select Department</option>
                      <option value="IT">IT</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="FINANCE">FINANCE</option>
                      <option value="GLOBAL">GLOBAL</option>
                      <option value="HR">HR</option>
                    </select>
                  ) : (
                    <input type="text" placeholder="Location" value={barcodeForm.location} onChange={e => setBarcodeForm({ ...barcodeForm, location: e.target.value })} style={{ padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  )}
                  <input type="text" placeholder="Fault" value={barcodeForm.fault} onChange={e => setBarcodeForm({ ...barcodeForm, fault: e.target.value })} style={{ padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  <input type="text" placeholder="Accepted" value={barcodeForm.accepted} onChange={e => setBarcodeForm({ ...barcodeForm, accepted: e.target.value })} style={{ padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  <input type="text" placeholder="Delivered by" value={barcodeForm.deliveredBy} onChange={e => setBarcodeForm({ ...barcodeForm, deliveredBy: e.target.value })} style={{ padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd' }} />
                </div>
              </div>
              <div style={{ marginBottom: '24px', background: '#f3f4f6', borderRadius: '12px', padding: '24px 20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#059669', marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                  Remark
                </h3>
                <textarea placeholder="Remark" value={barcodeForm.remark} onChange={e => setBarcodeForm({ ...barcodeForm, remark: e.target.value })} rows={8} style={{ minHeight: '120px', padding: '14px', fontSize: '17px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical', width: '100%' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', justifyContent: 'center' }}>
                <button
                  type="button"
                  style={{ flex: 1, padding: '14px 0', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
                  onClick={async () => {
                    try {
                      const { api } = await import('./services/api');
                      // Check for duplicate barcodeValue before adding
                      const check = await api.get(`/barcodes/scan?value=${barcodeForm.barcodeValue}`);
                      if (check && !check.error) {
                        alert('A barcode with this value already exists. Please use a unique barcode value.');
                        return;
                      }
                      // Add asset and location fields to database
                      const res = await api.post('/barcodes', {
                        ...barcodeForm,
                        asset: barcodeForm.asset,
                        location: barcodeForm.location,
                        lastUpdate: new Date().toLocaleString(),
                        areaManager: barcodeForm.asset === 'Head Office' ? barcodeForm.areaManager : barcodeForm.areaManager,
                        supervisor: barcodeForm.asset === 'Head Office' ? 'N/A' : barcodeForm.supervisor
                      });
                      if (res && !res.error) {
                        alert('Data added to database!');
                        setBarcodeForm({
                          productName: '',
                          serialNumber: '',
                          barcodeValue: '',
                          lastUpdate: '',
                          areaManager: '',
                          supervisor: '',
                          mobileNumber: '',
                          location: '',
                          asset: '',
                          fault: '',
                          accepted: '',
                          deliveredBy: '',
                          remark: ''
                        });
                      } else {
                        alert('Add failed: ' + (res.error || 'Unknown error'));
                      }
                    } catch (err) {
                      alert('Add error: ' + err.message);
                    }
                  }}
                >
                  Add to Database
                </button>
                <button type="button" style={{ flex: 1, padding: '14px 0', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 2px 8px #2563eb33' }} onClick={handlePrint}>Print Barcode</button>
              </div>
            </form>
            <div ref={barcodeRef} style={{ background: '#f9fafb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', maxWidth: '400px', width: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <PrintableBarcode barcode={barcodeForm} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}