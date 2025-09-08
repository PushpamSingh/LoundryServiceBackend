import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
    },
    orderId: {
      type: String,
      required: [true, "orderId is required"],
      index: true,
    },
    paymentmethod: {
      type: String,
      enum: ["COD", "Online"],
      default: "Online"
    },
    amount: {
      type: Number,
      required: [true, "amount is required"],
      min: [0, "amount must be >= 0"],
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentId: {
      type: String,
      default: "",
    },
    date: {
      type: Number
    },
    payment: {
      type: Boolean,
      default: false
    },
  },
  { timestamps: true }
);

export const Receipt = mongoose.model("Receipt", receiptSchema);


