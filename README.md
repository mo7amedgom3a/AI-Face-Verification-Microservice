# 🧠 AI Face Verification Microservice

This project implements a **Face Verification Microservice** using Node.js, Express.js, PostgreSQL, and a face recognition model (ONNX) from Hugging Face. It simulates a real-world biometric system that can register and verify faces by generating and comparing facial embeddings.

## 🚀 Project Overview

The microservice provides two main endpoints:

| Endpoint | Purpose | Description |
|----------|---------|-------------|
| `POST /api/face/encode` | Registration | Converts a user's face image into a 512-dimensional embedding and stores it in PostgreSQL. |
| `POST /api/face/compare/:id` | Verification | Compares a new face image to a stored embedding using cosine similarity to verify identity. |

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│   Express    │─────▶│  ArcFace    │
│   (Image)   │      │   Server     │      │  ONNX Model │
└─────────────┘      └──────────────┘      └─────────────┘
                            │                      │
                            │                      ▼
                            │              ┌─────────────┐
                            │              │  Embedding  │
                            │              │  (512-dim)  │
                            │              └─────────────┘
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐      ┌─────────────┐
                     │  PostgreSQL  │◀─────│   Prisma    │
                     │   Database   │      │     ORM     │
                     └──────────────┘      └─────────────┘
```

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (with Prisma ORM)
- **AI Model**: ArcFace (ONNX Runtime)
- **Image Processing**: Sharp
- **File Upload**: Multer

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- ArcFace ONNX model file

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/mo7amedgom3a/AI-Face-Verification-Microservice.git
cd AI-Face-Verification-Microservice/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/mydatabase
```

### 4. Download the ArcFace Model
Download the ArcFace ONNX model and place it in `backend/models/arcface.onnx`. See `backend/models/README.md` for instructions.

### 5. Run Database Migrations
```bash
npx prisma migrate dev
```

### 6. Start the Server
```bash
npm start
```

The server will be running at `http://localhost:3000`

## 📡 API Endpoints

### Face Recognition Endpoints

#### `POST /api/face/encode`
Register a new face by generating and storing its embedding.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `image` (file, required): Face image file
  - `name` (string, optional): User name (default: "testuser")

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/face/encode \
  -F "image=@/path/to/face.jpg" \
  -F "name=John Doe"
```

**Response:**
```json
{
  "success": true,
  "userId": 1,
  "embeddingLength": 512
}
```

#### `GET /api/face/:id`
Retrieve user information by ID.

**Response:**
```json
{
  "success": true,
  "userId": 1,
  "name": "John Doe",
  "embeddingLength": 512
}
```

#### `POST /api/face/compare/:id`
Verify a face against a stored embedding.

**Request:**
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `image` (file, required): Face image to verify

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/face/compare/1 \
  -F "image=@/path/to/verify.jpg"
```

**Response:**
```json
{
  "success": true,
  "similarity": 0.8523,
  "is_match": true,
  "threshold": 0.6
}
```

## 🔄 How It Works

### 🔐 Encoding Flow (Registration)

```
1. Receive Image
   └─ User uploads face image via /api/face/encode

2. Image Preprocessing
   ├─ Resize to 112x112 pixels
   ├─ Remove alpha channel (RGB only)
   ├─ Normalize pixels: [0-255] → [0-1]
   └─ Convert to ONNX Tensor [1, 112, 112, 3]

3. Generate Embedding
   ├─ Load ArcFace ONNX model
   ├─ Run inference on preprocessed image
   └─ Extract 512-dimensional feature vector

4. Normalize Embedding
   ├─ Calculate L2 norm (vector magnitude)
   └─ Divide each element by norm (unit vector)

5. Store in Database
   ├─ Generate unique email from name
   ├─ Upsert user record (update if exists)
   └─ Store: { name, email, embedding (JSON) }

6. Return Response
   └─ { userId, embeddingLength }
```

### 🔍 Comparison Flow (Verification)

