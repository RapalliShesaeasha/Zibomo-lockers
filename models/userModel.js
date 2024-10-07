import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  otp: { type: String, required: false },
  isVerified: { type: Boolean, default: false },
  shipmentType: { type: String, enum: ['pickup', 'drop'], default: null }, // New field
  receiverMobile: { type: String }, // New field for receiver mobile number
  lockerSize: { type: String, enum: ['MEDIUM 5X5', 'LARGE 7X7'], default: null }, // New field
  lockerPrice: { type: Number, default: null }, // New field to store locker price
  transactionId: { type: String }, // New field for transaction ID
  transactionOrderId: { type: String },
  paymentStatus: { type: String }, // New field for payment status



});

const User = mongoose.model('User', userSchema);

export default User;
