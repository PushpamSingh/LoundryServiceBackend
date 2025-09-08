import {v2 as cloudinary} from 'cloudinary'
import { configDotenv } from 'dotenv'
import { ApiError } from './ApiError.js'
configDotenv()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
export const deleteFromCloudinary=async(fileUrl)=>{
    try {
        if(!fileUrl){
            throw new ApiError(403,"fileUrl is required");
        }
        const splitedFile=fileUrl.split('/')
        const urlIDarray=splitedFile[splitedFile.length-1].split('.')
        const publicId=urlIDarray[0]

        const resourcetype='image'
        if(fileUrl.include('video')){
            resourcetype='video'
        }
        const response=await cloudinary.uploader.destroy(publicId,{
            resource_type:resourcetype
        })

        if(response?.result!=='ok' && response?.result!=='not found'){
            throw new ApiError(400,"Cloudinary Error !! failed to delete file");
        }
        return response
    } catch (error) {
        throw new ApiError(500,"Internal Server Error || while deleting image")
    }
}