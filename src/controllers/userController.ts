
import { Request, Response } from "express"
import User from "../database/models/userModel"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

class AuthController{
    public static async registerUser(req:Request,res:Response):Promise<void>{
        const { username,role,email,password} = req.body
        if(!username || !email || !password){
            res.status(400).json({message:"Please fill all the fields"})
            return
        }

        await User.create({
            username,
            role,
            email,
            password : bcrypt.hashSync(password,8)
        })

        res.status(200).json({
            message:"User registered successfully"
        })
       


    }

    public static async loginUser(req:Request,res:Response):Promise<void>{
        // user input
        const {email,password} = req.body
        if(!email || !password){
            res.status(400).json({message:"Please fill all the fields"})
            return
        }
        // check if user exists
        const [data] = await User.findAll({
            where:{
                email : email
            }
        })
        if(!data){
            res.status(404).json({message:"User not found"})
            return
        }
        // check if password is correct now
        const isMatched = bcrypt.compareSync(password,data.password)
        if(!isMatched){
            res.status(400).json({message:"Invalid password"})
            return
        }
        // if all checks pass, generate & return token
       const token = jwt.sign({id:data.id},process.env.SECRET_KEY as string,{
        expiresIn:"1d"
       })
       res.status(200).json({
        message:"User logged in successfully",
        data : {
            user : {
                id : data.id,
                username : data.username,
                email : data.email,
                role : data.role
            },
            token
        }
        
       })







    }
}

export default AuthController