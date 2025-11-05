import express from 'express'
import { ChangePassword, GetCurrentuser, Loginuser, Logoutuser, OnboardUser, Registeruser, UpdateUserDetails, UploadAvatar } from '../controllers/user.controller.js'
import {VerifyJWT} from "../middlewares/auth.middlewares.js"
import {upload} from "../middlewares/multer.middleware.js"
const router=express.Router()

router.route('/register').post(Registeruser)
router.route('/login').post(Loginuser)
router.route('/logout').post(VerifyJWT,Logoutuser)
router.route('/onboarduser').put(VerifyJWT,OnboardUser)
router.route('/getcurrentuser').get(VerifyJWT,GetCurrentuser)
router.route('/changepassword').put(VerifyJWT,ChangePassword)
router.route('/uploadavatar').put(
    VerifyJWT,
    upload.single('avatar')
    ,UploadAvatar
)
router.route('/updateuser').put(VerifyJWT,UpdateUserDetails)

export default router