import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const TotalorderStatusCount = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send count of all orders of this user on the basis of status
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
