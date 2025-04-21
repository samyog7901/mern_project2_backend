import express,{Router} from 'express'
import authMiddleware from '../middleware/authMiddleware'
import errorHandler from '../services/catchAsyncError'
import cartController from '../controllers/cartController'
const router:Router = express.Router()

router.route("/").post(authMiddleware.isAuthenticated,errorHandler(cartController.addToCart))
.get(authMiddleware.isAuthenticated,errorHandler(cartController.getMyCarts))





export default router