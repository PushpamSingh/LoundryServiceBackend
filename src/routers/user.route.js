import express from 'express'
import { ChangePassword, GetCurrentuser, Loginuser, Logoutuser, Registeruser, UpdateUserDetails, UploadAvatar } from '../controllers/user.conroller.js'
import {VerifyJWT} from "../middlewares/auth.middlewares.js"
import {upload} from "../middlewares/multer.middleware.js"
const router=express.Router()

router.route('/register').post(Registeruser)
router.route('/login').post(Loginuser)
router.route('/logout').post(VerifyJWT,Logoutuser)
router.route('/getcurrentuser').get(VerifyJWT,GetCurrentuser)
router.route('/changepassword').put(VerifyJWT,ChangePassword)
router.route('/uploadavatar').put(
    VerifyJWT,
    upload.single('avatar')
    ,UploadAvatar
)
router.route('/updateuser').put(VerifyJWT,UpdateUserDetails)

export default router