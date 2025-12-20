import * as dotenv from 'dotenv'
dotenv.config()
import express,{Application} from 'express'
import path from 'path'
const app:Application = express()

const PORT = process.env.PORT || 3000

import './database/connection'
import jwt from 'jsonwebtoken'


app.use(express.json())

app.use("/uploads", express.static(path.join(__dirname, "uploads")))
import userRoute from './routes/userRoute'
import categoryRoute from './routes/categoryRoute'
// import adminSeeder from './adminSeeder'
// admin seeder
// adminSeeder()

import productRoute from './routes/productRoute'
// import categoryController from './controllers/categoryController'
import cartRoute from './routes/cartRoute'
import orderRoute from './routes/orderRoute'

import cors from 'cors'
import { Server } from 'socket.io'
import { promisify } from 'util'
import User from './database/models/userModel'
import Order from './database/models/Order'
import OrderDetail from './database/models/OrderDetails'
import Payment from './database/models/Payment'


app.use(cors({
    origin: /https:\/\/ecommerce-(admin|c)-.*\.vercel\.app/,
    credentials: true, // if you need cookies or auth headers
  }));







app.use("",userRoute)
app.use("/admin/product",productRoute)
app.use("/admin/category",categoryRoute)
app.use("/customer/cart",cartRoute)
app.use("/order",orderRoute)


const server = app.listen(PORT,()=>{
    // categoryController.seedCategory()
    console.log(`Server is running on port ${PORT}`)
})

export const io = new Server(server,{
    cors : {
        origin: (origin, callback) => {
            const allowedOrigins = [
              'https://ecommerce-admin-five-omega.vercel.app',
              'https://ecommerce-c.vercel.app'
            ];
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error("Not allowed by CORS"));
            }
        },
          credentials: true, // if you use cookies or auth headers
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

    
    socket.on("deleteOrder", async ({ orderId }) => {
        const order: any = await Order.findByPk(orderId);
      
        if (!order) return;
      
        const extendedOrder = order as any;
      
        await OrderDetail.destroy({ where: { orderId } });
        await Payment.destroy({ where: { id: extendedOrder.paymentId } });
        await Order.destroy({ where: { id: orderId } });
      
        io.emit("orderDeleted", orderId);
      });
      
    
      
    socket.on("disconnect",()=>{
        onlineUsers.forEach((value,key)=>{
            if(value.socketId === socket.id){
                onlineUsers.delete(key)
            }
        })
        console.log("User disconnected", socket.id)
    })
})