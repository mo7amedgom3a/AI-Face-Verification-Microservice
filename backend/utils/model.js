const ort = require("onnxruntime-node");
const path = require("path");

let session;

async function loadModel() {
  if (!session) {
    try {
      const modelPath = path.join(__dirname, "..", "models", "arcface.onnx");
      session = await ort.InferenceSession.create(modelPath, {
        // Use CPU execution provider
        executionProviders: ['cpu'],
        
        // Graph optimization level: 'all' enables all optimizations
        graphOptimizationLevel: 'all',
        
        // Memory optimizations
        enableCpuMemArena: true,      // Reduces memory allocation overhead
        enableMemPattern: true,        // Reuses memory buffers
        
        // Execution mode: sequential for inference workloads
        executionMode: 'sequential',
        
        // Thread configuration (adjust based on your CPU)
        intraOpNumThreads: 4,          // Number of threads for operations
        interOpNumThreads: 1           // Usually 1 for inference
      });

      console.log("✅ ONNX model loaded successfully");
      
    } catch (error) {
      console.error("❌ Failed to load ONNX model:", error.message);
      throw error;
    }
  } 
  return session;
}

module.exports = { loadModel };
