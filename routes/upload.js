import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { requireLogin, requireRole } from "../middleware/validerRolle.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  requireLogin,
  requireRole("admin"),
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  (req, res) => {
    try {
      const filePath = req.file.path;

      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = xlsx.utils.sheet_to_json(sheet);

      const quizFolder = path.join(process.cwd(), "quizzes");
      if (!fs.existsSync(quizFolder)) {
        fs.mkdirSync(quizFolder);
      }

      const id = Date.now();
      const fileName = path.join(quizFolder, `${id}.json`);

      fs.writeFileSync(fileName, JSON.stringify(data, null, 2));

      fs.unlinkSync(filePath);

      res.json({ message: "Quiz uploadet!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Fejl ved upload" });
    }
  },
);

export default router;
