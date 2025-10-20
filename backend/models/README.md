# Models Directory

## ArcFace ONNX Model

The `arcface.onnx` model file is not included in the repository due to its large size (131MB).

### Download Instructions

You need to download the ArcFace ONNX model and place it in this directory before running the application.

**Option 1: Download from Hugging Face**
```bash
wget https://huggingface.co/garavv/arcface-onnx/resolve/main/arc.onnx -O arcface.onnx
```

**Option 2: Manual Download**
1. Download the ArcFace ONNX model from a trusted source
2. Rename it to `arcface.onnx`
3. Place the file in this `backend/models/` directory

### Expected File
- `arcface.onnx` - Face recognition model (~131MB)

**Note:** The model file must be named exactly `arcface.onnx` for the application to work correctly.
