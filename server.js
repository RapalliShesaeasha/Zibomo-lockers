import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/userModel.js';  // Make sure this is correctly imported
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';  // Make sure this is correctly imported
import mongoose from 'mongoose';  // Import mongoose here


dotenv.config();
connectDB();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', authRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'The server is running and this is a test route!' });
});

// New route to receive transactionId and payment status
app.post('/payment-status', async (req, res) => {
  const { transactionId, transactionOrderId, paymentStatus } = req.body;

  if (!transactionId || !transactionOrderId || !paymentStatus) {
    console.log("Invalid data received: ", req.body);
    return res.status(400).json({ message: 'Invalid data received' });
  }

  console.log(`Received payment status update: Transaction ID - ${transactionId}, Order ID - ${transactionOrderId}, Status - ${paymentStatus}`);

  try {
    // Use mongoose to validate and convert transactionOrderId to ObjectId
    const objectId = mongoose.Types.ObjectId(transactionOrderId);

    // Find the user and update the paymentStatus
    const user = await User.findOneAndUpdate(
      { _id: objectId },  // Use _id for MongoDB matching
      { paymentStatus: paymentStatus },  // Update the paymentStatus
      { new: true }  // Return the updated user
    );

    if (user) {
      console.log('Transaction status updated for user:', user);
      return res.status(200).json({ message: 'Payment status updated successfully' });
    } else {
      console.log('User not found for the given transactionOrderId.');
      return res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    // Log detailed error
    console.error('Error updating payment status:', error);
    return res.status(500).json({ message: 'Error saving payment status', error: error.message });
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
