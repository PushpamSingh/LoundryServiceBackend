import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Order } from "../models/order.model.js";

const TotalorderStatusCount = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send count of all orders of this user on the basis of status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
         //?Find the total order from status count
         const Orders = await Order.find({userid:userId});
         const StatusCount = {}
         for (let order of Orders) {
             StatusCount[order?.status] = (StatusCount[order?.status] || 0) + 1
         }
         return res.status(200)
         .json(
             new ApiResponse(
                 200,
                 StatusCount,
                 "Orders details fetched successfully"
             )
         )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const PendingOrders = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send all orders of this user which is in pending status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const pendingOrders=await Order.find({
            $and:[
                {userid:userId},
                {status:'pending'}
            ]
        })

        return res.status(200)
        .json(
            new ApiResponse(200,pendingOrders,"Pending Orders fetched successfully")
        )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const PickedOrders=Asynchandler(async(req,res)=>{
    try {
        const userId=req.user?._id;
         //! Validate and check for user role and send all orders of this user which is in picked status
         if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const pickedOrders=await Order.find({
            $and:[
                {userid:userId},
                {status:'picked'}
            ]
        })

        return res.status(200)
        .json(
            new ApiResponse(200,pickedOrders,"Picked Orders fetched successfully")
        )
    } catch (error) {
         res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})
const WashedOrders=Asynchandler(async(req,res)=>{
    try {
        const userId=req.user?._id;
         //! Validate and check for user role and send all orders of this user which is in washed status
         if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const washedOrders=await Order.find({
            $and:[
                {userid:userId},
                {status:'washed'}
            ]
        })

        return res.status(200)
        .json(
            new ApiResponse(200,washedOrders,"Washed Orders fetched successfully")
        )
    } catch (error) {
         res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})
const DeliveredOrders=Asynchandler(async(req,res)=>{
    try {
        const userId=req.user?._id;
         //! Validate and check for user role and send all orders of this user which is in delivered status
         if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const deliveredOrders=await Order.find({
            $and:[
                {userid:userId},
                {status:'delivered'}
            ]
        })

        return res.status(200)
        .json(
            new ApiResponse(200,deliveredOrders,"Delivered Orders fetched successfully")
        )
    } catch (error) {
         res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})
const PaymentHistory=Asynchandler(async(req,res)=>{
    try {
        const userId=req.user?._id;
        //! Validate and check for user role and send all payment history orders of this user
    } catch (error) {
           res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

export{
    TotalorderStatusCount,
    PendingOrders,
    PickedOrders,
    WashedOrders,
    DeliveredOrders,
    PaymentHistory
}
