// services/csvUpload.ts
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import fs from "fs";
import path from "path";

// Ensure upload folder exists
const uploadFolder = path.join(__dirname, "../../uploads/csv");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Disk storage for CSV files
const csvStorage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadFolder); // MUST be string, not string | undefined
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File filter to allow only CSV
const csvFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed")); // Correct typing
  }
};

// Export multer middleware
const csvUpload = multer({
    storage: multer.memoryStorage(), // keeps file in RAM
    fileFilter: (req, file, cb:any) => {
      if (file.mimetype === "text/csv") cb(null, true);
      else cb(new Error("Only CSV files are allowed"), false);
    },
    limits: { fileSize: 1024 * 1024 * 5 },
  });
  

export default csvUpload;
