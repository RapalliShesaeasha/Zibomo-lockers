import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import User from './models/userModel.js';  // Make sure this is correctly imported
import Order from './models/orderModel.js';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';  // Make sure this is correctly imported
import mongoose from 'mongoose';  // Import mongoose here
import crypto from 'crypto'

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
    const objectId = new mongoose.Types.ObjectId(transactionOrderId);
    // Find the user and update the paymentStatus
    const order = await Order.findOneAndUpdate(
      { _id: objectId },  // Use _id for MongoDB matching
      { paymentStatus: paymentStatus },  // Update the paymentStatus
      { new: true }  // Return the updated user
    );
    if (order) {
      console.log('Transaction status updated for order:', order);
      return res.status(200).json({ message: 'Payment status updated successfully' });
    } else {
      console.log('Order not found for the given transactionOrderId.');
      return res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    // Log detailed error
    console.error('Error updating payment status:', error);
    return res.status(500).json({ message: 'Error saving payment status', error: error.message });
  }
});

app.post('/payment-response-v1', async (req, res) => {
    // Assuming you are sending a JSON body from main.js
    const paymentResponse = req.body;

    if (!paymentResponse || !paymentResponse.legalEntityCode || !paymentResponse.orderId) {
        return res.status(400).send('Invalid payment data received');
    }

    // Log the data received from main.js

    const boxpaySaltKey = process.env.SALT_KEY;
    
    // Extract the 'x-signature' header
    const receivedSignature = req.headers['x-signature'];
    
    // Construct the signature text
    const signatureText = [
        boxpaySaltKey,
        paymentResponse.legalEntityCode,
        paymentResponse.orderId,
        paymentResponse.transactionId,
        paymentResponse.operationId,
        paymentResponse.eventId,
        paymentResponse.countryCode,
        paymentResponse.status.status,
        paymentResponse.money.currencyCode,
        paymentResponse.money.amount
    ].join('');
    
    // Hash the signature text using SHA-256
    const hash = crypto.createHash('sha256');
    const output = hash.update(signatureText, 'utf8').digest();
    
    // Convert the output to a hexadecimal string
    let hashText = output.toString('hex');
    
    // Add preceding 0s to make it 64 characters long (if necessary)
    while (hashText.length < 64) {
        hashText = '0' + hashText;
    }
    
    // Calculated signature
    const calculatedSignature = hashText;
    
    // Log the received signature and the calculated signature for comparison
    console.log('Received Signature:', receivedSignature);
    console.log('Calculated Signature:', calculatedSignature);
    
    // Verify if the signature matches
    if (receivedSignature !== calculatedSignature) {
        console.log('Signature did not match')
        return res.status(403).send('Invalid signature')
    }
    
    // Store paymentResponse in MongoDB
    const transactionId = paymentResponse.transactionId
    const transactionOrderId = paymentResponse.orderId  // Send orderId as transactionOrderId
    const paymentStatus = paymentResponse.status?.status || 'Unknown'
    
    if (!transactionId || !transactionOrderId || !paymentStatus) {
        console.log("Invalid data received: ", req.body);
        return res.status(400).json({ message: 'Invalid data received' });
    }

    console.log(`Received payment status update: Transaction ID - ${ transactionId }, Order ID - ${ transactionOrderId }, Status - ${ paymentStatus }`);
    
    try {
        // Use mongoose to validate and convert transactionOrderId to ObjectId
        const objectId = new mongoose.Types.ObjectId(transactionOrderId);
        // Find the user and update the paymentStatus
        const order = await Order.findOneAndUpdate(
          { _id: objectId },  // Use _id for MongoDB matching
          { paymentStatus: paymentStatus },  // Update the paymentStatus
          { new: true }  // Return the updated user
        );
        
        if (order) {
          console.log('Transaction status updated for order:', order);
          return res.status(200).json({ message: 'Payment status updated successfully' });
        } else {
          console.log('Order not found for the given transactionOrderId.');
          return res.status(404).json({ message: 'Order not found.' });
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
