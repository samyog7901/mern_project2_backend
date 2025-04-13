import { Request,Response,NextFunction } from "express"

const errorHandler = (fn: (req:Request,res:Response) => Promise<any>)=>{
    return (req: Request,res:Response,)=>{
        fn(req,res).catch((err:Error)=>{
            return res.status(500).json({
                message : "Internal Server Error",
                errorMessage: err.message
            })
        })

    }
    
}

export default errorHandler