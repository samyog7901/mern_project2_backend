import express,{Router} from 'express'
import ProductController from '../controllers/productController'
import errorHandler from '../services/catchAsyncError'
import { multer,storage } from '../middleware/multerMiddleware'
import authMiddleware, { Role } from '../middleware/authMiddleware'
import productController from '../controllers/productController'

const upload = multer({storage : storage})
const router:Router = express.Router()


router.route("/")
.post(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),upload.single('image'),errorHandler(ProductController.addProduct))
.get(errorHandler(ProductController.getAllProducts))

router.route("/:id").get(productController.getSingleProduct).delete(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),errorHandler(productController.deleteProduct))


export default router