import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, "username is required"]
   },
   phone: {
      type: String,
      required: [true, "phone number is required"],
      trim: true
   },
   area: {
      type: String,
      required: [true, "area name is required"],
   },
   alternatephone: {
      type: String,
      trim: true
   },
   housenumber: {
      type: String,
      required: [true, "house number is required"],
   },
   city: {
      type: String,
      required: [true, "city name is required"]
   },
   state: {
      type: String,
      required: [true, "state name is required"]
   },
   pincode: {
      type: String,
      required: [true, "pincode is required"]
   },
   nearby: {
      type: String,
      required: [true, "nearby is required"]
   },
   pickupTime: {
    type: Date,
    required: true
   },
   deliveryTime:{
      type:Date,
      required:true
   },
   userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   orderId: {
      type: String,
      required: [true, "Generate order ID"],
      unique: true, // Prevent duplicate order IDs
      uppercase: true, // Auto converts to uppercase
      trim: true
   },
   paymetmethod: {
      type: String,
      enum: ['COD', 'Online'],
      default: 'COD',
      required:true
   },
   status:{
      type:String,
      enum:['pending','picked','washed','delivered','canceled'],
      default:'pending',
      required:true
   },
   cancellationReason:{
      type:String,
      default:""
   },
   instructions:{
      type:String
   }
}, { timestamps: true })


orderSchema.pre('save',function(next){
      if(this.isNew){
         this.pickupTime=new Date(Date.now()+60*60*1000)
         this.deliveryTime=new Date(this.pickupTime.getTime()+50*60*60*1000)
         next()
      }
})
export const Order = mongoose.model('Order', orderSchema)