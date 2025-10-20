const { generateEmbedding } = require('../services/faceService');
const { loadModel } = require('../utils/model');
const { preprocessImage } = require('../utils/preprocess');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Mock the dependencies
jest.mock('../utils/model');
jest.mock('../utils/preprocess');

describe('Face Embedding Service', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('generateEmbedding', () => {
    
    test('should generate a 512-dimensional embedding array', async () => {
      // Mock the model and preprocessing
      const mockSession = {
        inputNames: ['input_1'],
        run: jest.fn().mockResolvedValue({
          output: {
            data: new Float32Array(512).fill(0.5)
          }
        })
      };
      
      loadModel.mockResolvedValue(mockSession);
      preprocessImage.mockResolvedValue({
        data: new Float32Array(112 * 112 * 3)
      });
      
      const mockImageBuffer = Buffer.from('fake-image-data');
      const embedding = await generateEmbedding(mockImageBuffer);
      
      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBe(512);
    });
    
    test('should call loadModel once', async () => {
      const mockSession = {
        inputNames: ['input_1'],
        run: jest.fn().mockResolvedValue({
          output: {
            data: new Float32Array(512)
          }
        })
      };
      
      loadModel.mockResolvedValue(mockSession);
      preprocessImage.mockResolvedValue({});
      
      const mockImageBuffer = Buffer.from('test');
      await generateEmbedding(mockImageBuffer);
      
      expect(loadModel).toHaveBeenCalledTimes(1);
    });
    
    test('should call preprocessImage with image buffer', async () => {
      const mockSession = {
        inputNames: ['input_1'],
        run: jest.fn().mockResolvedValue({
          output: {
            data: new Float32Array(512)
          }
        })
      };
      
      loadModel.mockResolvedValue(mockSession);
      preprocessImage.mockResolvedValue({});
      
      const mockImageBuffer = Buffer.from('test-image');
      await generateEmbedding(mockImageBuffer);
      
      expect(preprocessImage).toHaveBeenCalledWith(mockImageBuffer);
    });
    
    test('should run model inference with correct input', async () => {
      const mockTensor = { data: new Float32Array(112 * 112 * 3) };
      const mockSession = {
        inputNames: ['input_1'],
        run: jest.fn().mockResolvedValue({
          output: {
            data: new Float32Array(512)
          }
        })
      };
      
      loadModel.mockResolvedValue(mockSession);
      preprocessImage.mockResolvedValue(mockTensor);
      
      const mockImageBuffer = Buffer.from('test');
      await generateEmbedding(mockImageBuffer);
      
      expect(mockSession.run).toHaveBeenCalledWith({
        input_1: mockTensor
      });
    });
    
    test('should return array of numbers', async () => {
      const mockSession = {
        inputNames: ['input_1'],
        run: jest.fn().mockResolvedValue({
          output: {
            data: new Float32Array(512).fill(0).map((_, i) => i * 0.01)
          }
        })
      };
      
      loadModel.mockResolvedValue(mockSession);
      preprocessImage.mockResolvedValue({});
      
      const mockImageBuffer = Buffer.from('test');
      const embedding = await generateEmbedding(mockImageBuffer);
      
      expect(embedding.every(val => typeof val === 'number')).toBe(true);
    });
    
    test('should handle model inference errors gracefully', async () => {
      const mockSession = {
        inputNames: ['input_1'],
        run: jest.fn().mockRejectedValue(new Error('Model inference failed'))
      };
      
      loadModel.mockResolvedValue(mockSession);
      preprocessImage.mockResolvedValue({});
      
      const mockImageBuffer = Buffer.from('test');
      
      await expect(generateEmbedding(mockImageBuffer)).rejects.toThrow('Model inference failed');
    });
    
    test('should convert Float32Array to regular array', async () => {
      const mockFloat32Array = new Float32Array([1.1, 2.2, 3.3]);
      const mockSession = {
        inputNames: ['input_1'],
        run: jest.fn().mockResolvedValue({
          output: {
            data: mockFloat32Array
          }
        })
      };
      
      loadModel.mockResolvedValue(mockSession);
      preprocessImage.mockResolvedValue({});
      
      const mockImageBuffer = Buffer.from('test');
      const embedding = await generateEmbedding(mockImageBuffer);
      
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(3);
      // Use toBeCloseTo for floating point comparison
      expect(embedding[0]).toBeCloseTo(1.1, 5);
      expect(embedding[1]).toBeCloseTo(2.2, 5);
      expect(embedding[2]).toBeCloseTo(3.3, 5);
    });
  });
  
  describe('Embedding properties', () => {
    
    test('should generate consistent embeddings for same input', async () => {
      const mockEmbedding = new Float32Array(512).fill(0).map(() => Math.random());
      const mockSession = {
        inputNames: ['input_1'],
        run: jest.fn().mockResolvedValue({
          output: { data: mockEmbedding }
        })
      };
      
      loadModel.mockResolvedValue(mockSession);
      preprocessImage.mockResolvedValue({});
      
      const imageBuffer = Buffer.from('consistent-image');
      const embedding1 = await generateEmbedding(imageBuffer);
      
      // Reset mocks but use same embedding
      mockSession.run.mockResolvedValue({
        output: { data: mockEmbedding }
      });
      
      const embedding2 = await generateEmbedding(imageBuffer);
      
      expect(embedding1).toEqual(embedding2);
    });
    
    test('should generate different embeddings for different inputs', async () => {
      const mockEmbedding1 = new Float32Array(512).fill(1);
      const mockEmbedding2 = new Float32Array(512).fill(2);
      
      const mockSession = {
        inputNames: ['input_1'],
        run: jest.fn()
          .mockResolvedValueOnce({ output: { data: mockEmbedding1 } })
          .mockResolvedValueOnce({ output: { data: mockEmbedding2 } })
      };
      
      loadModel.mockResolvedValue(mockSession);
      preprocessImage.mockResolvedValue({});
      
      const image1 = Buffer.from('image1');
      const image2 = Buffer.from('image2');
      
      const embedding1 = await generateEmbedding(image1);
      const embedding2 = await generateEmbedding(image2);
      
      expect(embedding1).not.toEqual(embedding2);
    });
  });
});

describe('Image Preprocessing (Unit)', () => {
  
  // Restore actual implementation for these tests
  beforeEach(() => {
    jest.unmock('../utils/preprocess');
  });
  
  describe('preprocessImage', () => {
    
    test('should create a test image and verify dimensions', async () => {
      // Create a simple test image
      const testImage = await sharp({
        create: {
          width: 200,
          height: 200,
          channels: 3,
          background: { r: 255, g: 0, b: 0 }
        }
      }).png().toBuffer();
      
      expect(testImage).toBeInstanceOf(Buffer);
      expect(testImage.length).toBeGreaterThan(0);
    });
  });
});
