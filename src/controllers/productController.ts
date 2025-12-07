
import { Request, Response } from "express"
import Product from "../database/models/productModel"
import { Authrequest } from "../middleware/authMiddleware"
import User from "../database/models/userModel"
import Category from "../database/models/Category"
import { cloudinary } from "../services/cloudinaryConfig"
import fs from "fs"
import csv from "csv-parser"

class ProductController{
    async addProduct(req: Authrequest, res: Response): Promise<void> {
        const userId = req.user?.id
        const { productName, description, price, stockQty, categoryId } = req.body
    
        if (!productName || !description || !price || !stockQty || !categoryId) {
            res.status(400).json({
                message: "Please fill in all fields"
            })
            return
        }
    
  
        const fileUrl = req.file
        ? req.file.path
        : "https://m.media-amazon.com/images/I/71sBygGN7TL.jpg"
    
        await Product.create({
            productName,
            description,
            price,
            stockQty,
            imageUrl: fileUrl,
            userId: userId,
            categoryId: categoryId
        })
    
        res.status(200).json({
            message: "Product added successfully"
        })
    }

    async addBulkProducts(req: Authrequest, res: Response): Promise<void> {
        const file = req?.file
       
            if (!req.file)  res.status(400).send("No file uploaded");
            
            const csvPath = file?.path; // multer saved path
            console.log("CSV uploaded to:", csvPath);
        
            // Now read the CSV using csvPath
    
        
        if (!file) {
            res.status(400).json({ message: "CSV file is required" })
            return
        }
    
        const results: any[] = []
    
        try {
            // Wrap CSV reading in a Promise to await it
            await new Promise<void>((resolve, reject) => {
                fs.createReadStream(file.path)
                    .pipe(csv())
                    .on("data", (data) => results.push(data))
                    .on("end", resolve)
                    .on("error", reject)
            })
    
            // Process rows after CSV is fully read
            for (const row of results) {
                const { name, description, price, stockQty, categoryId, image } = row
    
                if (!name || !description || !price || !stockQty || !categoryId || !image) {
                    console.log("Skipping invalid row:", row)
                    continue
                }
                const parsedCategoryId = parseInt(categoryId) || categoryId; // if you use UUIDs

    
                await Product.create({
                    productName: name,
                    description,
                    price: parseFloat(price),
                    stockQty: parseInt(stockQty),
                    imageUrl: image,
                    userId: (req as any).user?.id,
                    categoryId: categoryId,
                })
            }
    
            fs.unlinkSync(file.path) // remove CSV after processing
    
            res.status(200).json({
                message: "Bulk products uploaded successfully",
                total: results.length,
            })
        } catch (err) {
            console.error(err)
            res.status(500).json({ message: "Error uploading bulk products" })
        }
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


    async deleteProduct(req: Request, res: Response): Promise<void> {
        const { id } = req.params

        const product = await Product.findOne({ where: { id } })

        if (!product) {
            res.status(404).json({ message: "No product with that id" })
            return
        }

        // Delete Cloudinary image
        if (product.imageUrl && product.imageUrl.includes("cloudinary.com")) {
            const parts = product.imageUrl.split("/")
            const publicIdWithExt = parts[parts.length - 1]  // xyz123.jpg
            const folder = parts[parts.length - 2]           // ecommerce-project
            const publicId = `${folder}/${publicIdWithExt.split(".")[0]}`

            try {
                await cloudinary.v2.uploader.destroy(publicId)
            } catch (err) {
                console.log("Cloudinary delete error:", err)
            }
        }

        await Product.destroy({ where: { id } })

        res.status(200).json({
            message: "Product deleted successfully"
        })
    }

    async updateProduct(req: Request, res: Response): Promise<void> {
        const { id } = req.params
        const { productName, description, price, stockQty } = req.body
    
        const product = await Product.findOne({ where: { id } })
    
        if (!product) {
            res.status(404).json({ message: "No product with that id" })
            return
        }
    
        let newImage = product.imageUrl
    
        // If new file uploaded
        if (req.file) {
    
            // Delete old Cloudinary image
            if (product.imageUrl?.includes("cloudinary.com")) {
                const parts = product.imageUrl.split("/")
                const publicIdWithExt = parts[parts.length - 1]
                const folder = parts[parts.length - 2]
                const publicId = `${folder}/${publicIdWithExt.split(".")[0]}`
                await cloudinary.v2.uploader.destroy(publicId)
            }
    
            // Save new image URL
            newImage = req.file.path
        }
    
        await Product.update(
            {
                productName,
                description,
                price,
                stockQty,
                imageUrl: newImage
            },
            { where: { id } }
        )
    
        res.status(200).json({
            message: "Product updated successfully"
        })
    }
    
    
      
}

export default new ProductController()