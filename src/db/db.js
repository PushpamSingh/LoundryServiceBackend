import mongoose from "mongoose"
import dotenv from "dotenv"
import {DBConstant} from "./../constant.js"
dotenv.config();



export const connectDB=async()=>{
    try {
        const connnectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}/${DBConstant}`)
        console.log("Data Base connection host : ",connnectionInstance.connection.host);
    } catch (error) {
        throw error;
    }
}
