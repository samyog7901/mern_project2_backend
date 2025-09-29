import { Request,Response } from "express"
import { Authrequest } from "../middleware/authMiddleware"
import Cart from "../database/models/Cart"
import Product from "../database/models/productModel"
import Category from "../database/models/Category"


class CartController{
    async addToCart(req:Authrequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const {quantity,productId} = req.body
        if(!quantity || !productId){
            res.status(400).json({
                message : "please provide quantity and product ID"
            })
        }

        // check if product already exists in the cart table or not
        let cartItem = await Cart.findOne({
            where: { productId,userId }
        })
        if(cartItem){
            cartItem.quantity += quantity
            await cartItem.save()

        }else{
            // insert into Cart table
            cartItem = await Cart.create({
                quantity,
                userId,
                productId
                
            })
        }
        const data = await Cart.findAll({
            where : {
                userId
            }
        })
        res.status(200).json({
            message: "Item added to cart",
            data
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
                    include : [
                        {
                            model : Category,
                            attributes: ['id', 'categoryName']
                        }
                    ]
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
    async deleteMyCartItem(req:Authrequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const {productId} = req.params
        // check whether product of above productId exist or not
        const product = await Product.findByPk(productId)
        if(!productId){
            res.status(404).json({
                message : "No product with that id"
            })
            return
        }
        // delete the productid from userCart
        await Cart.destroy({
            where : {
                userId,
                productId
            }
        })
        res.status(200).json({
            message : "Product of cart deleted successfully"
        })
    }
    async updateCartItem(req:Authrequest,res:Response):Promise<void>{
        const {productId} = req.params
        const userId = req.user?.id
        const {quantity} = req.body
        if(!quantity){
            res.status(400).json({
                message : "Please provide quantity"
            })
            return
        }
        const cartData = await Cart.findOne({
            where : {
                userId,
                productId
            }
        })
        if(cartData){
            cartData.quantity = quantity
        await cartData?.save()
        res.status(200).json({
            message : "product of cart updated successfully",
            data : cartData
        })
        }else{
            res.status(400).json({
                message : "No productId of that userId"
            })
        }
    }
}

export default new CartController()