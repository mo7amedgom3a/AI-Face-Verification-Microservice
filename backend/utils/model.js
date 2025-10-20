const ort = require("onnxruntime-node");

let session;

async function loadModel() {
  if (!session) {
    try {
      session = await ort.InferenceSession.create("../models/arcface.onnx");
      console.log("✅ ONNX model loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load ONNX model:", error.message);
      throw error;
    }
  } 
  return session;
}

module.exports = { loadModel };
