import { Request,Response } from "express"
import { Authrequest } from "../middleware/authMiddleware"
import Cart from "../database/models/Cart"
import Product from "../database/models/productModel"
import Category from "../database/models/Category"

class CartController{
    async addToCart(req:Authrequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const {quantity,productId} = req.body
        if(quantity <= 0 || !productId){
            res.status(400).json({
                message : "please provide quantity and product ID"
            })
        }

        // check if product already exists in the cart table or not
        let cartItem = await Cart.findOne({
            where: { userId, productId }
        })
        if(cartItem){
            cartItem.quantity += quantity
            await cartItem.save()

        }else{
            // insert into Cart table
            cartItem = await Cart.create({
                userId,
                productId,
                quantity
            })
        }
        res.status(200).json({
            message: "Item added to cart",
            data : cartItem
        })
    }
    async getMyCarts(req:Authrequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const cartItems = await Cart.findAll({ 
            where: {
                userId 
            },
            include :[
                {
                    model : Product,
                    attributes : ['id', 'productName', 'price']
                },
                {
                    model : Category,
                    attributes: ['id', 'categoryName']
                }
            ]
               
        })
        if(cartItems.length === 0){
            res.status(404).json({ 
                message: "No items found in the cart." 
            })
        }else{
            res.status(200).json({
                message : "Cart items fetched successfully",
                data: cartItems
            })
        }
    }
}

export default new CartController()