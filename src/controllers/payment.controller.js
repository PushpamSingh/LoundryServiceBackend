import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Order } from "../models/order.model.js";
import { Receipt } from "../models/receipt.model.js";
import { User } from "../models/user.model.js";
import Razorpay from "razorpay";
import { isValidObjectId } from "mongoose";
import { Orderitem } from "../models/orderitems.model.js";
import dotenv from "dotenv"
import { ApiResponse } from "../utils/ApiResponse.js";
dotenv.config()
const Razorpay_Instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET
})
const CreateRZPorder = Asynchandler(async (req, res) => {
  try {
    const { order_id } = req.body;
    const userId = req.user?._id
    if (!order_id) {
      throw new ApiError(403, "Invalid Order ID! Cannot create order")
    }
    if (!isValidObjectId(userId)) {
      throw new ApiError(401, "UnAuthorized !! Invalid user ID")
    }
    const ExistOrder = await Order.findOne({
      $and: [
        { _id: order_id },
        { userid: userId }
      ]
    })
    if (!ExistOrder) {
      throw new ApiError(404, "Order Not Found!!")
    }

    const ExistOrderItem = await Orderitem.findOne({
      $and: [
        { orderid: ExistOrder?.orderId },
        { userid: userId }
      ]
    })
    if (!ExistOrderItem) {
      throw new ApiError(404, "OrderItems not Found!!")
    }
    const date = Date.now()

    const receipt = await Receipt.create({
      name: ExistOrder.name,
      orderId: ExistOrder.orderId,
      amount: ExistOrderItem.totalprice,
      userid: userId,
      date: date
    })
    const Option = {
      amount: ExistOrderItem.totalprice * 100,
      currency: process.env.CURRENCY,
      receipt: receipt?._id

    }

    const order = await Razorpay_Instance.orders.create(Option)
    return res.status(200)
      .json(
        new ApiResponse(200, order)
      )
  } catch (error) {
    return res.status(500).json(
      new ApiError(500, error?.message)
    )
  }
})

const VerifyRazorpay = Asynchandler(async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;
    if (!(razorpay_order_id || razorpay_payment_id)) {
      throw new ApiError(400, "Missing required payment details")
    }
    const orderInfo = await Razorpay_Instance.orders.fetch(razorpay_order_id);
    console.log("Order info: ", orderInfo);

    if (orderInfo?.status == 'paid') {
      const UserReceipt = await Receipt.findById(orderInfo?.receipt)

      if (UserReceipt.payment) {
        throw new ApiError(409, "Payment Failed!!")
      }
      const order = await Order.findByIdAndUpdate(
        {
          $and: [
            { orderId: UserReceipt?.orderId },
            { userid: UserReceipt?.userid }
          ]
        },
        {
          $set: {
            orderCompleted: true,
            paymentmethod:'Online'
          }
        },
        {
          new: true
        }
      )

      if (!order) {
        throw new ApiError(400, "Payment is not updated yet")
      }

      UserReceipt.payment = true
      UserReceipt.paymentId = razorpay_payment_id
      UserReceipt.save({ validateBeforeSave: false })

      return res.status(200).json(
        new ApiResponse(200, {
          message: "Payment verified successfully",
          paymentId: razorpay_payment_id,
          orderId: UserReceipt.orderId
        })
      );


    } else {
      return res.status(500)
        .json(
          new ApiError(500, "Payment Failed")
        )
    }

  } catch (error) {
    return res.status(500).json(
      new ApiError(500, error?.message)
    )
  }
})

export{
  CreateRZPorder,
  VerifyRazorpay
}