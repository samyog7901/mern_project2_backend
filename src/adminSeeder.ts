import User from "./database/models/userModel"
import bcrypt from 'bcrypt'


const adminSeeder = async():Promise<void> =>{
    const [data] = await User.findAll({
        where:{
            email:"p2admin@gmail.com"

        }
    })
    if(!data){
            await User.create({
                email :"p2admin@gmail.com",
                password:bcrypt.hashSync("admin123",8),
                role:"admin",
                username : 'p2admin'
            })
            console.log("admin credentials seeded successfully")
            
    }else{
        console.log("admin credentials already seeded")
    }
}

export default adminSeeder