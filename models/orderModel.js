import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  mobile: { type: String, required: true }, // User's mobile number for the order
  otp: { type: String, required: false }, // OTP for verification
  isVerified: { type: Boolean, default: false }, // Verification status
  shipmentType: { type: String, enum: ['pickup', 'drop'], default: null }, // Shipment type: pickup or drop
  receiverMobile: { type: String }, // Receiver's mobile number
  lockerSize: { type: String, enum: ['MEDIUM 5X5', 'LARGE 7X7'], default: null }, // Locker size
  lockerPrice: { type: Number, default: null }, // Locker price
  transactionId: { type: String }, // Transaction ID for payment
  transactionOrderId: { type: String }, // Order ID for the transaction
  paymentStatus: { type: String }, // Status of the payment
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
