import multer from 'multer'
import { Request } from 'express'

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: Function) {
        const allowedFileTypes = ['image/jpg', 'image/png', 'image/jpeg']
        if (!allowedFileTypes.includes(file.mimetype)) {
            return cb(new Error('This filetype is not allowed'))
        }
        cb(null, './src/uploads')
    },
    filename: function (req: Request, file: Express.Multer.File, cb: Function) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

// Multer instance
const upload = multer({ storage })

export { upload, storage }
