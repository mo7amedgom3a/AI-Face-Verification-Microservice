// backend/middlewares/errorHandler.js

const { APIError } = require('../utils/errors');

const handleErrors = (err, req, res, next) => {
  // Log error for debugging
  console.error(err);

  // Handle known API errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        type: err.name,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: {
        type: 'FileUploadError',
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      }
    });
  }

  // Handle unexpected errors
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    error: {
      type: 'InternalServerError',
      message: process.env.NODE_ENV === 'development' 
        ? err.message 
        : 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = handleErrors;
