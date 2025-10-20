const ort = require("onnxruntime-node");
const path = require("path");

let session;

async function loadModel() {
  if (!session) {
    try {
      const modelPath = path.join(__dirname, "..", "models", "arcface.onnx");
      session = await ort.InferenceSession.create(modelPath);
      console.log("✅ ONNX model loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load ONNX model:", error.message);
      throw error;
    }
  } 
  return session;
}

module.exports = { loadModel };
