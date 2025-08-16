import { Asynchandler } from "../utils/Asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";

const generateAccessAndRefreshToken = async function (userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "Unauthorized ! user not found")
        }
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshtoken = refreshToken;
        user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw error;
    }
}
const Registeruser = Asynchandler(async (req, res) => {
    try {
        const { fullName, email, phone, role, password } = req.body
        if ([fullName, email, phone, role, password].some((data) => data === "")) {
            throw new ApiError(404, "Fields are empty")
        }
        const avatar = req.file;
        if (!avatar) {
            throw new ApiError(404, "Image not found")
        }
        //Existing user
        const existedUser = await User.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        })
        if (existedUser) {
            throw new ApiError(409, "user already exist")
        }
        if (password.length < 6) {
            throw new ApiError(400, "password must be at least 6 characters")
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Please enter valid emailID")
        }
        const uploadOnCLoudinary = uploadCloudinary(avatar)
        if (!uploadOnCLoudinary) {
            throw new ApiError(400, "Cloudinary error ! image not uploaded")
        }

        const user = await User.create({
            fullName,
            email,
            phone,
            avatar: uploadOnCLoudinary?.url,
            role,
            password
        })
        await user.save({ validateBeforeSave: false })

        if (!user) {
            throw new ApiError(400, "User not created")
        }
        const CreatedUser = await User.findById(user?._id)
        if (!CreatedUser) {
            throw new ApiError(404, "user not found")
        }
        return res.status(200).json(
            new ApiResponse(200, CreatedUser, "user created successfully")
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
        if ([email, phone, password].some((data) => data === "")) {
            throw new ApiError(404, "email or password cannot be empty")
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Please enter valid emailID");
        }

        const user = await User.findOne({
            $or: [{ email, phone }]
        })

        if (!user) {
            throw new ApiError(401, "Invalid phone number or email");
        }

        if (password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters");
        }

        const isPasswordMatch = await user.ComparePassword(password);
        if (!isPasswordMatch) {
            throw new ApiError(401, "Incorrect Password!")
        }

        const { accessToken, refreshToken } = generateAccessAndRefreshToken(user?._id)
        const options = {
            httpOnly: true,
            secure: true,
            samesite: "None",
            path: '/'
        }
        res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { user, accessToken, refreshToken },
                    "User Logged in successfuly"
                )
            )

    } catch (error) {
        res.status(500).json(
            new ApiError(500, error?.message)
        )
    }
})

const Logoutuser = Asynchandler(async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }

        const LoggedOutUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    refreshToken: null
                }
            },
            {
                new: true
            }
        );
        if (!LoggedOutUser) {
            throw new ApiError(403, "Logout Failled")
        }
        const options = {
            httpOnly: true,
            secure: true,
            samesite: "None",
            path: '/'
        }
        return res.status(200)
            .cookie("accessToken", options)
            .cookie("refreshToken", options)
            .json(
                new ApiResponse(200, LoggedOutUser, "Logout Successfully")
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
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        const CurrentUser = await User.findById(userId);
        if (!CurrentUser) {
            throw new ApiError(404, "User not exist")
        }
        return res.status(200).json(
            new ApiResponse(200, CurrentUser, "Found Current User")
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
        if (!(oldPassword || newPassord)) {
            throw new ApiError(400, "input fields must not be empty")
        }
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "user not found")
        }

        const isPasswordMatch = await user.ComparePassword(oldPassword)
        if (!isPasswordMatch) {
            throw new ApiError(403, "Unauthorize ! you entered wrong oldPassword")
        }

        if (password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters");
        }
        const updatedPassword = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    password: newPassord
                }
            },
            {
                new: true
            }
        );
        if (!updatedPassword) {
            throw new ApiError(400, "password updated failled")
        }

        return res.status(200).json(
            new ApiResponse(200, updatedPassword, "Password updated Successfully")
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
        if (!avatar) {
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

        if ([fullName, email, phone].some((data) => data === "")) {
            throw new ApiError(404, "Input fields must not be empty");
        }

        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Unauthorized ! Invalid userId")
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    fullName,
                    email,
                    phone
                }
            },
            { new: true },
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