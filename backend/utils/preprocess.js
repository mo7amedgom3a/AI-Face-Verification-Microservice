const sharp = require("sharp");
const ort = require("onnxruntime-node");

async function preprocessImage(imageBuffer) {
  const img = await sharp(imageBuffer)
    .resize(112, 112)
    .removeAlpha()
    .raw()
    .toBuffer();

  const floatArray = new Float32Array(img);
  const tensor = new ort.Tensor("float32", floatArray, [1, 112, 112, 3]);
  return tensor;
}

module.exports = { preprocessImage };