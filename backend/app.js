require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { loadModel } = require("./utils/model");

const app = express();
const prisma = new PrismaClient();

(async () => {
  await loadModel();
})();

app.get('/hello', (req, res) => {
	res.send('hello world');
});

app.get('/health/db', async (req, res) => {
	try {
		// Simple no-op query to verify connectivity
		await prisma.$queryRaw`SELECT 1`;
		res.json({ status: 'ok' });
	} catch (err) {
		res.status(503).json({ status: 'error', error: err.message });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
	try {
		await prisma.$disconnect();
	} finally {
		process.exit(0);
	}
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

