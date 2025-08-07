import mongoose from "mongoose";

const orderitemSchema=new mongoose.Schema({
    orderid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order"
    },
    userid:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"  
    },
    itemname:{
        type:String,
        required:[true,"itemname is required"]
    },
    itemprice:{
        type:Number,
        required:[true,"itemprice is required"]
    },
    totalitem:{
        type:Number,
        required:[true,"define total number of item"]
    },

},{timestamps:true})

export const orderitem=mongoose.model('orderitem',orderitemSchema)