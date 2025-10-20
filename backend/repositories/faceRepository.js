
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function saveEmbedding(name, embedding) {
  const email = name.toLowerCase().replace(/\s+/g, '_') + "@example.com";
  
  // Use upsert to update existing user or create new one
  return await prisma.user.upsert({
    where: { email },
    update: {
      name,
      embedding,
    },
    create: {
      name,
      email,
      embedding,
    },
  });
}

async function getEmbeddingById(id) {
  return await prisma.user.findUnique({
    where: { id: Number(id) },
  });
}

module.exports = { saveEmbedding, getEmbeddingById };
