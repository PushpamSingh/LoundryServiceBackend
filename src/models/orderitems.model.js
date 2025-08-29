import mongoose from "mongoose";

const orderitemSchema=new mongoose.Schema({
    orderid:{
        type:String,
        required:[true,"orderid is required"],
    },
    userid:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"  
    },
    totalitem:{
        type:String,
        of:Number,
        required:[true,"itemname is required"]
    },
    totalprice:{
        type:Number,
        required:[true,"itemprice is required"]
    },
},{timestamps:true})

export const Orderitem=mongoose.model('Orderitem',orderitemSchema)