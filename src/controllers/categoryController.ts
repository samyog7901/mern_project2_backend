import Category from "../database/models/Category"


class CategoryController{
    // dummy data
    categoryData = [
        {
            categoryName : "Electronics"
        },
        {
            categoryName : "Fashion"
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
}

export default new CategoryController()