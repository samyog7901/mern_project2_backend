import express,{Router} from 'express'
import ProductController from '../controllers/productController'
import errorHandler from '../services/catchAsyncError'
const router:Router = express.Router()


router.route("/addProduct")
.post(errorHandler(ProductController.addProduct))


export default router