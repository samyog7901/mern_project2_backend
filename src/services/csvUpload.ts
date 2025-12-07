// services/csvUpload.ts
import multer from "multer"


// Store CSV in a temporary folder
const csvStorage = multer.diskStorage({
    destination: function (req, file, cb:any) {
        cb(null, "uploads/csv")
    },
    filename: function (req, file, cb:any) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + "-" + file.originalname)
    }
})

// Only allow CSV files
const csvUpload = multer({
    storage: csvStorage,
    fileFilter: (req, file, cb:any) => {
        if (file.mimetype === "text/csv") {
            cb(null, true)
        } else {
            cb(new Error("Only CSV files are allowed"), false)
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5, // 5MB max
    },
})

export default csvUpload
