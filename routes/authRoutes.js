import express from 'express';
import {  createUser, sendOTP, verifyOTP, selectShipment, saveLockerSize, fetchLockerDetails} from '../controllers/authController.js';

const router = express.Router();


router.post('/createUser', createUser);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/select-shipment', selectShipment); // New route for selecting shipment type
router.post('/save-locker-size', saveLockerSize); // New route for saving locker size
router.post('/fetch-locker-details', fetchLockerDetails); // New route for fetching locker details





export default router;
