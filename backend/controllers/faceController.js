const { generateEmbedding } = require("../services/faceService");
const { normalizeVector } = require("../utils/cosineSimilarity");
const { saveEmbedding, getEmbeddingById } = require("../repositories/faceRepository");
const { cosineSimilarity } = require("../utils/cosineSimilarity");

exports.encodeFace = async (req, res) => {
  try {
    const name = req.body.name || "testuser"; // Get name from request body or use default
    const imageBuffer = req.file.buffer;

    // Generate & normalize embedding
    const embedding = await generateEmbedding(imageBuffer);
    const normalized = normalizeVector(embedding);

    // Save to DB
    const user = await saveEmbedding(name, normalized);

    res.status(200).json({
      success: true,
      userId: user.id,
      embeddingLength: normalized.length,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: "Failed to encode face" });
  }
};
exports.getFaceById = async (req, res) => {
  try {
    console.log("Fetching user with ID:", req.params.id);
    const userId = req.params.id;
    const user = await getEmbeddingById(userId);
    console.log("Retrieved user:", user);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      userId: user.id,
      name: user.name,
      embeddingLength: user.embedding.length,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: "Failed to retrieve face data" });
  }
};

exports.compareFace = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("Comparing face for user ID:", userId);
    const imageBuffer = req.file.buffer;

    const user = await getEmbeddingById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    // Generate and normalize the new embedding (same as in encodeFace)
    const newEmbedding = await generateEmbedding(imageBuffer);
    const normalizedNew = normalizeVector(newEmbedding);
    
    // Both embeddings should be normalized before comparison
    const similarity = cosineSimilarity(normalizedNew, user.embedding);
    const threshold = 0.6; // Adjust threshold as needed (0.6-0.7 is common for face recognition)
    const is_match = similarity > threshold;
    
    console.log(`Similarity: ${similarity.toFixed(4)}, Match: ${is_match}, Threshold: ${threshold}`);
    
    return res.status(200).json({
      success: true,
      similarity: parseFloat(similarity.toFixed(4)),
      is_match: is_match,
      threshold: threshold,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, error: "Failed to compare faces" });
  }
};