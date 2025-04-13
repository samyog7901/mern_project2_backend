import express,{Application,Request,Response} from 'express'
const app:Application = express()

const PORT:number = 3000
import * as dotenv from 'dotenv'
dotenv.config()
import './database/connection'

app.use(express.json())
import userRoute from './routes/userRoute'
import productRoute from './routes/productRoute'
import adminSeeder from './adminSeeder'

// admin seeder
adminSeeder()







app.use("",userRoute)
app.use("",productRoute)

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})