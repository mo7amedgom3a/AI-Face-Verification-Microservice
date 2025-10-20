// Mock Prisma Client first
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    mockPrisma, // Export for use in tests
  };
});

const { saveEmbedding, getEmbeddingById } = require('../repositories/faceRepository');
const { PrismaClient } = require('@prisma/client');

// Get the mock instance
const mockPrisma = new PrismaClient();

describe('Face Repository', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('saveEmbedding', () => {
    
    test('should save a new user with embedding', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john_doe@example.com',
        embedding: [0.1, 0.2, 0.3],
      };
      
      mockPrisma.user.upsert.mockResolvedValue(mockUser);
      
      const embedding = Array(512).fill(0).map(() => Math.random());
      const result = await saveEmbedding('John Doe', embedding);
      
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.upsert).toHaveBeenCalledTimes(1);
    });
    
    test('should generate correct email from name', async () => {
      const mockUser = {
        id: 1,
        name: 'Alice Smith',
        email: 'alice_smith@example.com',
        embedding: [],
      };
      
      mockPrisma.user.upsert.mockResolvedValue(mockUser);
      
      const embedding = Array(512).fill(0.5);
      await saveEmbedding('Alice Smith', embedding);
      
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'alice_smith@example.com' },
        update: {
          name: 'Alice Smith',
          embedding: embedding,
        },
        create: {
          name: 'Alice Smith',
          email: 'alice_smith@example.com',
          embedding: embedding,
        },
      });
    });
    
    test('should handle names with spaces by replacing with underscores', async () => {
      const mockUser = {
        id: 1,
        name: 'John Paul Jones',
        email: 'john_paul_jones@example.com',
        embedding: [],
      };
      
      mockPrisma.user.upsert.mockResolvedValue(mockUser);
      
      await saveEmbedding('John Paul Jones', [1, 2, 3]);
      
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'john_paul_jones@example.com' },
        })
      );
    });
    
    test('should handle names with uppercase letters', async () => {
      const mockUser = {
        id: 1,
        name: 'ALICE',
        email: 'alice@example.com',
        embedding: [],
      };
      
      mockPrisma.user.upsert.mockResolvedValue(mockUser);
      
      await saveEmbedding('ALICE', [1, 2, 3]);
      
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: 'alice@example.com' },
        })
      );
    });
    
    test('should update existing user with new embedding', async () => {
      const originalUser = {
        id: 1,
        name: 'Bob',
        email: 'bob@example.com',
        embedding: [0.1, 0.2, 0.3],
      };
      
      const updatedEmbedding = [0.4, 0.5, 0.6];
      const updatedUser = { ...originalUser, embedding: updatedEmbedding };
      
      mockPrisma.user.upsert.mockResolvedValue(updatedUser);
      
      const result = await saveEmbedding('Bob', updatedEmbedding);
      
      expect(result.embedding).toEqual(updatedEmbedding);
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'bob@example.com' },
        update: {
          name: 'Bob',
          embedding: updatedEmbedding,
        },
        create: {
          name: 'Bob',
          email: 'bob@example.com',
          embedding: updatedEmbedding,
        },
      });
    });
    
    test('should save 512-dimensional embedding', async () => {
      const embedding = Array(512).fill(0).map((_, i) => i * 0.01);
      const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test_user@example.com',
        embedding: embedding,
      };
      
      mockPrisma.user.upsert.mockResolvedValue(mockUser);
      
      const result = await saveEmbedding('Test User', embedding);
      
      expect(result.embedding.length).toBe(512);
    });
    
    test('should handle database errors gracefully', async () => {
      mockPrisma.user.upsert.mockRejectedValue(new Error('Database connection failed'));
      
      await expect(saveEmbedding('Test', [1, 2, 3])).rejects.toThrow('Database connection failed');
    });
    
    test('should handle special characters in names', async () => {
      const mockUser = {
        id: 1,
        name: "O'Brien",
        email: "o'brien@example.com",
        embedding: [],
      };
      
      mockPrisma.user.upsert.mockResolvedValue(mockUser);
      
      await saveEmbedding("O'Brien", [1, 2, 3]);
      
      expect(mockPrisma.user.upsert).toHaveBeenCalled();
    });
  });
  
  describe('getEmbeddingById', () => {
    
    test('should retrieve user by ID', async () => {
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john_doe@example.com',
        embedding: Array(512).fill(0.5),
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      
      const result = await getEmbeddingById(1);
      
      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
    
    test('should convert string ID to number', async () => {
      const mockUser = {
        id: 42,
        name: 'Alice',
        email: 'alice@example.com',
        embedding: [],
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      
      await getEmbeddingById('42');
      
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 42 },
      });
    });
    
    test('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      const result = await getEmbeddingById(999);
      
      expect(result).toBeNull();
    });
    
    test('should retrieve user with full embedding data', async () => {
      const embedding = Array(512).fill(0).map(() => Math.random());
      const mockUser = {
        id: 5,
        name: 'Bob',
        email: 'bob@example.com',
        embedding: embedding,
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      
      const result = await getEmbeddingById(5);
      
      expect(result.embedding.length).toBe(512);
      expect(result.embedding).toEqual(embedding);
    });
    
    test('should handle database errors', async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error('Database error'));
      
      await expect(getEmbeddingById(1)).rejects.toThrow('Database error');
    });
    
    test('should handle invalid ID types', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      
      const result = await getEmbeddingById('invalid');
      
      expect(result).toBeNull();
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: NaN },
      });
    });
  });
  
  describe('Integration scenarios', () => {
    
    test('should save and retrieve user successfully', async () => {
      const embedding = Array(512).fill(0).map(() => Math.random());
      const savedUser = {
        id: 1,
        name: 'Test User',
        email: 'test_user@example.com',
        embedding: embedding,
      };
      
      mockPrisma.user.upsert.mockResolvedValue(savedUser);
      mockPrisma.user.findUnique.mockResolvedValue(savedUser);
      
      // Save
      const saved = await saveEmbedding('Test User', embedding);
      expect(saved.id).toBe(1);
      
      // Retrieve
      const retrieved = await getEmbeddingById(saved.id);
      expect(retrieved).toEqual(savedUser);
      expect(retrieved.embedding).toEqual(embedding);
    });
    
    test('should handle re-registration (upsert)', async () => {
      const firstEmbedding = Array(512).fill(0.1);
      const secondEmbedding = Array(512).fill(0.9);
      
      const firstSave = {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        embedding: firstEmbedding,
      };
      
      const secondSave = {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        embedding: secondEmbedding,
      };
      
      mockPrisma.user.upsert
        .mockResolvedValueOnce(firstSave)
        .mockResolvedValueOnce(secondSave);
      
      // First registration
      const result1 = await saveEmbedding('Alice', firstEmbedding);
      expect(result1.embedding).toEqual(firstEmbedding);
      
      // Second registration (update)
      const result2 = await saveEmbedding('Alice', secondEmbedding);
      expect(result2.embedding).toEqual(secondEmbedding);
      expect(result2.id).toBe(result1.id); // Same user
    });
  });
});
