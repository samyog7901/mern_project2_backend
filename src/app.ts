import express,{Application,Request,Response} from 'express'
const app:Application = express()

const PORT:number = 3000
import * as dotenv from 'dotenv'
dotenv.config()
import './database/connection'
import jwt from 'jsonwebtoken'


app.use(express.json())

app.use(express.static("./src/uploads"))
import userRoute from './routes/userRoute'
import categoryRoute from './routes/categoryRoute'
import adminSeeder from './adminSeeder'
// admin seeder
adminSeeder()

import productRoute from './routes/productRoute'
import categoryController from './controllers/categoryController'
import cartRoute from './routes/cartRoute'
import orderRoute from './routes/orderRoute'

import cors from 'cors'
import { Server } from 'socket.io'
import { promisify } from 'util'
import User from './database/models/userModel'

app.use(cors({
    origin : '*'
}))







app.use("",userRoute)
app.use("/admin/product",productRoute)
app.use("/admin/category",categoryRoute)
app.use("/customer/cart",cartRoute)
app.use("/order",orderRoute)


const server = app.listen(PORT,()=>{
    categoryController.seedCategory()
    console.log(`Server is running on port ${PORT}`)
})

const io = new Server(server,{
    cors : {
        origin : ['http://localhost:5173', 'http://localhost:5174']
    }
})

const onlineUsers = new Map<string, { socketId: string; role: string }>();

const addToOnlieUsers = (socketId:string,userId:string,role:string)=>{
     onlineUsers.set(userId,{socketId, role})
}
io.on("connection",async (socket)=>{
    console.log("A client connected!", socket.id)
    const {token} = socket.handshake.auth
    try{
        if(token){
            //@ts-ignore
            const decoded:any = await promisify(jwt.verify)(token,process.env.SECRET_KEY)
            //@ts-ignore
            const doesUserExists = await User.findByPk(decoded.id)
            if(doesUserExists){
                addToOnlieUsers(socket.id,doesUserExists.id,doesUserExists.role)
            }
        }
    }catch(error){
        console.log(error)
    }
    
    socket.on("updateStatus",({type,status,orderId,userId})=>{
        const findUser = onlineUsers.get(userId)
        if(findUser){
            io.to(findUser.socketId).emit("statusUpdated",{type,status,orderId})
        }
    })
    socket.on("disconnect",()=>{
        onlineUsers.forEach((value,key)=>{
            if(value.socketId === socket.id){
                onlineUsers.delete(key)
            }
        })
        console.log("User disconnected", socket.id)
    })
})