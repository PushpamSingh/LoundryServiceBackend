import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Asynchandler } from "../utils/Asynchandler.js";

const Placeorder = Asynchandler(async (req, res) => {
    try {
        const { orderitem, name, phone, area, alternatephone, housenumber,
            city, state, pincode, nearby, paymetmethod } = req.body;
        const userId = req.user?._id;
        //!Generate OrderID (ORD-001)
        //?calculate price of a item from orderitem and create new document for orderitem
            
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
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const CanceleOrder = Asynchandler(async (req, res) => {
    try {
        const { orderId , cancellationReason} = req.body
        const userId = req.user?._id
        //!if role of userId is user and userId, orderId both are in ordermodel then update the status
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Updatepickuptime = Asynchandler(async (req, res) => {
    try {
        const { pickupTime } = req.body
        const userId = req.user?._id
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
        const { status } = req.body
        const userId = req.user?._id
        //! if userId is admin then only update status


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