const sharp = require("sharp");
const ort = require("onnxruntime-node");

/**
 * Preprocess image for ArcFace model
 * Uses HWC format: [1, 112, 112, 3] as expected by this specific model
 */
async function preprocessImage(imageBuffer) {
  try {
    // Resize and convert to RGB
    const processedBuffer = await sharp(imageBuffer)
      .resize(112, 112, {
        fit: 'cover',
        position: 'center'
      })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = processedBuffer;

    // Verify dimensions
    if (info.width !== 112 || info.height !== 112 || info.channels !== 3) {
      throw new Error(`Invalid image dimensions: ${info.width}x${info.height}x${info.channels}`);
    }

    console.log(`📸 Image info: ${info.width}x${info.height}x${info.channels}`);

    // Create Float32Array - Sharp gives us HWC format already
    const imageData = new Float32Array(112 * 112 * 3);
    
    // Normalize pixels to [-1, 1] range
    // Keep HWC format (Height, Width, Channels)
    for (let i = 0; i < data.length; i++) {
      imageData[i] = (data[i] / 255.0 - 0.5) / 0.5;
    }

    // Create ONNX tensor with HWC format [1, 112, 112, 3]
    const tensor = new ort.Tensor("float32", imageData, [1, 112, 112, 3]);
    
    console.log(`✅ Preprocessed image: shape=[1, 112, 112, 3], length=${imageData.length}`);
    
    return tensor;
  } catch (error) {
    console.error('❌ Image preprocessing error:', error);
    throw new Error(`Failed to preprocess image: ${error.message}`);
  }
}

module.exports = { preprocessImage };