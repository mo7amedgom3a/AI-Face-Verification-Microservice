# Test Suite Documentation

## Overview
This document describes the unit tests for the AI Face Verification Microservice.

## Test Statistics
- **Total Test Suites**: 3
- **Total Tests**: 42
- **Coverage Areas**: 
  - Cosine Similarity Utilities (16 tests)
  - Face Embedding Service (10 tests)
  - Face Repository (16 tests)

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- tests/similarity.test.js

# Run tests in watch mode
npm test -- --watch
```

## Test Files

### 1. `tests/similarity.test.js` (16 tests)
Tests the mathematical functions for vector operations and similarity comparison.

#### normalizeVector Tests (5 tests)
- ✅ Normalizes vectors to unit length
- ✅ Handles zero vectors
- ✅ Works with 512-dimensional vectors
- ✅ Preserves negative values
- ✅ Preserves vector direction

#### cosineSimilarity Tests (9 tests)
- ✅ Returns 1 for identical vectors
- ✅ Returns 1 for scaled versions
- ✅ Returns 0 for perpendicular vectors
- ✅ Returns -1 for opposite vectors
- ✅ Returns values in [-1, 1] range
- ✅ Handles 512-dimensional embeddings
- ✅ Works with normalized vectors
- ✅ Distinguishes similar vs dissimilar
- ✅ Is symmetric (A·B = B·A)

#### Integration Tests (2 tests)
- ✅ Normalizes and compares correctly
- ✅ Simulates face embedding comparison

---

### 2. `tests/embedding.test.js` (10 tests)
Tests the face embedding generation service using mocked ONNX model.

#### generateEmbedding Tests (7 tests)
- ✅ Generates 512-dimensional arrays
- ✅ Calls loadModel once
- ✅ Calls preprocessImage with buffer
- ✅ Runs model inference correctly
- ✅ Returns array of numbers
- ✅ Handles model errors gracefully
- ✅ Converts Float32Array properly

#### Embedding Properties Tests (2 tests)
- ✅ Generates consistent embeddings for same input
- ✅ Generates different embeddings for different inputs

#### Image Preprocessing Tests (1 test)
- ✅ Creates and validates test images

---

### 3. `tests/repository.test.js` (16 tests)
Tests database operations using mocked Prisma client.

#### saveEmbedding Tests (8 tests)
- ✅ Saves new users with embeddings
- ✅ Generates correct email from name
- ✅ Handles names with spaces (replaces with _)
- ✅ Converts names to lowercase
- ✅ Updates existing users (upsert)
- ✅ Saves 512-dimensional embeddings
- ✅ Handles database errors
- ✅ Handles special characters

#### getEmbeddingById Tests (6 tests)
- ✅ Retrieves users by ID
- ✅ Converts string IDs to numbers
- ✅ Returns null for missing users
- ✅ Retrieves full embedding data
- ✅ Handles database errors
- ✅ Handles invalid ID types

#### Integration Scenarios (2 tests)
- ✅ Save and retrieve workflow
- ✅ Re-registration (upsert) workflow

---

## Test Coverage Areas

### Mathematical Functions
- Vector normalization (L2 norm)
- Cosine similarity calculation
- Edge cases (zero vectors, negative values)

### AI/ML Operations
- ONNX model loading
- Image preprocessing
- Embedding generation
- Float32Array handling

### Database Operations
- User creation (upsert)
- User retrieval by ID
- Email generation from names
- Error handling

### Integration Workflows
- Complete registration flow
- Complete verification flow
- Re-registration scenarios

---

## Mocking Strategy

### 1. ONNX Runtime
```javascript
jest.mock('../utils/model');
jest.mock('../utils/preprocess');
```
Mocks model loading and image preprocessing to avoid dependencies on actual model files.

### 2. Prisma Client
```javascript
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));
```
Mocks database operations to avoid dependencies on actual PostgreSQL instance.

---

## Key Test Patterns

### 1. Unit Tests
Test individual functions in isolation with mocked dependencies.

```javascript
test('should normalize a vector to unit length', () => {
  const vector = [3, 4];
  const normalized = normalizeVector(vector);
  expect(normalized).toEqual([0.6, 0.8]);
});
```

### 2. Integration Tests
Test workflows that involve multiple components.

```javascript
test('should save and retrieve user successfully', async () => {
  const saved = await saveEmbedding('Test User', embedding);
  const retrieved = await getEmbeddingById(saved.id);
  expect(retrieved.embedding).toEqual(embedding);
});
```

### 3. Error Handling Tests
Verify graceful error handling.

```javascript
test('should handle database errors gracefully', async () => {
  mockPrisma.user.upsert.mockRejectedValue(new Error('DB error'));
  await expect(saveEmbedding('Test', [1,2,3])).rejects.toThrow('DB error');
});
```

---

## Test Configuration

### `jest.config.js`
```javascript
{
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.js',
    'utils/**/*.js',
    'repositories/**/*.js',
    'controllers/**/*.js'
  ],
  testTimeout: 10000
}
```

---

## Best Practices Used

1. **Isolation**: Each test is independent and doesn't affect others
2. **Mocking**: External dependencies are mocked to ensure fast, reliable tests
3. **Clear Names**: Test names clearly describe what is being tested
4. **Arrange-Act-Assert**: Tests follow the AAA pattern
5. **Edge Cases**: Tests cover normal cases, edge cases, and error scenarios
6. **Cleanup**: `beforeEach` clears mocks to ensure clean state

---

## Future Test Improvements

### Recommended Additions:
1. **Controller Tests**: Add tests for `faceController.js` endpoints
2. **End-to-End Tests**: Test complete API flows with supertest
3. **Performance Tests**: Test with large embeddings and datasets
4. **Security Tests**: Test input validation and sanitization
5. **Integration Tests**: Test with actual PostgreSQL (test database)

### Example Controller Test:
```javascript
describe('POST /api/face/encode', () => {
  test('should encode face and return user ID', async () => {
    const response = await request(app)
      .post('/api/face/encode')
      .attach('image', 'test-images/face.jpg')
      .field('name', 'Test User');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.userId).toBeDefined();
  });
});
```

---

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

---

## Troubleshooting

### Tests Fail Due to Module Not Found
```bash
npm install
```

### Tests Timeout
Increase timeout in `jest.config.js`:
```javascript
testTimeout: 20000
```

### Mock Not Working
Ensure mocks are declared before imports:
```javascript
jest.mock('...');  // Must be before require()
const module = require('...');
```

---

## Summary

All 42 tests pass successfully, providing comprehensive coverage of:
- ✅ Mathematical operations (cosine similarity, normalization)
- ✅ AI model operations (embedding generation)
- ✅ Database operations (save, retrieve, upsert)
- ✅ Error handling
- ✅ Integration workflows

The tests ensure the reliability and correctness of the face verification microservice's core functionality.
