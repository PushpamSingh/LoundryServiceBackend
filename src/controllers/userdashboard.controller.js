import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Order } from "../models/order.model.js";
import { isValidObjectId } from "mongoose";
import { Receipt } from "../models/receipt.model.js";
import { Orderitem } from "../models/orderitems.model.js";

const TotalorderStatusCount = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send count of all orders of this user on the basis of status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        //?Find the total order from status count
        const Orders = await Order.find({
            $and: [
                { userid: userId },
                { orderCompleted: true }
            ]
        });
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
const getAllOrders = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send all orders of this user
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const allOrders = await Order.find({ userid: userId })
        if (allOrders.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "No orders found")
            )
        }
        const orderitem = await Orderitem.find({ userid: userId })
        // atach order items to their respective orders
        const itemsByOrder = {};
        orderitem.forEach(item => {
            if (!itemsByOrder[item.orderid]) {
                itemsByOrder[item.orderid] = [];
            }
            itemsByOrder[item.orderid].push(item);
        })
        // console.log(itemsByOrder);
        const ordersWithItems = allOrders.map(order => ({
            ...order.toObject(),
            items: itemsByOrder[order._id] || [],
        }))
        // console.log(ordersWithItems[0].items);
        return res.status(200)
            .json(
                new ApiResponse(200, ordersWithItems, "All Orders fetched successfully")
            )
    }
    catch (error) {
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
        const pendingOrders = await Order.find({
            $and: [
                { userid: userId },
                { status: 'pending' },
                { orderCompleted: true }
            ]
        })

        if (pendingOrders.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "No pending orders found")
            );
        }
        // 🔸 Step 3: Collect all orderIds
        const orderIds = pendingOrders.map(order => order._id);

        // 🔸 Step 4: Fetch all related order items at once
        const orderItems = await Orderitem.find({
            orderid: { $in: orderIds },
            userid: userId,
        });

        // 🔸 Step 5: Group items by orderId
        const itemsByOrder = {};

        orderItems.forEach(item => {
            if (!itemsByOrder[item.orderid]) {
                itemsByOrder[item.orderid] = [];
            }
            itemsByOrder[item.orderid].push(item);
        });
        // 🔸 Step 6: Attach items to corresponding order
        const ordersWithItems = pendingOrders.map(order => ({
            ...order.toObject(),
            items: itemsByOrder[order._id] || [],
        }));
        // 🔸 Step 7: Return response
        return res.status(200).json(
            new ApiResponse(200, ordersWithItems, "Pending Orders fetched successfully")
        );
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const PickedOrders = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send all orders of this user which is in picked status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const pickedOrders = await Order.find({
            $and: [
                { userid: userId },
                { status: 'picked' },
                { orderCompleted: true }
            ]
        })

        if (pickedOrders.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "No picked orders found")
            )
        }
        // 🔸 Step 3: Collect all orderIds
        const orderIds = pickedOrders.map(order => order._id);
        // 🔸 Step 4: Fetch all related order items at once
        const orderItems = await Orderitem.find({
            orderid: { $in: orderIds },
            userid: userId,
        })
        // 🔸 Step 5: Group items by orderId
        const itemsByOrder = {};
        orderItems.forEach(item => {
            if (!itemsByOrder[item.orderid]) {
                itemsByOrder[item.orderid] = [];
            }
            itemsByOrder[item.orderid].push(item);
        })
        // 🔸 Step 6: Attach items to corresponding order
        const ordersWithItems = pickedOrders.map(order => ({
            ...order.toObject(),
            items: itemsByOrder[order._id] || [],
        }))
        // 🔸 Step 7: Return response
        return res.status(200)
            .json(
                new ApiResponse(200, ordersWithItems, "Picked Orders fetched successfully")
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
        //! Validate and check for user role and send all orders of this user which is in washed status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const washedOrders = await Order.find({
            $and: [
                { userid: userId },
                { status: 'washed' },
                { orderCompleted: true }
            ]
        })
        if (washedOrders.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "No washed orders found")
            )
        }
        // 🔸 Step 3: Collect all orderIds
        const orderIds = washedOrders.map(order => order._id);
        // 🔸 Step 4: Fetch all related order items at once
        const orderItems = await Orderitem.find({
            orderid: { $in: orderIds },
            userid: userId,
        })
        // 🔸 Step 5: Group items by orderId
        const itemsByOrder = {};
        orderItems.forEach(item => {
            if (!itemsByOrder[item.orderid]) {
                itemsByOrder[item.orderid] = [];
            }
            itemsByOrder[item.orderid].push(item);
        })
        // 🔸 Step 6: Attach items to corresponding order
        const ordersWithItems = washedOrders.map(order => ({
            ...order.toObject(),
            items: itemsByOrder[order._id] || [],
        }))
        // 🔸 Step 7: Return response
        return res.status(200)
            .json(
                new ApiResponse(200, ordersWithItems, "Washed Orders fetched successfully")
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
        //! Validate and check for user role and send all orders of this user which is in delivered status
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const deliveredOrders = await Order.find({
            $and: [
                { userid: userId },
                { status: 'delivered' },
                { orderCompleted: true }
            ]
        })
        if (deliveredOrders.length === 0) {
            return res.status(200).json(
                new ApiResponse(200, [], "No delivered orders found")
            )
        }

        // 🔸 Step 3: Collect all orderIds
        const orderIds = deliveredOrders.map(order => order._id);
        // 🔸 Step 4: Fetch all related order items at once
        const orderItems = await Orderitem.find({
            orderid: { $in: orderIds },
            userid: userId,
        })
        // 🔸 Step 5: Group items by orderId
        const itemsByOrder = {};
        orderItems.forEach(item => {
            if (!itemsByOrder[item.orderid]) {
                itemsByOrder[item.orderid] = [];
            }
            itemsByOrder[item.orderid].push(item);
        })
        // 🔸 Step 6: Attach items to corresponding order
        const ordersWithItems = deliveredOrders.map(order => ({
            ...order.toObject(),
            items: itemsByOrder[order._id] || [],
        }))
        // 🔸 Step 7: Return response

        return res.status(200)
            .json(
                new ApiResponse(200, ordersWithItems, "Delivered Orders fetched successfully")
            )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})
const PaymentHistory = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        //! Validate and check for user role and send all payment history orders of this user
        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        const payments = await Receipt.find({ userid: userId })
        return res.status(200)
            .json(
                new ApiResponse(200, payments, "payment history fetched")
            )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

export {
    TotalorderStatusCount,
    PendingOrders,
    PickedOrders,
    WashedOrders,
    DeliveredOrders,
    PaymentHistory,
    getAllOrders
}
