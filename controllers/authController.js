import axios from 'axios';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import dotenv from 'dotenv';
dotenv.config();

// Function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
};

// Create User without OTP
export const createUser = async (req, res) => {
  const { name, phone, email } = req.body;

  try {
    // Check if user already exists by name, mobile number, or email
    let user = await User.findOne({ $or: [{ phone }, { email }, { name }] });
    
    if (user) {
      return res.status(200).json({ message: 'User already exists, successful login', user });
    }

    // Create a new user if not found
    user = new User({
      name,
      phone,
      email,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create user', error });
  }
};

// Send OTP
export const sendOTP = async (req, res) => {
  const { mobile } = req.body; // Extract mobile number from the request body

  const otp = generateOTP(); // Generate a new OTP
  const order = await Order.findOneAndUpdate(
    { mobile }, // Use the mobile number to find the order
    { otp, isVerified: false }, // Update OTP and set isVerified to false
    { upsert: true, new: true } // Create order if not exists
  );

  // Construct the message to send via SMS
  const message = `Your OTP for login to Zibomo Sprint Safe is ${otp}%0APlease do not share this OTP with anyone.%0ARegards,%0AAppprotech.`; // Use %0A for new lines

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
    return res.status(200).json({ message: 'OTP sent successfully', order });
  } catch (error) {
    console.error('Failed to send OTP:', error); // Log the error for debugging
    return res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  const { mobile, otp } = req.body; // Extract mobile and OTP from request body
  const order = await Order.findOne({ mobile }); // Find order by mobile number

  if (order && order.otp === otp) { // Check if order exists and OTP matches
    order.isVerified = true; // Set order as verified
    await order.save(); // Save updated order data

    return res.status(200).json({
      message: 'OTP verified successfully',
      order: {
        mobile: order.mobile,
        isVerified: order.isVerified
      }
    });
  }

  return res.status(400).json({ message: 'Invalid OTP' }); // Handle invalid OTP case
};

// Select Shipment
export const selectShipment = async (req, res) => {
  const { mobile, shipmentType, receiverMobile, sameAsSender } = req.body;
  const order = await Order.findOne({ mobile });

  if (!order || !order.isVerified) {
    return res.status(400).json({ message: 'User not verified or order does not exist' });
  }

  // If sameAsSender is true, set receiverMobile to mobile
  if (sameAsSender) {
    order.receiverMobile = mobile;
  } else if (receiverMobile) {
    order.receiverMobile = receiverMobile;
  }

  order.shipmentType = shipmentType;
  await order.save();

  return res.status(200).json({ 
    message: `Shipment type '${shipmentType}' and receiver mobile updated successfully`,
    receiverMobile: order.receiverMobile 
  });
};

// Save Locker Size
export const saveLockerSize = async (req, res) => {
  const { mobile, lockerSize } = req.body;

  const order = await Order.findOne({ mobile });
  if (!order || !order.isVerified) {
    return res.status(400).json({ message: 'User not verified or order does not exist' });
  }

  let lockerPrice;
  if (lockerSize === 'MEDIUM 5X5') {
    lockerPrice = 30;
  } else if (lockerSize === 'LARGE 7X7') {
    lockerPrice = 50;
  } else {
    return res.status(400).json({ message: 'Invalid locker size' });
  }

  order.lockerSize = lockerSize;
  order.lockerPrice = lockerPrice;
  await order.save();

  return res.status(200).json({
    message: `Locker size '${lockerSize}' with price ${lockerPrice} Rs/day saved successfully`,
    order: { mobile: order.mobile, lockerSize: order.lockerSize, lockerPrice: order.lockerPrice },
  });
};

// Fetch Locker Details
export const fetchLockerDetails = async (req, res) => {
  const { mobile } = req.body;

  try {
    // Find the order by mobile number
    const order = await Order.findOne({ mobile });

    // Check if the order exists and is verified
    if (!order || !order.isVerified) {
      return res.status(400).json({ message: 'User not verified or order does not exist' });
    }

    // Find the user by phone number (without country code)
    const user = await User.findOne({ phone: order.mobile.replace('+91', '') });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return order and user details
    return res.status(200).json({
      message: 'Details fetched successfully',
      lockerSize: order.lockerSize,
      receiverMobile: order.receiverMobile,
      senderMobile: order.mobile,
      lockerPrice: order.lockerPrice,
      orderId: order._id,    // Include order ID
      userId: user._id,      // Include user ID
    });
  } catch (error) {
    console.error('Error fetching locker details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
