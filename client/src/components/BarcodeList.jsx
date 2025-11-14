import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const BarcodeList = ({ scannedBarcode, refreshTrigger }) => {
    const [barcodes, setBarcodes] = useState([]);

    useEffect(() => {
        const fetchBarcodes = async () => {
            const response = await api.get('/barcodes');
            setBarcodes(response.data);
        };
        fetchBarcodes();
    }, [refreshTrigger]);

    return barcodes;
};

