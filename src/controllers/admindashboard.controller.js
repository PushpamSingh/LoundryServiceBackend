import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { Orderitem } from "../models/orderitems.model.js";

const TotalorderStatusCountandRevenue = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send count of all orders of all users on the basis of statusi  
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const user = await User.findById(userId);
        if (user.role !== "admin") {
            throw new ApiError(403, "Unauthorized !! not allowed to fetch this api")
        }

        //?Find the total order from status count
        const Orders = await Order.find();
        const StatusCount = {}
        for (let order of Orders) {
            StatusCount[order?.status] = (StatusCount[order?.status] || 0) + 1
        }
        //!Find the total orderItems
        const totalItemPrice = await Orderitem.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalprice" }
                }
            }
        ])

        const totalRevenue = totalItemPrice[0]?.total || 0

        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        StatusCount,
                        totalRevenue
                    },
                    "Orders details fetched"
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
        //! Validate and check for user role and send all orders of all users which is in pending status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const user = await User.findById(userId);
        if (user.role !== "admin") {
            throw new ApiError(403, "Unauthorized !! not allowed to fetch this api")
        }

        const pendingOrders=await Order.find({status:'pending'})

        return res.status(200)
        .json(
            new ApiResponse(200,pendingOrders,"Pending Orders fetched successfuly")
        )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const PickedOrders = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send all orders of all users which is in picked status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const user = await User.findById(userId);
        if (user.role !== "admin") {
            throw new ApiError(403, "Unauthorized !! not allowed to fetch this api")
        }

        const pickedOrders=await Order.find({status:'picked'})         

        return res.status(200)
        .json(
            new ApiResponse(200,pickedOrders,"Picked Orders fetched successfuly")
        )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})
const WashedOrders = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send all orders of all users which is in washed status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const user = await User.findById(userId);
        if (user.role !== "admin") {
            throw new ApiError(403, "Unauthorized !! not allowed to fetch this api")
        }

        const washedOrders=await Order.find({status:'washed'})

        return res.status(200)
        .json(
            new ApiResponse(200,washedOrders,"Washed Orders fetched successfuly")
        )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})
const DeliveredOrders = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send all orders of all users which is in delivered status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const user = await User.findById(userId);
        if (user.role !== "admin") {
            throw new ApiError(403, "Unauthorized !! not allowed to fetch this api")
        }

        const deliveredOrders=await Order.find({status:'delivered'})

        return res.status(200)
        .json(
            new ApiResponse(200,deliveredOrders,"Delivered Orders fetched successfuly")
        )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})
const CanceledOrders = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send all orders of all users which is in canceled status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const user = await User.findById(userId);
        if (user.role !== "admin") {
            throw new ApiError(403, "Unauthorized !! not allowed to fetch this api")
        }

        const canceledOrders=await Order.find({status:'canceled'})
        return res.status(200)
        .json(
            new ApiResponse(200,canceledOrders,"Canceled Orders fetched successfuly")
        )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

export {
    TotalorderStatusCountandRevenue,
    PendingOrders,
    PickedOrders,
    WashedOrders,
    DeliveredOrders,
    CanceledOrders
}