import express from "express";
import {VerifyJWT} from "../middlewares/auth.middlewares.js"
import { CanceledOrders, DeliveredOrders, PendingOrders, PickedOrders, TotalorderStatusCountandRevenue, WashedOrders } from "../controllers/admindashboard.controller.js";

const router=express.Router()
router.route('/totalorderstatuscountandrevenue').get(VerifyJWT,TotalorderStatusCountandRevenue)
router.route('/pendingorders').get(VerifyJWT,PendingOrders)
router.route('/pickedorders').get(VerifyJWT,PickedOrders)
router.route('/washedorders').get(VerifyJWT,WashedOrders)
router.route('/deliveredorders').get(VerifyJWT,DeliveredOrders)
router.route('/canceledorders').get(VerifyJWT,CanceledOrders)

export default router