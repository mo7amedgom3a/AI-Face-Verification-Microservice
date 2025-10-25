require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { loadModel } = require("./utils/model");
const faceRoutes = require("./routes/faceRoutes");
const errorHandler = require("./middlewares/errorHandler");
const { ModelError } = require("./utils/errors");

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize model
let modelInitialized = false;
(async () => {
  try {
    await loadModel();
    modelInitialized = true;
  } catch (error) {
    console.error('Failed to initialize model:', error);
    process.exit(1);
  }
})();

// Model check middleware
app.use((req, res, next) => {
  if (!modelInitialized && req.path !== '/health') {
    return next(new ModelError('Face recognition model not initialized'));
  }
  next();
});

app.use("/api/face", faceRoutes);

// Health check endpoint with model status
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    model: modelInitialized ? 'initialized' : 'initializing',
    database: prisma ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down gracefully...');
  try {
    // Close server first to stop accepting new requests
    server.close(() => {
      console.log('Server closed');
    });
    
    // Disconnect from database
    await prisma.$disconnect();
    console.log('Database disconnected');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
