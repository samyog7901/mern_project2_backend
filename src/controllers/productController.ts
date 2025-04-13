
import { Request, Response } from "express"
import Product from "../database/models/productModel"

class ProductController{
    public static async addProduct(req:Request,res:Response):Promise<void>{
        const { productName,description,price,stocks,image } = req.body
        // if(!username || !email || !password){
        //     res.status(400).json({message:"Please fill all the fields"})
        //     return
        // }

        await Product.create({
            productName,
            description,
            price,
            stocks,
            image
        })

        res.status(200).json({
            message:"Product added successfully"
        })


    }
}

export default ProductController