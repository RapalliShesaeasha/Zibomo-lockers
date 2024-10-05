import axios from 'axios';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

// Function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};

// Send OTP
export const sendOTP = async (req, res) => {
  const { mobile } = req.body; // Extract mobile number from the request body

  const otp = generateOTP(); // Generate a new OTP
  const user = await User.findOneAndUpdate(
    { mobile }, // Use the mobile number to find the user
    { otp, isVerified: false }, // Update OTP and set isVerified to false
    { upsert: true, new: true } // Create user if not exists
  );

  // Construct the message to send via SMS
  const message = Your OTP for login to Zibomo Sprint Safe is ${otp}%0APlease do not share this OTP with anyone.%0ARegards,%0AAppprotech.; // Use %0A for new lines

  const data = new URLSearchParams({
    apiKey: process.env.TEXTLOCAL_API_KEY, // Your TextLocal API Key
    numbers: mobile, // Recipient's mobile number
    message, // SMS message
    sender: process.env.TEXTLOCAL_SENDER, // Sender ID
  }).toString();

  try {
    // Send the SMS request to TextLocal API
    await axios.post('https://api.textlocal.in/send/', data, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // Set content type
    });
    return res.status(200).json({ message: 'OTP sent successfully', user });
  } catch (error) {
    console.error('Failed to send OTP:', error); // Log the error for debugging
    return res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body; // Extract mobile and OTP from request body
  const user = await User.findOne({ mobile }); // Find user by mobile number

  if (user && user.otp === otp) { // Check if user exists and OTP matches
    user.isVerified = true; // Set user as verified
    await user.save(); // Save updated user data

    // Send user's mobile number along with the response
    return res.status(200).json({
      message: 'OTP verified successfully',
      user: {
        mobile: user.mobile,
        isVerified: user.isVerified
      }
    });
  }

  return res.status(400).json({ message: 'Invalid OTP' }); // Handle invalid OTP case
};

// Updated selectShipment function to handle the receiver mobile number
export const selectShipment = async (req, res) => {
  const { mobile, shipmentType, receiverMobile, sameAsSender } = req.body;
  const user = await User.findOne({ mobile });

  if (!user || !user.isVerified) {
    return res.status(400).json({ message: 'User not verified or does not exist' });
  }

  // If sameAsSender is true, set receiverMobile to mobile
  if (sameAsSender) {
    user.receiverMobile = mobile;
  } else if (receiverMobile) {
    // Otherwise, use the provided receiver mobile number
    user.receiverMobile = receiverMobile;
  }

  user.shipmentType = shipmentType;
  await user.save();

  return res.status(200).json({ 
    message: `Shipment type '${shipmentType}' and receiver mobile updated successfully`,
    receiverMobile: user.receiverMobile 
  });
};

// Save Locker Size
export const saveLockerSize = async (req, res) => {
  const { mobile, lockerSize } = req.body;

  const user = await User.findOne({ mobile });
  if (!user || !user.isVerified) {
    return res.status(400).json({ message: 'User not verified or does not exist' });
  }

  let lockerPrice;
  if (lockerSize === 'MEDIUM 5X5') {
    lockerPrice = 30;
  } else if (lockerSize === 'LARGE 7X7') {
    lockerPrice = 50;
  } else {
    return res.status(400).json({ message: 'Invalid locker size' });
  }

  user.lockerSize = lockerSize;
  user.lockerPrice = lockerPrice;
  await user.save();

  return res.status(200).json({
    message: `Locker size '${lockerSize}' with price ${lockerPrice} Rs/day saved successfully`,
    user: { mobile: user.mobile, lockerSize: user.lockerSize, lockerPrice: user.lockerPrice },
  });
};

// Fetch Locker Details
export const fetchLockerDetails = async (req, res) => {
  const { mobile } = req.body;

  const user = await User.findOne({ mobile });

  if (!user || !user.isVerified) {
    return res.status(400).json({ message: 'User not verified or does not exist' });
  }

  return res.status(200).json({
    message: 'Details fetched successfully',
    lockerSize: user.lockerSize,
    receiverMobile: user.receiverMobile,
    senderMobile: user.mobile,
    lockerPrice: user.lockerPrice, // Return the locker price

  });
};


