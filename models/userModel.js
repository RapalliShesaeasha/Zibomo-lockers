import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // User's name
  mobileNumber: { type: String, required: true }, // User's phone number
  email: { type: String, required: false }, // Optional email field
});

const User = mongoose.model('User', userSchema);

export default User;
