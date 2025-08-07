import mongoose  from "mongoose";

const orderSchema=new mongoose.Schema({
     name:{
        type:String,
        required:[true,"username is required"]
     },
     phone:{
        type:String,
        required:[true,"phone number is required"],
        trim:true
     },
     alternatephone:{
         type:String,
         trim:true
     },
     housenumber:{
        type:String,
        required:[true,"house number is required"],
     },
     city:{
        type:String,
        required:[true,"city name is required"]
     },
     state:{
         type:String,
         required:[true,"state name is required"]
     },
     pincode:{
        type:String,
         required:[true,"pincode is required"]
     },
     nearby:{
        type:String,
        required:[true,"nearby is required"]
     },
     userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
     },
     paymetmethod:{
        type:String,
        enum:['COD','Online'],
        default:'COD'
     }
},{timestamps:true})

export const Order = mongoose.model('Order',orderSchema)