```
1. Receive Image & User ID
   └─ User uploads face image via /api/face/compare/:id

2. Image Preprocessing
   ├─ Same preprocessing as encoding
   └─ Normalize pixels and create tensor

3. Generate New Embedding
   ├─ Run ArcFace model inference
   └─ Extract 512-dimensional vector

4. Normalize New Embedding
   └─ Convert to unit vector (L2 normalization)

5. Fetch Stored Embedding
   ├─ Query database by userId
   └─ Retrieve stored normalized embedding

6. Calculate Cosine Similarity
   ├─ Compute dot product: Σ(A[i] × B[i])
   ├─ Result range: [-1, 1]
   └─ Typical face similarity: [0.3 - 0.9]

7. Apply Threshold
   ├─ Threshold = 0.6
   ├─ similarity ≥ 0.6 → Match (same person)
   └─ similarity < 0.6 → No match (different person)

8. Return Response
   └─ { similarity, is_match, threshold }
```

## 📊 Understanding the Results

### Similarity Score Interpretation

| Similarity Range | Meaning |
|------------------|---------|
| **0.8 - 1.0** | Very high match - Same person (high confidence) |
| **0.6 - 0.8** | Good match - Likely same person |
| **0.4 - 0.6** | Uncertain - Different lighting, angle, or different person |
| **0.0 - 0.4** | No match - Different person |

### Key Concepts

- **Embedding**: A 512-dimensional vector representing unique facial features extracted by the neural network
- **Normalization**: Converting the vector to unit length (magnitude = 1) for consistent comparison
- **Cosine Similarity**: Measures the angle between two vectors
  - `1.0` = Identical direction (same face)
  - `0.0` = Perpendicular (unrelated)
  - `-1.0` = Opposite direction (rare in practice)
- **Threshold (0.6)**: Decision boundary to determine if faces match

## 🗂️ Project Structure

```
backend/
├── app.js                    # Main Express application
├── package.json              # Dependencies
├── .env                      # Environment variables
├── docker-compose.yml        # Docker setup for PostgreSQL
├── Dockerfile                # Container configuration
│
├── config/                   # Configuration files
├── controllers/              # Request handlers
│   └── faceController.js     # Encode & compare logic
│
├── db/                       # Database utilities
│   └── database.js
│
├── models/                   # AI models
│   ├── arcface.onnx          # Face recognition model (not in git)
│   └── README.md             # Model download instructions
│
├── prisma/                   # Database schema & migrations
│   ├── schema.prisma         # Database schema definition
│   └── migrations/           # Database migrations
│
├── repositories/             # Database access layer
│   └── faceRepository.js     # User & embedding CRUD
│
├── routes/                   # API routes
│   └── faceRoutes.js         # Face endpoints
│
├── services/                 # Business logic
│   └── faceService.js        # Embedding generation
│
├── utils/                    # Utility functions
│   ├── cosineSimilarity.js   # Vector similarity calculation
│   ├── model.js              # ONNX model loader
│   └── preprocess.js         # Image preprocessing
│
├── tests/                    # Test files
│   └── test-model.js         # Model testing
│
└── uploads/                  # Uploaded images (temporary)
```

## 🧪 Testing the API

### Using Postman

1. **Encode a Face**:
   - Method: `POST`
   - URL: `http://localhost:3000/api/face/encode`
   - Body: `form-data`
     - Key: `image` (File)
     - Key: `name` (Text): "John Doe"

2. **Compare a Face**:
   - Method: `POST`
   - URL: `http://localhost:3000/api/face/compare/1`
   - Body: `form-data`
     - Key: `image` (File)

### Using cURL

```bash
# Encode a face
curl -X POST http://localhost:3000/api/face/encode \
  -F "image=@person1.jpg" \
  -F "name=Alice"

# Compare a face (should match)
curl -X POST http://localhost:3000/api/face/compare/1 \
  -F "image=@person1_again.jpg"

# Compare different person (should not match)
curl -X POST http://localhost:3000/api/face/compare/1 \
  -F "image=@person2.jpg"
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start PostgreSQL database
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Start the application
npm start
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | Required |

### Adjustable Parameters

In `faceController.js`:
- **Threshold** (line 67): Adjust the matching threshold (default: 0.6)
  - Lower = More lenient (more false positives)
  - Higher = More strict (more false negatives)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Mohamed Gomaa**
- GitHub: [@mo7amedgom3a](https://github.com/mo7amedgom3a)

## 🙏 Acknowledgments

- ArcFace model for face recognition
- ONNX Runtime for model inference
- Prisma for database management
