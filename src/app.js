import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv"
export const app=express();
dotenv.config()


app.use(cors({
    origin:[process.env.CORS_ORIGIN1],
    credentials:true,
    optionsSuccessStatus:200
}))
app.set("trust proxy",1);
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb",extended:true}))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/", (req,res)=>{
    res.status(200).json({message:"Hello Welcome to LoundryService"})
})