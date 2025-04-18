import express,{Router} from 'express'
import ProductController from '../controllers/productController'
import errorHandler from '../services/catchAsyncError'
import { multer,storage } from '../middleware/multerMiddleware'
import authMiddleware, { Role } from '../middleware/authMiddleware'

const upload = multer({storage : storage})
const router:Router = express.Router()


router.route("/")
.post(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),upload.single('image'),errorHandler(ProductController.addProduct))
.get(errorHandler(ProductController.getAllProducts))


export default router