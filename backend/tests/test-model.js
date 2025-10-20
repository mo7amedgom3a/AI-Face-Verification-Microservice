const fs = require("fs");
  const { normalizeVector } = require("../utils/cosineSimilarity");

const { generateEmbedding } = require("../services/faceService");

(async () => {
  const img = fs.readFileSync("../uploads/person.jpg");
  const emb = await generateEmbedding(img);
  const normalizedEmbedding = normalizeVector(emb);
  console.log("Embedding length:", emb.length);
})();