import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  shipmentType: { type: String, enum: ['pickup', 'drop'], default: null }, // New field
  receiverMobile: { type: String, default: null }, // New field for receiver mobile

});

const User = mongoose.model('User', userSchema);

export default User;
