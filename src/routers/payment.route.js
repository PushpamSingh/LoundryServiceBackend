import express from 'express'
import { VerifyJWT } from '../middlewares/auth.middlewares.js'
import { CreateRZPorder, VerifyRazorpay } from '../controllers/payment.controller.js'

const router=express.Router()

router.route('/createrzporder').post(VerifyJWT,CreateRZPorder)
router.route('/verifyrazorpay').get(VerifyJWT,VerifyRazorpay)

export default router