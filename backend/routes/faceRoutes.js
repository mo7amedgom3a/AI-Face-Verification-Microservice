const express = require("express");
const multer = require("multer");
const { encodeFace, getFaceById } = require("../controllers/faceController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/face/encode - Upload face image with field name "image"
router.post("/encode", upload.single("image"), encodeFace);
router.get("/user/:id", getFaceById);

module.exports = router;
