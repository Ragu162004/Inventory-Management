const cloudinary = require('./config/cloudinary');

// Test function to verify Cloudinary upload works
async function testImageUpload() {
  try {
    // Test with a sample base64 image (1x1 pixel transparent PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    const result = await cloudinary.uploader.upload(testImageBase64, {
      folder: 'inventory-products',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('✅ Cloudinary upload test successful!');
    console.log('Image URL:', result.secure_url);
    console.log('Public ID:', result.public_id);
    
    // Clean up test image
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ Test image cleaned up');
    
  } catch (error) {
    console.error('❌ Cloudinary upload test failed:', error);
  }
}

if (require.main === module) {
  testImageUpload();
}

module.exports = { testImageUpload };
