# 🧠 AI Face Verification Microservice

This project implements a Face Verification Microservice using Node.js, Express.js, PostgreSQL, and a face recognition model (ONNX) from Hugging Face.
It simulates a real-world biometric system that can register and verify faces by generating and comparing facial embeddings.

## 🚀 Project Overview

The microservice provides two endpoints:

| Endpoint | Purpose | Description |
|----------|---------|-------------|
| `POST /encode` | Registration | Converts a user's face image into a 512-dimensional embedding and stores it in PostgreSQL. |
| `POST /compare` | Verification | Compares a new face image to a stored embedding using cosine similarity to verify identity. |
