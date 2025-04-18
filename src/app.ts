import express,{Application,Request,Response} from 'express'
const app:Application = express()

const PORT:number = 3000
import * as dotenv from 'dotenv'
dotenv.config()
import './database/connection'

app.use(express.json())
import userRoute from './routes/userRoute'
import categoryRoute from './routes/categoryRoute'
import adminSeeder from './adminSeeder'
// admin seeder
adminSeeder()
import productRoute from './routes/productRoute'
import categoryController from './controllers/categoryController'










app.use("",userRoute)
app.use("/admin/product",productRoute)
app.use("/admin/category",categoryRoute)

app.listen(PORT,()=>{
    categoryController.seedCategory()
    console.log(`Server is running on port ${PORT}`)
})