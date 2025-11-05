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

// Routers
import userRouter from "./routers/user.route.js"
import orderRouter from "./routers/order.route.js"
import admindashRouter from "./routers/admindashboard.route.js"
import userdashRouter from "./routers/userdashboard.route.js"
import paymentRouter from "./routers/payment.route.js"

app.use('/api/v1/user',userRouter)
app.use('/api/v1/order',orderRouter)
app.use('/api/v1/admindash',admindashRouter)
app.use('/api/v1/userdash',userdashRouter)
app.use('/api/v1/payment',paymentRouter)

app.get("/", (req,res)=>{
    res.status(200).json({message:"Hello Welcome to LoundryService"})
})