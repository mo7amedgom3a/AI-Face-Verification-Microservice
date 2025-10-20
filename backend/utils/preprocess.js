const sharp = require("sharp");
const ort = require("onnxruntime-node");

async function preprocessImage(imageBuffer) {
  // Resize and get raw pixel data
  const img = await sharp(imageBuffer)
    .resize(112, 112)
    .removeAlpha()
    .raw()
    .toBuffer();

  // Normalize pixel values from [0, 255] to [0, 1] or apply mean/std normalization
  // Most face recognition models expect normalized inputs
  const floatArray = new Float32Array(img.length);
  
  // Normalize to [0, 1] range
  for (let i = 0; i < img.length; i++) {
    floatArray[i] = img[i] / 255.0;
  }
  
  // Alternative: If model expects mean-centered normalization, use:
  // const mean = [0.5, 0.5, 0.5];
  // const std = [0.5, 0.5, 0.5];
  // for (let i = 0; i < img.length; i++) {
  //   const channelIdx = i % 3;
  //   floatArray[i] = (img[i] / 255.0 - mean[channelIdx]) / std[channelIdx];
  // }

  const tensor = new ort.Tensor("float32", floatArray, [1, 112, 112, 3]);
  return tensor;
}

module.exports = { preprocessImage };
