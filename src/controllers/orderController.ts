import { Authrequest } from "../middleware/authMiddleware"
import {Request, Response} from 'express'
import { KhaltiResponse, OrderData, OrderStatus, PaymentMethod, PaymentStatus, TransactionStatus, TransactionVerificationResponse } from "../types/orderTypes"
import Order from "../database/models/Order"
import Payment from "../database/models/Payment"
import OrderDetail from "../database/models/OrderDetails"
import axios from "axios"
import Product from "../database/models/productModel"
import Cart from "../database/models/Cart"
import User from "../database/models/userModel"


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
            paymentMethod: paymentDetails.paymentMethod,
            paymentStatus:
              paymentDetails.paymentMethod === PaymentMethod.Cod
                ? "unpaid"
                : "pending", // default pending for Khalti
          });
          
        const orderData = await Order.create({
            phoneNumber,
            shippingAddress,
            totalAmount,
            userId,
            paymentId : paymentData.id
        })
        let responseOrderData;
        for (const item of items) {
            responseOrderData = await OrderDetail.create({
              quantity: item.quantity,
              productId: item.productId,
              orderId: orderData.id
            });
          
            // Decrease stock
            const product = await Product.findByPk(item.productId);
            if (product) {
              await Product.update(
                { stockQty: product.stockQty - item.quantity },
                { where: { id: item.productId } }
              );
            }
          
            // Remove from cart
            await Cart.destroy({
              where: {
                productId: item.productId,
                userId
              }
            });
          }
          
        if(paymentDetails.paymentMethod == PaymentMethod.Khalti){
            // khalti integration
            const data = {
                return_url : "https://ecommerce-c.vercel.app/payment-verify",
                purchase_order_id : orderData.id,
                amount : totalAmount * 100, //khaltile paisa ma linxa
                website_url : "https://ecommerce-c.vercel.app/",
                purchase_order_name : 'orderName_' + orderData.id
            }
            const response = await axios.post('https://dev.khalti.com/api/v2/epayment/initiate/',data,{
                headers : {
                    "Authorization" : 'Key 1e19ce514cfa4794a713c142a44c180d'
                }
            })
            const khaltiResponse:KhaltiResponse = response.data
            paymentData.pidx = khaltiResponse.pidx
            paymentData.save()
            res.status(200).json({
                message : "Order placed successfully",
                url : khaltiResponse.payment_url,
                data : responseOrderData
            })
        

        }else{
            res.status(200).json({
                message : "order placed successfully",
                data : responseOrderData
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
        const response = await axios.post("https://dev.khalti.com/api/v2/epayment/lookup/",{pidx},{
            headers : {
                "Authorization" : "Key 1e19ce514cfa4794a713c142a44c180d"
            }
        })
        const data:TransactionVerificationResponse = response.data
        console.log(data , "data")
        if(data.status === TransactionStatus.Completed){
            const payment = await Payment.findOne({ where: { pidx } })
          if(payment){
            await Payment.update({paymentStatus:'paid'},{
                where : {
                    pidx : pidx
                }
            })
            await Order.update(
                { orderStatus: 'ontheway' },
                { where: { paymentId: payment.id} }
              )
          }
          
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
                    model: Payment
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
    async fetchOrders(req:Authrequest,res:Response):Promise<void>{
        
        const orders = await Order.findAll({
            include : [
                {
                    model: Payment
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
            where: { orderId },
            include: [
              { model: Product },
              {
                model: Order,
                include: [Payment,{model:User,attributes:["id","username","email"]}]   // 👈 this brings nested Payment info
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
    async cancelMyOrder(req: Authrequest, res: Response): Promise<void> {
        const userId = req.user?.id;
        const orderId = req.params.id;
    
        const order = await Order.findOne({
            where: { userId, id: orderId }
        });
    
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
    
        if ([OrderStatus.Ontheway, OrderStatus.Preparation].includes(order.orderStatus as OrderStatus)) {
            res.status(400).json({
                message: "You cannot cancel the order when it is on the way or in preparation"
            });
            return;
        }
    
        // Get order details
        const orderDetails = await OrderDetail.findAll({ where: { orderId } });
    
        // Increment stock
        for (const detail of orderDetails) {
            const product = await Product.findByPk((detail as any).productId);
            if (product) {
                await Product.update(
                    { stockQty: product.stockQty + (detail as any).quantity },
                    { where: { id: (detail as any).productId } }
                );
            }
        }
    
        // Cancel order
        await Order.update(
            { orderStatus: OrderStatus.Cancelled },
            { where: { id: orderId } }
        );
    
        res.status(200).json({ message: "Order cancelled successfully" });
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
                    orderId : orderId
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