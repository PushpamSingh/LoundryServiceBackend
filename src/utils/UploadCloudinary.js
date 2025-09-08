import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv'
import { ApiError } from "./ApiError.js";
import fs from 'fs'
dotenv.config()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

export const uploadCloudinary=async(localPath)=>{
    try {
        if(!localPath){
            return ""
        }
        //! upload localpath on cloudinary
        const response=await cloudinary.uploader.upload(localPath,{
            resource_type:'auto'
        }) 

        fs.unlinkSync(localPath)
        return response;
    } catch (error) {
        fs.unlinkSync(localPath)
        return null
    }
}