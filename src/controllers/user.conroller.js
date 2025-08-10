import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js"
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

    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Loginuser = Asynchandler(async (req, res) => {
    try {
        const { email, phone } = req.body

    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Logoutuser = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id

    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const GetCurrentuser = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id

    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const ChangePassword = Asynchandler(async (req, res) => {
    try {
        const { oldPassword, newPassord } = req.body
        const userId = req.user?._id

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

    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const UpdateUserDetails = Asynchandler(async (req, res) => {
    try {
        const { fullName, email, phone } = req.body
        const userId = req.user?._id

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
}