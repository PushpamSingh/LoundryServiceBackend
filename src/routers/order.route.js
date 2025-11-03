import express from 'express'
import {VerifyJWT} from '../middlewares/auth.middlewares.js'
import { CanceleOrder, ConfirmOrder, Createorder, GetOneOrder, TrackOrder, Updatedeliverytime, Updatepickuptime, Updatestatus } from '../controllers/order.controller.js'
const router=express.Router()

router.route('/createorder').post(VerifyJWT,Createorder)
router.route('/confirmorder/:orderId').put(VerifyJWT,ConfirmOrder)
router.route('/trackorder').get(VerifyJWT,TrackOrder)
router.route('/canceleorder/:orderSchemaId').delete(VerifyJWT,CanceleOrder)
router.route('/updatepickuptime/:orderSchemaId').put(VerifyJWT,Updatepickuptime)
router.route('/updatedeliverytime/:orderSchemaId').put(VerifyJWT,Updatedeliverytime)
router.route('/updatestatus/:orderSchemaId').put(VerifyJWT,Updatestatus)
router.route('/getoneorder/:orderSchemaId').get(VerifyJWT,GetOneOrder)  

export default router