import express from 'express';
import { sendOTP, verifyOTP, selectShipment, getUserMobile } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/select-shipment', selectShipment); // New route for selecting shipment type
router.post('/get-user-mobile', getUserMobile);



export default router;
