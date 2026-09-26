const express = require("express");
const multer = require("multer");
const uploadFileToS3 = require("../services/uploadService");
const { protect } = require("../middleware/auth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.post("/", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Choose an image to upload." });
    }
    const fileUrl = await uploadFileToS3(req.file);
    res.status(201).json({ fileUrl });
  } catch (error) {
    res.status(500).json({ message: "File upload failed." });
  }
});

module.exports = router;
