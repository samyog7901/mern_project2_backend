import { NextFunction, Request,Response } from "express"
import jwt from 'jsonwebtoken'
import User from "../database/models/userModel"


export interface Authrequest extends Request {
    user?:{
        username : string,
        id : string,
        role : string,
        email : string,
        password : string
    }

}
export enum Role{
    Admin = "admin",
    Customer = "customer"
}
class AuthMiddleware {
    async isAuthenticated(req:Authrequest,res:Response,next:NextFunction):Promise<void>{
        // get token from user
        const token = req.headers.authorization
        if(!token || token === undefined ){
            res.status(403).json({
                message:"Token not provided"
            })
            return
        }

        // verify token
        jwt.verify(token,process.env.SECRET_KEY as string,async (err,decoded:any)=>{
            if(err){
                res.status(403).json({
                    message:"Invalid token"
                })
            }else{
                // check if that decoded object id user exist or not
                try{
                    const userData = await User.findByPk(decoded.id)
                if(!userData){
                    res.status(404).json({
                        message:"User not found with that token"
                    })
                    return
                }
                req.user = userData
                next()
                }catch(error){
                    res.status(500).json({
                        message:"Internal server error"
                    })
                }
            }


        })
    }

    restrictTo(...roles:Role[]){
        return (req:Authrequest,res:Response,next:NextFunction)=>{
            let userRole = req.user?.role as Role
            if(!roles.includes(userRole)){
                res.status(403).json({
                    message:"You do not have permission to access this route"
                })
            }else{
                next()
            }

        }

    }
}

export default new AuthMiddleware()