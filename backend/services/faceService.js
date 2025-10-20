const { loadModel } = require("../utils/model");
const { preprocessImage } = require("../utils/preprocess");

async function generateEmbedding(imageBuffer) {
  const session = await loadModel();
  const inputTensor = await preprocessImage(imageBuffer);
  const inputName = session.inputNames[0]; // get the first input name
  const feeds = { [inputName]: inputTensor };
  const results = await session.run(feeds);
  const outputTensor = Object.values(results)[0]; // get the first output tensor
  
  // Convert output tensor data to a regular array
  return Array.from(outputTensor.data);

}
module.exports = { generateEmbedding };