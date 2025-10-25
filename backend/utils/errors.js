// backend/utils/errors.js

class APIError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}

class ValidationError extends APIError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class FileUploadError extends APIError {
  constructor(message) {
    super(message, 400);
    this.name = 'FileUploadError';
  }
}

class ModelError extends APIError {
  constructor(message) {
    super(message, 500);
    this.name = 'ModelError';
  }
}

class FaceDetectionError extends APIError {
  constructor(message) {
    super(message, 400);
    this.name = 'FaceDetectionError';
  }
}

class DatabaseError extends APIError {
  constructor(message) {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

module.exports = {
  APIError,
  ValidationError,
  FileUploadError,
  ModelError,
  FaceDetectionError,
  DatabaseError
};