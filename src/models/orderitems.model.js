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
    totalitem:{
        type:Map,
        of:Number,
        required:[true,"itemname is required"]
    },
    totalprice:{
        type:Number,
        required:[true,"itemprice is required"]
    },

},{timestamps:true})

export const Orderitem=mongoose.model('Orderitem',orderitemSchema)