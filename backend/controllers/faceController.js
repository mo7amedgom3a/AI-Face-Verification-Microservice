const { generateEmbedding } = require("../services/faceService");
const { normalizeVector } = require("../utils/cosineSimilarity");
const { saveEmbedding, getEmbeddingById } = require("../repositories/faceRepository");


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