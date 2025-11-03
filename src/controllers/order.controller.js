import { isValidObjectId } from "mongoose";
import { Order, Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import { User } from "../models/user.model.js";
import { Orderitem } from "../models/orderitems.model.js";

const Createorder = Asynchandler(async (req, res) => {
    try {
        const { orderitem, name, phone, area, alternatephone, housenumber,
            city, state, pincode, nearby, instructions } = req.body;
        const userId = req.user?._id;
        //!Generate OrderID (ORD-001)
        //?calculate price of a item from orderitem and create new document for orderitem

        if (!isValidObjectId(userId)) {
            throw new ApiError(401, "Unauthorized ! Invalid userId")
        }
        if ([orderitem, name, phone, area, alternatephone, housenumber,
            city, state, pincode, nearby].some((field) => field === "")) {
            throw new ApiError(400, "Fields must not be empty")
        }

        const isUser = await User.findById(userId);
        if (!isUser) {
            throw new ApiError(403, "Unauthorized ! Can't place order")
        }

        //!Generate custom orderId
        const orderCount = await Order.countDocuments();
        const nextOrderCount = orderCount + 1;
        const paddedNumber = String(nextOrderCount).padStart(3, "0");
        const orderId = `ORD-${paddedNumber}`

        const createOrder = await Order.create({
            name: name,
            phone: phone,
            area: area,
            alternatephone: alternatephone,
            housenumber: housenumber,
            city: city,
            state: state,
            pincode: pincode,
            nearby: nearby,
            userid: userId,
            orderId: orderId,
            instructions: instructions
        })
        await createOrder.save({ validateBeforeSave: false })

        if (!createOrder) {
            throw new ApiError(400, "creating Order Failled!!!")
        }
        const order = await Order.findById(createOrder?._id).select("-cancellationReason")

        if (!order) {
            throw new ApiError(404, "order not found")
        }

        if (!orderitem || typeof (orderitem) !== "object") {
            throw new ApiError(400, "please provide some orderItem")
        }
        const newObj = {};
        let totalprice = 0;
        for (const [key, value] of Object.entries(orderitem)) {
            if (typeof (key) !== "string" || typeof (value) !== "number" || value <= 0) {
                throw new ApiError(400, "please provide valid details")
            }
            newObj[key] = value
            if (key === "Shirts") {
                totalprice += (value * 15)
            } else if (key === "Pants") {
                totalprice += (value * 15)
            } else if (key === "Dresses") {
                totalprice += (value * 20)
            } else if (key === "Suits") {
                totalprice += (value * 35)
            } else if (key === "Bedsheets") {
                totalprice += (value * 10)
            } else if (key === "BlanketsOrQuilts") {
                totalprice += (value * 40)
            }
        }

        const createOrderItem = await Orderitem.create({
            orderid: createOrder?._id,
            userid: userId,
            totalitem: newObj,
            totalprice: totalprice
        })
        await createOrderItem.save({ validateBeforeSave: false })

        if (!createOrderItem) {
            throw new ApiError(400, "creating Order Item Failled!!!")
        }
        const createdOrderitem = await Orderitem.findById(createOrderItem?._id)

        if (!createdOrderitem) {
            throw new ApiError(404, "Order Item Not Found")
        }

        // If online payment, return a hint to create Razorpay order
        const responseData = { order, createdOrderitem };
        return res.status(200).json(new ApiResponse(200, responseData, "Order Created Successfully"))
    } catch (error) {
        return res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const ConfirmOrder = Asynchandler(async (req, res) => {
    try {
        const { paymentmethod } = req.body;
        const { orderId } = req.params;
        const userId = req.user?.id;
        if (!paymentmethod) {
            throw new ApiError(400, "Choose payment method!!")
        }
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        if (!orderId) {
            throw new ApiError(400, "Provide OrderID to track the order!!");
        }

        const ExistOrder = await Order.findOne({
            userid: userId,
            _id: orderId
        })
        if (!ExistOrder) {
            throw new ApiError(404, "Order Not Exist!!")
        }
        ExistOrder.paymentmethod = paymentmethod;
        await ExistOrder.save({ validateBeforeSave: false })

        return res.status(200)
            .json(
                new ApiResponse(200, ExistOrder, "order confirmed")
            )
    } catch (error) {
        return res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})
const TrackOrder = Asynchandler(async (req, res) => {
    try {
        const { orderId } = req.body
        const userId = req.user?._id
        //?send name, phone, total address, pickupTime,deliveryTime,orderId,paymetmethod,{itemname,totalitem} to the user
        //!calculate the price of total item on basis of totalitems of itemname

        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        if (!orderId) {
            throw new ApiError(400, "Provide OrderID to track the order!!");
        }
        const order = await Order.findOne({
            $and: [
                { orderId: orderId },
                { userid: userId },
                { orderCompleted: true }
            ]
        })

        if (!order) {
            throw new ApiError(404, "Invalid orderID !! order not found")
        }
        const orderitemDetails = await Orderitem.findOne({
            $and: [
                { userid: userId },
                { orderid: order?._id }
            ]
        })

        if (!orderitemDetails) {
            throw new ApiError(404, "Invalid order Details !! orderItem not found")
        }

        return res.status(200)
            .json(
                new ApiResponse(200, { order, orderitemDetails }, "Order Details Fetched Successfully")
            )
    } catch (error) {
        return res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const CanceleOrder = Asynchandler(async (req, res) => {
    try {
        const { orderId, cancellationReason } = req.body;
        const { orderSchemaId } = req.params;
        const userId = req.user?._id;
        //!if role of userId is user and userId, orderId both are in ordermodel then update the status
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        if (!isValidObjectId(orderSchemaId)) {
            throw new ApiError(400, "Unauthorized ! Invalid orderSchemaId")
        }
        const userRole = await User.findById(userId);
        if (userRole && userRole.role !== "user") {
            throw new ApiError(403, "Admin not allowed to cancel the order")
        }
        if (!orderId) {
            throw new ApiError(400, "orderId is required to cancel the order")
        }
        if (!cancellationReason) {
            throw new ApiError(400, "Give some cancellation Message")
        }

        const order = await Order.findOneAndUpdate(
            {
                $and: [
                    { _id: orderSchemaId },
                    { orderId: orderId },
                    { userid: userId },
                    { orderCompleted: true }
                ]
            },
            {
                $set: {
                    status: "canceled",
                    cancellationReason: cancellationReason
                }
            },
            {
                new: true
            }
        )
        if (!order) {
            throw new ApiError(404, "order not found!! or Failled to update")
        }

        return res.status(200)
            .json(
                new ApiResponse(200, order, "order Canceled successfully")
            )

    } catch (error) {
        return res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Updatepickuptime = Asynchandler(async (req, res) => {
    try {
        const { orderId, pickupTime } = req.body;
        const userId = req.user?._id;
        const { orderSchemaId } = req.params;
        //!if userId is admin then only update pickupTime

        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        if (!isValidObjectId(orderSchemaId)) {
            throw new ApiError(400, "Unauthorized ! Invalid orderSchemaId")
        }

        const userRole = await User.findById(userId);
        if (userRole && userRole.role !== "admin") {
            throw new ApiError(403, "Only Admin can update the pickup time")
        }
        if (!orderId) {
            throw new ApiError(400, "orderId is required to update pickup time")
        }
        if (!pickupTime) {
            throw new ApiError(400, "pickupTime is required")
        }

        const parsedPickup = new Date(pickupTime);
        if (isNaN(parsedPickup.getTime())) {
            throw new ApiError(400, "Invalid pickupTime format")
        }
        if (parsedPickup.getTime() < Date.now()) {
            throw new ApiError(400, "pickupTime must be in the future")
        }

        // Read current order to validate against deliveryTime
        const existingOrder = await Order.findOne({
            $and: [
                { _id: orderSchemaId },
                { orderId: orderId },
                { orderCompleted: true }
            ]
        });
        if (!existingOrder) {
            throw new ApiError(404, "order not found!! or Failed to fetch order")
        }

        let newPickupTime = parsedPickup;
        let newDeliveryTime = existingOrder.deliveryTime;

        // Ensure deliveryTime stays after pickupTime; if not, shift deliveryTime to +50h from pickup
        if (!newDeliveryTime || new Date(newDeliveryTime).getTime() <= newPickupTime.getTime()) {
            newDeliveryTime = new Date(newPickupTime.getTime() + 50 * 60 * 60 * 1000);
        }

        const updatedOrder = await Order.findOneAndUpdate(
            {
                $and: [
                    { _id: orderSchemaId },
                    { orderId: orderId },
                    { userid: userId },
                    { orderCompleted: true }
                ]
            },
            {
                $set: {
                    pickupTime: newPickupTime,
                    deliveryTime: newDeliveryTime
                }
            },
            {
                new: true
            }
        )

        if (!updatedOrder) {
            throw new ApiError(400, "Pickup time update Failed or Order not found!!")
        }

        return res.status(200)
            .json(
                new ApiResponse(200, updatedOrder, "Pickup time updated successfully")
            )
    } catch (error) {
        return res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Updatedeliverytime = Asynchandler(async (req, res) => {
    try {
        const { orderId, deliveryTime } = req.body
        const userId = req.user?._id
        const { orderSchemaId } = req.params
        //!if userId is admin then only update picktime

        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        if (!isValidObjectId(orderSchemaId)) {
            throw new ApiError(400, "Unauthorized ! Invalid orderSchemaId")
        }

        const userRole = await User.findById(userId);
        if (userRole && userRole.role !== "admin") {
            throw new ApiError(403, "Only Admin can update the delivery time")
        }
        if (!orderId) {
            throw new ApiError(400, "orderId is required to update delivery time")
        }
        if (!deliveryTime) {
            throw new ApiError(400, "deliveryTime is required")
        }

        const parsedDelivery = new Date(deliveryTime);
        if (isNaN(parsedDelivery.getTime())) {
            throw new ApiError(400, "Invalid deliveryTime format")
        }
        if (parsedDelivery.getTime() < Date.now()) {
            throw new ApiError(400, "deliveryTime must be in the future")
        }

        // Read current order to validate against pickupTime
        const existingOrder = await Order.findOne({
            $and: [
                { _id: orderSchemaId },
                { orderId: orderId },
                { orderCompleted: true }
            ]
        });
        if (!existingOrder) {
            throw new ApiError(404, "order not found!! or Failed to fetch order")
        }

        const currentPickup = new Date(existingOrder.pickupTime);
        if (parsedDelivery.getTime() <= currentPickup.getTime()) {
            throw new ApiError(400, "deliveryTime must be after pickupTime")
        }

        const updatedOrder = await Order.findOneAndUpdate(
            {
                $and: [
                    { _id: orderSchemaId },
                    { orderId: orderId },
                    { userid: userId }
                ]
            },
            {
                $set: {
                    deliveryTime: parsedDelivery
                }
            },
            {
                new: true
            }
        )

        if (!updatedOrder) {
            throw new ApiError(400, "Delivery time update Failed or Order not found!!")
        }

        return res.status(200)
            .json(
                new ApiResponse(200, updatedOrder, "Delivery time updated successfully")
            )
    } catch (error) {
        return res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Updatestatus = Asynchandler(async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const userId = req.user?._id;
        const { orderSchemaId } = req.params;
        //! if userId is admin then only update status
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        if (!isValidObjectId(orderSchemaId)) {
            throw new ApiError(400, "Unauthorized ! Invalid orderSchemaId")
        }

        const userRole = await User.findById(userId);
        if (userRole && userRole.role !== "admin") {
            throw new ApiResponse(403, "Only Admin can update the status")
        }
        if (!orderId) {
            throw new ApiError(400, "orderId is required to cancel the order")
        }

        if (status === "pending" || status === "picked" || status === "washed" || status === "delivered") {
            const updatedOrder = await Order.findOneAndUpdate(
                {
                    $and: [
                        { _id: orderSchemaId },
                        { orderId: orderId },
                        { userid: userId },
                        { orderCompleted: true }
                    ]
                },
                {
                    $set: {
                        status: status
                    }
                }
            )

            if (!updatedOrder) {
                throw new ApiError(400, "Status update Failled or Order not found!!")
            }
            return res.status(200)
                .json(
                    new ApiResponse(200, updatedOrder, "Status update Successfully")
                )
        } else {
            throw new ApiError(400, "Provide Valid Status")
        }


    } catch (error) {
        return res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})
const GetOneOrder = Asynchandler(async (req, res) => {
    try {
         const userId = req.user?._id;
        const { orderSchemaId } = req.params;
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        if (!isValidObjectId(orderSchemaId)) {
            throw new ApiError(400, "Unauthorized ! Invalid orderSchemaId")
        }
        const order = await Order.findOne({
            _id:orderSchemaId,
            userid:userId
        })
        if(!order){
            throw new ApiError(404,"Order Not Found")
        }
        return res.status(200)
        .json(
            new ApiResponse(200,order,"Order fetched successfuly")
        )

    } catch (error) {
        return res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})
export {
    Createorder,
    ConfirmOrder,
    TrackOrder,
    CanceleOrder,
    Updatedeliverytime,
    Updatepickuptime,
    Updatestatus,
    GetOneOrder
}