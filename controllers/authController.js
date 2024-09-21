import axios from 'axios';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

// Function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Send OTP
export const sendOTP = async (req, res) => {
  const { mobile } = req.body; // Ensure this matches the schema

  const otp = generateOTP();
  const user = await User.findOneAndUpdate(
    { mobile }, // Using mobile correctly
    { otp, isVerified: false },
    { upsert: true, new: true }
  );

  // Updated message with your desired format
  const message = `Your OTP for login to Zibomo Sprint Safe is ${otp}%0APlease do not share this OTP with anyone.%0ARegards,%0AAppprotech.`; // Use %0A for new lines

  const data = new URLSearchParams({
    apiKey: process.env.TEXTLOCAL_API_KEY,
    numbers: mobile,
    message,
    sender: process.env.TEXTLOCAL_SENDER,
  }).toString();

  try {
    await axios.post('https://api.textlocal.in/send/', data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.status(200).json({ message: 'OTP sent successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send OTP', error });
  }
};


// Verify OTP
export const verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body;
  const user = await User.findOne({ mobile });

  if (user && user.otp === otp) {
    user.isVerified = true;
    await user.save();
    return res.status(200).json({ message: 'OTP verified successfully' });
  }
  res.status(400).json({ message: 'Invalid OTP' });
};

// Get user's mobile number
export const getUserMobile = async (req, res) => {
  const { mobile } = req.body; // Expect mobile number in request body
  const user = await User.findOne({ mobile });

  if (user) {
    return res.status(200).json({ mobile: user.mobile });
  }

  return res.status(404).json({ message: 'User not found' });
};

// Update selectShipment method
export const selectShipment = async (req, res) => {
  const { mobile, shipmentType, useSenderMobile, receiverMobile } = req.body;
  const user = await User.findOne({ mobile });

  if (!user || !user.isVerified) {
    return res.status(400).json({ message: 'User not verified or does not exist' });
  }

  // If checkbox is selected, use sender's mobile
  if (useSenderMobile) {
    user.receiverMobile = user.mobile; // Set receiver mobile to sender's mobile
  } else {
    user.receiverMobile = receiverMobile; // Otherwise, set to the provided receiver mobile
  }

  user.shipmentType = shipmentType;
  await user.save();

  return res.status(200).json({ message: `Shipment type '${shipmentType}' selected successfully` });
};

