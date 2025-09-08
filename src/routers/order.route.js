import express from 'express'
import {VerifyJWT} from '../middlewares/auth.middlewares.js'
import { CanceleOrder, Createorder, TrackOrder, Updatedeliverytime, Updatepickuptime, Updatestatus } from '../controllers/order.controller.js'
const router=express.Router()

router.route('/createorder').post(VerifyJWT,Createorder)
router.route('/trackorder').get(VerifyJWT,TrackOrder)
router.route('/canceleorder/:orderSchemaId').delete(VerifyJWT,CanceleOrder)
router.route('/updatepickuptime/:orderSchemaId').put(VerifyJWT,Updatepickuptime)
router.route('/updatedeliverytime/:orderSchemaId').put(VerifyJWT,Updatedeliverytime)
router.route('/updatestatus/:orderSchemaId').put(VerifyJWT,Updatestatus)

export default router