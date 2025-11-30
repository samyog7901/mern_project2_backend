import User from "./database/models/userModel"
import bcrypt from 'bcrypt'


const adminSeeder = async():Promise<void> =>{
    const [data] = await User.findAll({
        where:{
            email:process.env.ADMIN_EMAIL

        }
    })
    if(!data){
            await User.create({
                email :process.env.ADMIN_EMAIL,
                password :bcrypt.hashSync("ShopNestAdmin321",8),
                role :process.env.ADMIN_ROLE,
                username :process.env.ADMIN_USERNAME
            })
            console.log("admin credentials seeded successfully")
            
    }else{
        console.log("admin credentials already seeded")
    }
}

export default adminSeeder