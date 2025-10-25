const { generateEmbedding } = require("../services/faceService");
const { normalizeVector } = require("../utils/cosineSimilarity");
const { saveEmbedding, getEmbeddingById } = require("../repositories/faceRepository");
const { cosineSimilarity } = require("../utils/cosineSimilarity");
const { ValidationError, FileUploadError, ModelError, FaceDetectionError, DatabaseError } = require('../utils/errors');

exports.encodeFace = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw new FileUploadError("Image file is required (field name: 'image')");
    }

    const name = req.body.name;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError("Valid name is required");
    }

    const imageBuffer = req.file.buffer;

    // Generate & normalize embedding
    let embedding;
    try {
      embedding = await generateEmbedding(imageBuffer);
    } catch (error) {
      throw new FaceDetectionError("Failed to detect or process face in the image");
    }

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new ModelError("Failed to generate face embedding");
    }

    const normalized = normalizeVector(embedding);

    // Save to DB
    let user;
    try {
      user = await saveEmbedding(name.trim(), normalized);
    } catch (error) {
      throw new DatabaseError("Failed to save face embedding");
    }

    res.status(200).json({
      success: true,
      userId: user.id,
      name: user.name,
      embeddingLength: normalized.length,
    });
  } catch (err) {
    next(err);
  }
};
exports.getFaceById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError("Valid user ID is required");
    }

    let user;
    try {
      user = await getEmbeddingById(userId);
    } catch (error) {
      throw new DatabaseError("Failed to retrieve user data");
    }

    if (!user) {
      throw new ValidationError("User not found", 404);
    }

    if (!Array.isArray(user.embedding) || user.embedding.length === 0) {
      throw new ModelError("Invalid embedding data found");
    }

    return res.status(200).json({
      success: true,
      userId: user.id,
      name: user.name,
      embeddingLength: user.embedding.length,
    });
  } catch (err) {
    next(err);
  }
};

exports.compareFace = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError("Valid user ID is required");
    }

    if (!req.file || !req.file.buffer) {
      throw new FileUploadError("Image file is required (field name: 'image')");
    }

    let user;
    try {
      user = await getEmbeddingById(userId);
    } catch (error) {
      throw new DatabaseError("Failed to retrieve user data");
    }

    if (!user) {
      throw new ValidationError("User not found", 404);
    }

    if (!Array.isArray(user.embedding) || user.embedding.length === 0) {
      throw new ModelError("Invalid stored embedding data");
    }

    // Generate and normalize the new embedding
    let newEmbedding;
    try {
      newEmbedding = await generateEmbedding(req.file.buffer);
    } catch (error) {
      throw new FaceDetectionError("Failed to detect or process face in the uploaded image");
    }

    if (!Array.isArray(newEmbedding) || newEmbedding.length === 0) {
      throw new ModelError("Failed to generate face embedding");
    }

    // Ensure both embeddings are properly normalized
    const normalizedNew = normalizeVector(newEmbedding);
    const storedEmbedding = Array.isArray(user.embedding) ? user.embedding.map(Number) : [];
    const normalizedStored = normalizeVector(storedEmbedding);

    if (normalizedNew.length !== normalizedStored.length) {
      throw new ModelError("Embedding dimension mismatch");
    }

    // Calculate similarity with validation
    let similarity = cosineSimilarity(normalizedNew, normalizedStored);
    if (!Number.isFinite(similarity)) {
      throw new ModelError("Invalid similarity calculation result");
    }

    const threshold = Number(process.env.FACE_MATCH_THRESHOLD) || 1.000;
    const is_match = similarity >= threshold;

    return res.status(200).json({
      success: true,
      is_match,
      similarity: parseFloat(similarity.toFixed(4)),
      threshold
    });
  } catch (err) {
    next(err);
  }
};