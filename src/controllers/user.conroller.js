import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const generateAccessAndRefreshToken=async function(userId) {
    try {
        const user=await User.findById(userId);
        if(!user){
            throw new ApiError(404,"Unauthorized ! user not found")
        }
        const accessToken=await user.generateAccessToken();
        const refreshToken=await user.generateRefreshToken();
        user.refreshtoken=refreshToken;
        user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        throw error;
    }
}
const Registeruser = Asynchandler(async (req, res) => {
    try {
        const { fullName, email, phone, role, password } = req.body
        if([fullName,email,phone,role,password].some((data)=>data==="")){
            throw new ApiError(404,"Fields are empty")
        }
        const avatar = req.file;
        if(!avatar){
            throw new ApiError(404,"Image not found")
        }
        //Existing user
        const existedUser=await User.findOne({
            $or:[
                {email:email},
                {phone:phone}
            ]
        })
        if(existedUser){
            throw new ApiError(409,"user already exist")
        }
        if(password.length<6){
            throw new ApiError(400,"password must be at least 6 characters")
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            throw new ApiError(400,"Please enter valid emailID")
        }
        const uploadOnCLoudinary=uploadCloudinary(avatar)
        if(!uploadOnCLoudinary){
            throw new ApiError(400,"Cloudinary error ! image not uploaded")
        }

        const user=await User.create({
            fullName,
            email,
            phone,
            avatar:uploadOnCLoudinary?.url,
            role,
            password
        })
        await user.save({validateBeforeSave:false})

        if(!user){
            throw new ApiError(400,"User not created")
        }
        const CreatedUser=await User.findById(user?._id)
        if(!CreatedUser){
            throw new ApiError(404,"user not found")
        }
        return res.status(200).json(
            new ApiResponse(200,CreatedUser,"user created successfully")
        )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Loginuser = Asynchandler(async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        // Check if data is available
        if([email, phone, password].some((data)=>data ==="")){
            throw new ApiError(404, "Please give some input")
        }

        if(password.length<8){
            throw new ApiError(400, "Password must be at least 8 characters");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(email)){
            throw new ApiError(400, "Please enter valid emailID ");
        }

       const user = await User.findOne({
        $or:[{email, phone}]
       })

       if(!user){
        throw new ApiError(404, "User not Found");
       }

        
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Logoutuser = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        const deleteData = await User.findByIdAndUpdate(userId,{$unset:{refreshToken:1}});
        return res.status(200).json(
            new ApiResponse(200,deleteData,"Logout Successfully")
        )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const GetCurrentuser = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        const CurrentUser = await User.findById(userId);
        return res.status(200).json(
           new ApiResponse(200, CurrentUser, "Found Current User" )
        )
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
});

const ChangePassword = Asynchandler(async (req, res) => {
    try {
        const { oldPassword, newPassord } = req.body
        const userId = req.user?._id;

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if(!passwordRegex.test(password)){
            throw new ApiError (400, "The password must contain at least 8 characters One special characters and one Alphabet letter");
        }
        if(oldPassword===newPassord){
            throw new ApiError(404, "Sorry you've entered the same password");
        }
        updatedPassword = await User.findByIdAndUpdate(userId);

        return res.status(200).json(
           new ApiResponse( 200, updatedPassword,"Password updated Successfully")
        );

    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const UpdateAvatar = Asynchandler(async (req, res) => {
    try {
        const avatar = req.file?.avatar[0]
        const userId = req.user?._id
        if(!avatar){
            throw new ApiError(404, "Please upload an Image");
        }
        const updatedAvatar = await User.findByIdAndUpdate(userId);
        return res.status(200).json(
            new ApiResponse(200, updatedAvatar, "Avatar updated Successfully")
        )
        
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const UpdateUserDetails = Asynchandler(async (req, res) => {
    try {
        const { fullName, email, phone } = req.body
        const userId = req.user?._id;

        if([fullName, email, phone].some((data)=> data === " ")){
            throw new ApiError(404, "Provide some data to update");
        }
        
        if([fullName, email, phone].some((data)=> data===req.body)){
            throw new ApiError(404, "Sorry you cannot update the data already exist");
        }

       const updatedUser = await User.findByIdAndUpdate(userId,
        {fullName,email,phone},
        {new:true},
       );
       return res.status(200).json(
       new ApiResponse(200, updatedUser, "Userdetails updated Successfully")
       )
      
    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

export {
    Registeruser,
    Loginuser,  
    Logoutuser,
    GetCurrentuser,
    ChangePassword,
    UpdateAvatar,
    UpdateUserDetails
};