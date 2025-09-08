import { app } from "./app.js"
import dotenv from "dotenv"
import { connectDB } from "./db/db.js"
dotenv.config()
const port=process.env.PORT

connectDB().then(()=>{
    app.listen(port,()=>{
        console.log(`app listening on port ${port}`);
    })
}).catch((err)=>{
    console.log("Error :: MongoConnection :: index.js :: ",err);
})