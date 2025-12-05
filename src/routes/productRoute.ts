import express,{Router} from 'express'
import errorHandler from '../services/catchAsyncError'
import upload from '../middleware/multerMiddleware'
import authMiddleware, { Role } from '../middleware/authMiddleware'
import productController from '../controllers/productController'
import csvUpload from '../services/csvUpload'

const router:Router = express.Router()


router.route("/")
.post(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),upload.single('image'),errorHandler(productController.addProduct))
.get(errorHandler(productController.getAllProducts))

router.route("/:id").get(productController.getSingleProduct).delete(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),errorHandler(productController.deleteProduct))
.patch(authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin),upload.single("image"),errorHandler(productController.updateProduct))


router.post("/bulk-upload", authMiddleware.isAuthenticated,authMiddleware.restrictTo(Role.Admin), csvUpload.single("file"), productController.addBulkProducts)


export default router