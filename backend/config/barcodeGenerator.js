const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');

const generateBarcode = async (text) => {
  try {
    const barcodeData = await bwipjs.toBuffer({
      bcid: 'code128', // Barcode type
      text: text, // Text to encode
      scale: 3, // 3x scaling factor
      height: 10, // Bar height, in millimeters
      includetext: true, // Show human-readable text
      textxalign: 'center', // Always good to set this
    });
    
    return barcodeData;
  } catch (error) {
    console.error('Barcode generation error:', error);
    throw error;
  }
};

module.exports = { generateBarcode };