// import multer from 'multer'
// import { Request } from 'express'

// // Storage configuration
// const storage = multer.diskStorage({
//     destination: function (req: Request, file: Express.Multer.File, cb: Function) {
//         const allowedFileTypes = ['image/jpg', 'image/png', 'image/jpeg']
//         if (!allowedFileTypes.includes(file.mimetype)) {
//             return cb(new Error('This filetype is not allowed'))
//         }
//         cb(null, './src/uploads')
//     },
//     filename: function (req: Request, file: Express.Multer.File, cb: Function) {
//         cb(null, Date.now() + '-' + file.originalname)
//     }
// })

// // Multer instance
// const upload = multer({ storage:st })

// export { upload, storage }



import multer from 'multer'
import {storage} from '../services/cloudinaryConfig'
import { Request } from 'express'
const upload = multer({storage :storage,
    fileFilter : (req:Request,file:Express.Multer.File,cb:any)=>{
        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if(allowedFileTypes.includes(file.mimetype)){
            cb(null,true)
        }else{
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'), false)
        }
    },
    limits : {
        fileSize: 1024 * 1024 * 2 // 2MB
    }
})

export default upload
