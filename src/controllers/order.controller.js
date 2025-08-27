import { isValidObjectId } from "mongoose";
import { Order, Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Asynchandler } from "../utils/Asynchandler.js";
import { User } from "../models/user.model.js";
import { Orderitem } from "../models/orderitems.model.js";

const Placeorder = Asynchandler(async (req, res) => {
    try {
        const { orderitem, name, phone, area, alternatephone, housenumber,
            city, state, pincode, nearby, paymetmethod, instructions } = req.body;
        const userId = req.user?._id;
        //!Generate OrderID (ORD-001)
        //?calculate price of a item from orderitem and create new document for orderitem

        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        if ([orderitem, name, phone, area, alternatephone, housenumber,
            city, state, pincode, nearby, paymetmethod].some((field) => field === "")) {
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
            paymetmethod: paymetmethod,
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

        return res.status(200)
            .json(
                new ApiResponse(200, { order, createdOrderitem }, "Order Placed Successfully")
            )
    } catch (error) {
        res.status(500).json(
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
                { userid: userId }
            ]
        }).select("-userid -cancellationReason")

        if (!order) {
            throw new ApiError(404, "Invalid orderID !! order not found")
        }
        const orderitemDetails = await Orderitem.findOne({
            $and: [
                { userid: userId },
                { orderid: order?._id }
            ]
        }).select("-userid -orderid")

        if (!orderitemDetails) {
            throw new ApiError(404, "Invalid order Details !! orderItem not found")
        }

        return res.status(200)
            .json(
                new ApiResponse(200, { order, orderitemDetails }, "Order Details Fetched Successfully")
            )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const CanceleOrder = Asynchandler(async (req, res) => {
    try {
        const { orderId, cancellationReason } = req.body;
        const orderSchemaId = req.param;
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
                    { userid: userId }
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
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Updatepickuptime = Asynchandler(async (req, res) => {
    try {
        const { pickupTime } = req.body;
        const userId = req.user?._id;
        //!if userId is admin then only update pickupTime
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Updatedeliverytime = Asynchandler(async (req, res) => {
    try {
        const { deliveryTime } = req.body
        const userId = req.user?._id
        //!if userId is admin then only update picktime


    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Updatestatus = Asynchandler(async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const userId = req.user?._id;
        const orderSchemaId = req.param;
        //! if userId is admin then only update status
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        if (!isValidObjectId(orderSchemaId)) {
            throw new ApiError(400, "Unauthorized ! Invalid orderSchemaId")
        }

        const userRole=await User.findById(userId);
        if(userRole && userRole.role!=="admin"){
            throw new ApiResponse(403,"Only Admin can update the status")
        }
        if (!orderId) {
            throw new ApiError(400, "orderId is required to cancel the order")
        }

       if(status==="pending" || status==="picked" || status==="washed" || status==="delivered"){
         const updatedOrder=await Order.findOneAndUpdate(
            {
                $and:[
                    {_id:orderSchemaId},
                    {orderId:orderId},
                    {userid:userId}
                ]
            },
            {
                $set:{
                    status:status
                }
            }
        )

        if(!updatedOrder){
            throw new ApiError(400,"Status update Failled or Order not found!!")
        }
        return res.status(200)
        .json(
            new ApiResponse(200,updatedOrder,"Status update Successfully")
        )
       }else{
            throw new ApiError(400,"Provide Valid Status")
       }


    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

export {
    Placeorder,
    TrackOrder,
    CanceleOrder,
    Updatedeliverytime,
    Updatepickuptime,
    Updatestatus
}