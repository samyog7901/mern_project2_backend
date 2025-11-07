
import { Request, Response } from "express"
import Product from "../database/models/productModel"
import { Authrequest } from "../middleware/authMiddleware"
import User from "../database/models/userModel"
import Category from "../database/models/Category"

class ProductController{
    async addProduct(req:Authrequest,res:Response):Promise<void>{
        const userId = req.user?.id
        const { productName,description,price,stockQty,categoryId } = req.body
        let fileName 
        if(req.file){
            fileName = process.env.BACKEND_URL + req.file?.filename
        }else{
            fileName = "https://m.media-amazon.com/images/I/71sBygGN7TL.jpg"
        }
      if(!productName || !description || !price || !stockQty || !categoryId){
        res.status(400).json({
            message:"Please fill in all fields"
        })
        return
      }

        await Product.create({
            productName,
            description,
            price,
            stockQty,
            imageUrl : fileName,
            userId : userId,
            categoryId : categoryId
        })

        res.status(200).json({
            message:"Product added successfully"
        })


    }
    async getAllProducts(req:Request,res:Response):Promise<void>{
        const data = await Product.findAll(
            {
                include : [
                    {
                        model : User,
                        attributes : ["id","username","email"]
                    },
                    {
                        model : Category,
                        attributes : ["id","categoryName"]
                    }
                ]
            }
        )
        res.status(200).json({
            message : "Products fetched successfully",
            data
        })
    }
    async getSingleProduct(req:Request,res:Response):Promise<void>{
        const id = req.params.id
        const data = await Product.findOne({
            where : {
                id : id
            },
            include : [
                {
                    model : User,
                    attributes : ["id","username","email"]
                },
                {
                    model : Category,
                    attributes : ["id","categoryName"]
                }
            ]
        })
        if(!data){
            res.status(404).json({
                message : "No product with that id"
            })
        }else{
            res.status(200).json({
                message : "Product fetched successfully",
                data
            })
        }
    }
    async deleteProduct(req:Request,res:Response):Promise<void>{
        const {id} = req.params
        const data = await Product.findAll({
            where : {
                id : id
            }
        })
        if(data.length > 0){
            await Product.destroy({
                where : {
                    id : id
                }
            })
            res.status(200).json({
                message : "Product deleted successfully"

            })
        }else{
            res.status(404).json({
                message : "No product with that id"
            })
        }
    }
    async updateProduct(req: Request, res: Response): Promise<void> {
        const { id } = req.params
        const { productName, description, price, stockQty } = req.body
        
        const fileName = req.file
        ? req.file.filename
        :  "https://m.media-amazon.com/images/I/71sBygGN7TL.jpg";
      
        const product = await Product.findOne({ where: { id } })
      
        if (product) {
          await Product.update(
            {
              productName,
              description,
              price,
              stockQty,
              imageUrl:fileName 
            },
            {
              where: { id }
            }
          )
          res.status(200).json({
            message: "Product updated successfully"
          })
        } else {
          res.status(404).json({
            message: "No product with that id"
          })
        }
      }
      
}

export default new ProductController()