import Category from "../database/models/Category"
import { Request,Response } from "express"


class CategoryController{
    // dummy data
    categoryData = [
        {
            categoryName : "Electronics"
        },
        {
            categoryName : "Passion"
        },
        {
            categoryName : "Groceries"
        },
    ]
    async seedCategory():Promise<void>{
        const datas = await Category.findAll()
        if(datas.length === 0){
            const data = await Category.bulkCreate(this.categoryData)
            console.log("Categories seeded successfully")
        }else{
            console.log("Categories already seeded")
        }
    }
    async addCategory(req:Request,res:Response):Promise<void>{
        const {categoryName} = req.body
        if(!categoryName){ 
            
            res.status(400).json({message:"Category name is required"})
            return
        }
         await Category.create({
            categoryName
        })
        const data = await Category.findAll()
        res.status(200).json({message:"Category addedd successfully",data})

    }
    async getCategories(req:Request,res:Response):Promise<void>{
        const data = await Category.findAll()
        res.status(200).json({
            message:"Categories fetched successfully",
            data
        })
    }
    async deleteCategory(req:Request,res:Response):Promise<void>{
        const {id} = req.params
        const data = await Category.findAll({
            where:{
                id : id
            }
        })
        if(data.length === 0){
            res.status(404).json({
                message:"No Category found with that id"
            })
        }else{
            await Category.destroy({
                where:{
                    id : id
                }
            })
            res.status(200).json({
                message:"Category deleted successfully"
            })
        }
    }
    async updateCategory(req:Request,res:Response):Promise<void>{
        const {id} = req.params
        const {categoryName} = req.body
        await Category.update({categoryName},{
            where:{
                id : id
            }
        })
        res.status(200).json({
            message:"Category updated successfully"
        })
        }
}

export default new CategoryController()