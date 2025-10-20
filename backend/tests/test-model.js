const fs = require("fs");
const { generateEmbedding } = require("../services/faceService");

(async () => {
  const img = fs.readFileSync("../uploads/person.jpg");
  const emb = await generateEmbedding(img);
  console.log("Embedding length:", emb.length);
})();