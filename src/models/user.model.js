import mongoose from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken" ;
import dotenv from  "dotenv"
dotenv.config()

const userSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:[true,"full name is required"]
    },
    email:{
        type:String,
        required:[true,"email is required"],
        unique:true,
        lowercase:true,
        trim:true
    },
    phone:{
        type:String,
        required:[true,"phone number is required"],
        unique:true,
        lowercase:true,
        trim:true
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    onboarded:{
        type:Boolean,
        default:false
    },
    password:{
        type:String,
        required:[true,"password is required"],
        minlength:[6,"password must be at least 6 charachter"],
        trim:true
    },
    avatar:{
        type:String,//?image url uploaded on cloudinary 
    },
    refreshtoken:{
        type:String
    }

},{timestamps:true})

userSchema.pre('save',async function(next){
    const user=this;
    if(!this.isModified('password'))return next()
    try {
        const salt=await bcrypt.genSalt(10)
        const hashPass=await bcrypt.hash(user.password,salt);
        user.password=hashPass;
        return next()
    } catch (error) {
        next(error)
        throw error
    }
})

userSchema.methods.ComparePassword=async function(userPassword) {
    try {
        const isMatch=await bcrypt.compare(userPassword,this.password)
        return isMatch;
    } catch (error) {
        throw error;
    }
}

userSchema.methods.generateAccessToken=async function() {
  return await JWT.sign(
        {
            _id:this._id,
            fullName:this.fullName,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=async function() {
    return await JWT.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model('User',userSchema)