function normalizeVector(vec) {
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (!isFinite(norm) || norm === 0) {
    // return zero-vector if input is all zeros or invalid
    return vec.map(() => 0);
  }
  // L2 normalize and clamp each component to [-1, 1] to guard against tiny numerical overshoots
  return vec.map(v => {
    const nv = v / norm;
    return Math.max(-1, Math.min(1, nv));
  });
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    throw new Error("Vectors must be arrays of the same length");
  }

  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (!isFinite(normA) || !isFinite(normB) || normA === 0 || normB === 0) {
    return 0; // cannot compute similarity with zero-norm vector
  }

  // Compute cosine and clamp to [-1, 1]
  const cos = dot / (normA * normB);
  return Math.max(-1, Math.min(1, cos));
}

module.exports = { normalizeVector, cosineSimilarity };
