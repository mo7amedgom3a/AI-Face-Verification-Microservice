const express = require("express");
const multer = require("multer");
const { encodeFace, getFaceById, compareFace } = require("../controllers/faceController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/user/:id", getFaceById);
router.post("/encode", upload.single("image"), encodeFace);
router.post("/compare/:id", upload.single("image"), compareFace);


module.exports = router;
