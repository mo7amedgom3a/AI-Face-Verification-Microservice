require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { loadModel } = require("./utils/model");
const faceRoutes = require("./routes/faceRoutes");

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize model
(async () => {
	await loadModel();
})();


app.use("/api/face", faceRoutes);
// health check endpoint
app.get('/health', (req, res) => {
	res.status(200).send('OK');
});
// Start server
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
