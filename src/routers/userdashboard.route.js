import express from "express";
import { VerifyJWT } from "../middlewares/auth.middlewares.js";
import { DeliveredOrders, PaymentHistory, PendingOrders, PickedOrders, TotalorderStatusCount, WashedOrders } from "../controllers/userdashboard.controller.js";
const router=express.Router()

router.route('/totalorderstatuscount').get(VerifyJWT,TotalorderStatusCount)
router.route('/pendingorders').get(VerifyJWT,PendingOrders)
router.route('/pickedorders').get(VerifyJWT,PickedOrders)
router.route('/washedorders').get(VerifyJWT,WashedOrders)
router.route('/deliveredorders').get(VerifyJWT,DeliveredOrders)
router.route('/paymenthistory').get(VerifyJWT,PaymentHistory)

export default router
