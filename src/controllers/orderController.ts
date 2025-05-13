import { Authrequest } from "../middleware/authMiddleware"
import {Request, Response} from 'express'
import { KhaltiResponse, OrderData, OrderStatus, PaymentMethod, PaymentStatus, TransactionStatus, TransactionVerificationResponse } from "../types/orderTypes"
import Order from "../database/models/Order"
import Payment from "../database/models/Payment"
import OrderDetail from "../database/models/OrderDetails"
import axios from "axios"
import Product from "../database/models/productModel"

class ExtendedOrder extends Order{
    declare paymentId : string
}

class OrderController{
    async createOrder(req: Authrequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const {phoneNumber,shippingAddress,totalAmount,paymentDetails,items}:OrderData = req.body
        if(!phoneNumber || !shippingAddress || !totalAmount || !paymentDetails || !paymentDetails.paymentMethod || items.length == 0){
            res.status(400).json({
                message : "Please provide phoneNumber,shippingAddress,totalAmount,paymentDetails and items"
            })
            return
        }

        
        const paymentData = await Payment.create({
            paymentMethod : paymentDetails.paymentMethod
        })
        const orderData = await Order.create({
            phoneNumber,
            shippingAddress,
            totalAmount,
            userId,
            paymentId : paymentData.id
        })

        for(var i = 0; i<items.length; i++){
            await OrderDetail.create({
                quantity : items[i].quantity,
                productId : items[0].productId,
                orderId : orderData.id
            })
        }
        if(paymentDetails.paymentMethod == PaymentMethod.Khalti){
            // khalti integration
            const data = {
                return_url : "http://localhost:3000/success",
                purchase_order_id : orderData.id,
                amount : totalAmount * 100, //khaltile paisa ma linxa
                website_url : "http://localhost:3000/",
                purchase_order_name : 'orderName_' + orderData.id
            }
            const response = await axios.post('https://a.khalti.com/api/v2/epayment/initiate/',data,{
                headers : {
                    "Authorization" : 'Key 1e19ce514cfa4794a713c142a44c180d'
                }
            })
            const khaltiResponse:KhaltiResponse = response.data
            paymentData.pidx = khaltiResponse.pidx
            paymentData.save()
            res.status(200).json({
                message : "Order placed successfully",
                url : khaltiResponse.payment_url
            })
        

        }else{
            res.status(200).json({
                message : "order placed successfully"
            })
        }


    }
    async verifyTransaction(req:Authrequest,res:Response):Promise<void>{
        const {pidx} = req.body
        const userId = req.user?.id
        if(!pidx){
            res.status(400).json({
                message : "Please provide pidx"
            })
            return
        }
        const response = await axios.post("https://a.khalti.com/api/v2/epayment/lookup/",{pidx},{
            headers : {
                "Authorization" : "Key 1e19ce514cfa4794a713c142a44c180d"
            }
        })
        const data:TransactionVerificationResponse = response.data
        console.log(data)
        if(data.status === TransactionStatus.Completed){
            await Payment.update({paymentStatus:'paid'},{
                where : {
                    pidx : pidx
                }
            })
            res.status(200).json({
                message : "Payment verified successfully"
            })
         
        }else{
            res.status(200).json({
                message : "not completed!"
            })
        }
    }
    // Customer Side Starts here
    async fetchMyOrders(req:Authrequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const orders = await Order.findAll({
            where : {
                userId
            },
            include : [
                {
                    model : Payment
                }
            ]
        })
        if(orders.length > 0){
            res.status(200).json({
                message : "order fetched successfully",
                data : orders
            })
        }else{
            res.status(404).json({
                message : "You haven't ordered anything yet..",
                data : []
            })
        }

    }
    async fetchOrderDetails(req:Authrequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const orderId = req.params.id
        const orderDetails = await OrderDetail.findAll({
            where : {
                orderId
            },
            include : [
                {
                    model : Product
                }
            ]
        })
        if(orderDetails.length > 0){
            res.status(200).json({
                message : "order details fetched successfully",
                data : orderDetails
            })
        }else{
            res.status(404).json({
                message : "No any order details of that id",
                data : []
            })
        }
    }
    async cancelMyOrder(req:Authrequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const orderId = req.params.id
        const order:any = await Order.findAll({
            where : {
                userId,
                id : orderId
            }
        })
        if(order?.orderStatus === OrderStatus.Ontheway || order?.orderStatus === OrderStatus.Preparation){
            res.status(200).json({
                message : "You cannot cancell order when it is ontheway ore prepared" 
            })
            return
        }
        await Order.update({orderStatus : OrderStatus.Cancelled},{
            where : {
                id : orderId
            }
        })
        res.status(200).json({
            message : "Order cancelled successfully"
        })
    }
    // Customer Side ends here

    async changeOrderStatus(req:Request,res:Response):Promise<void>{
        const orderId = req.params.id
        const orderStatus:OrderStatus = req.body.orderStatus
        await Order.update({
            orderStatus : orderStatus
        },{
            where : {
                id : orderId
            }
        })
        res.status(200).json({
            message : "Order status updated successfully"
        })
    }
    async changePaymentStatus(req:Request,res:Response):Promise<void>{
        const orderId = req.params.id
        const paymentStatus:PaymentStatus = req.body.paymentStatus
        const order = await Order.findByPk(orderId)
        const extendedOrder:ExtendedOrder = order as ExtendedOrder
        await Payment.update({
            paymentStatus : paymentStatus
        },{
            where : {
                id : extendedOrder.paymentId
            }
        })
        res.status(200).json({
            message : `Payment Status of orderId ${orderId} updated successfully to ${paymentStatus}`
        })
    }
    async deleteOrder(req:Request,res:Response):Promise<void>{
        const orderId = req.params.id
        const order = await Order.findByPk(orderId)
        const extendedOrder:ExtendedOrder = order as ExtendedOrder
        if(order){
            await OrderDetail.destroy({
                where : {
                    id : orderId
                }
            })

            await Payment.destroy({
                where : {
                    id : extendedOrder.paymentId
                }
            })

            await Order.destroy({
                where : {
                    id : orderId
                }
            })
            
            res.status(200).json({
                message : "Order deleted successfully"
            })
        }else{
            res.status(404).json({
                message : "No order with that orderId"
            })
        }
    }



}

export default new OrderController()