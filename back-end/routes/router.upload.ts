import { Request, Response, Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth";
import uploadFileToS3 from "../services/uploadService";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.post("/", protect, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Choose an image to upload." });
      return;
    }
    const fileUrl = await uploadFileToS3(req.file);
    res.status(201).json({ fileUrl });
  } catch {
    res.status(500).json({ message: "File upload failed." });
  }
});

export default router;
