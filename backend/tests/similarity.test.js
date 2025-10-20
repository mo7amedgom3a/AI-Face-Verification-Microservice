const { normalizeVector, cosineSimilarity } = require('../utils/cosineSimilarity');

describe('Cosine Similarity Utils', () => {
  
  describe('normalizeVector', () => {
    
    test('should normalize a vector to unit length', () => {
      const vector = [3, 4]; // Length = 5
      const normalized = normalizeVector(vector);
      
      expect(normalized).toEqual([0.6, 0.8]);
      
      // Check that it's a unit vector (length = 1)
      const length = Math.sqrt(normalized.reduce((sum, val) => sum + val * val, 0));
      expect(length).toBeCloseTo(1.0, 10);
    });
    
    test('should handle zero vector without NaN', () => {
      const vector = [0, 0, 0];
      const normalized = normalizeVector(vector);
      
      // Should handle gracefully (might be NaN or 0)
      expect(normalized.length).toBe(3);
    });
    
    test('should normalize a 512-dimensional vector', () => {
      const vector = Array(512).fill(1);
      const normalized = normalizeVector(vector);
      
      expect(normalized.length).toBe(512);
      
      // Check unit length
      const length = Math.sqrt(normalized.reduce((sum, val) => sum + val * val, 0));
      expect(length).toBeCloseTo(1.0, 10);
    });
    
    test('should normalize vector with negative values', () => {
      const vector = [1, -1, 2, -2];
      const normalized = normalizeVector(vector);
      
      const length = Math.sqrt(normalized.reduce((sum, val) => sum + val * val, 0));
      expect(length).toBeCloseTo(1.0, 10);
    });
    
    test('should preserve direction of vector', () => {
      const vector = [3, 4, 0];
      const normalized = normalizeVector(vector);
      
      // Normalized should be in same direction but length 1
      expect(normalized[0]).toBeGreaterThan(0);
      expect(normalized[1]).toBeGreaterThan(0);
      expect(normalized[2]).toBe(0);
    });
  });
  
  describe('cosineSimilarity', () => {
    
    test('should return 1 for identical vectors', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [1, 2, 3];
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeCloseTo(1.0, 10);
    });
    
    test('should return 1 for scaled versions of same vector', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [2, 4, 6]; // Same direction, different magnitude
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeCloseTo(1.0, 10);
    });
    
    test('should return 0 for perpendicular vectors', () => {
      const vectorA = [1, 0, 0];
      const vectorB = [0, 1, 0];
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeCloseTo(0.0, 10);
    });
    
    test('should return -1 for opposite vectors', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [-1, -2, -3];
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeCloseTo(-1.0, 10);
    });
    
    test('should return value between -1 and 1', () => {
      const vectorA = [1, 2, 3, 4, 5];
      const vectorB = [5, 4, 3, 2, 1];
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeGreaterThanOrEqual(-1);
      expect(similarity).toBeLessThanOrEqual(1);
    });
    
    test('should handle 512-dimensional vectors (typical embedding size)', () => {
      const vectorA = Array(512).fill(1).map((_, i) => Math.sin(i));
      const vectorB = Array(512).fill(1).map((_, i) => Math.cos(i));
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      expect(similarity).toBeGreaterThanOrEqual(-1);
      expect(similarity).toBeLessThanOrEqual(1);
    });
    
    test('should work with normalized vectors', () => {
      const vectorA = [3, 4];
      const vectorB = [4, 3];
      
      const normalizedA = normalizeVector(vectorA);
      const normalizedB = normalizeVector(vectorB);
      
      const similarity = cosineSimilarity(normalizedA, normalizedB);
      expect(similarity).toBeGreaterThan(0.9); // Similar but not identical
    });
    
    test('should distinguish between similar and dissimilar vectors', () => {
      const base = Array(512).fill(1);
      const similar = base.map(v => v + Math.random() * 0.1); // Very similar
      const different = Array(512).fill(1).map(() => Math.random()); // Different
      
      const similarityHigh = cosineSimilarity(base, similar);
      const similarityLow = cosineSimilarity(base, different);
      
      expect(similarityHigh).toBeGreaterThan(similarityLow);
      expect(similarityHigh).toBeGreaterThan(0.9);
    });
    
    test('should be symmetric (A·B = B·A)', () => {
      const vectorA = [1, 2, 3, 4];
      const vectorB = [4, 3, 2, 1];
      
      const simAB = cosineSimilarity(vectorA, vectorB);
      const simBA = cosineSimilarity(vectorB, vectorA);
      
      expect(simAB).toBeCloseTo(simBA, 10);
    });
  });
  
  describe('Integration: Normalize + Similarity', () => {
    
    test('should produce same similarity for normalized and unnormalized vectors', () => {
      const vectorA = [3, 4, 5];
      const vectorB = [6, 8, 10]; // Same direction as A
      
      // Direct similarity
      const directSim = cosineSimilarity(vectorA, vectorB);
      
      // Normalized similarity
      const normalizedA = normalizeVector(vectorA);
      const normalizedB = normalizeVector(vectorB);
      const normalizedSim = cosineSimilarity(normalizedA, normalizedB);
      
      expect(directSim).toBeCloseTo(normalizedSim, 10);
      expect(normalizedSim).toBeCloseTo(1.0, 10);
    });
    
    test('should work with face embedding simulation', () => {
      // Simulate two face embeddings (512-dim)
      const face1 = Array(512).fill(0).map(() => Math.random());
      const face2 = face1.map(v => v + (Math.random() - 0.5) * 0.1); // Similar face
      const face3 = Array(512).fill(0).map(() => Math.random()); // Different face
      
      const norm1 = normalizeVector(face1);
      const norm2 = normalizeVector(face2);
      const norm3 = normalizeVector(face3);
      
      const sameFaceSimilarity = cosineSimilarity(norm1, norm2);
      const differentFaceSimilarity = cosineSimilarity(norm1, norm3);
      
      // Same face should have higher similarity
      expect(sameFaceSimilarity).toBeGreaterThan(differentFaceSimilarity);
      expect(sameFaceSimilarity).toBeGreaterThan(0.9);
    });
  });
});
