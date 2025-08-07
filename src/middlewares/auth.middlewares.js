import JWT from "jsonwebtoken"
import { User } from "../models/user.model.js"
import dotenv from "dotenv"
import { ApiError } from "../utils/ApiError.js"
dotenv.config()

export const VerifyJWT=async()=>{
   try {
     const token=req.cookies?.AccessToken || req.headers.authorization.replace("Bearer ","")
     if(!token){
         throw new ApiError(404,"Unathorized ! token not found")
     }
 
    try {
         const decodeToken=await JWT.verify(token,process.env.ACCESS_TOKEN_SECRET);
         const user = await User.findById(decodeToken?._id).select("-password -refreshtoken");
         
         if(!user){
             throw new ApiError(404,"Unauthorized ! user not found")
         }
         req.user=user
    } catch (error) {
        throw new ApiError(400,error?.message)
    }
     next()
   } catch (error) {
       return res.status(500)
       .json(
        new ApiError(500,error?.message)
       )
   }
}