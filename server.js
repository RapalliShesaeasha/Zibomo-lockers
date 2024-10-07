import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/userModel.js';  // Make sure this is correctly imported
import bodyParser from 'body-parser';

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
  const { transactionId, paymentStatus } = req.body;

  if (!transactionId || !paymentStatus) {
    console.log("Invalid data received: ", req.body);
    return res.status(400).json({ message: 'Invalid data received' });
  }

  console.log(`Received payment status update: Transaction ID - ${transactionId}, Status - ${paymentStatus}`);

  // Save transactionId and paymentStatus to the database
  try {
    // Find the user with the corresponding transactionId
    const user = await User.findOneAndUpdate(
      { transactionId: transactionId }, // Search by transactionId
      { paymentStatus: paymentStatus }, // Update the paymentStatus
      { new: true, upsert: true } // Create new entry if not found
    );

    if (user) {
      console.log('Transaction status saved to database:', user);
      return res.status(200).json({ message: 'Payment status updated successfully' });
    } else {
      console.log('Transaction not found, but status was saved.');
      return res.status(404).json({ message: 'User not found, but transaction status was saved.' });
    }
  } catch (error) {
    console.error('Error saving payment status to the database:', error.message);
    return res.status(500).json({ message: 'Error saving payment status' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
