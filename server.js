import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bodyParser from 'body-parser';
import crypto from 'crypto'; 

dotenv.config();
connectDB();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'The server is running and this is a test route!' });
});

// Payment Data Placeholder
/*let paymentData = {};

// API to get credentials for payment
app.get('/api/credentials', (req, res) => {
  res.json({
    API_Key: process.env.API_Key,
    Merchant_Id: process.env.Merchant_Id,
    Business_Unit_Code: process.env.Business_Unit_Code,
  });
});

// Endpoint to handle payment response storage with signature verification
app.post('/api/store-payment-response', async (req, res) => {
  const paymentResponse = req.body;

  if (!paymentResponse || !paymentResponse.legalEntityCode || !paymentResponse.orderId) {
    return res.status(400).send('Invalid payment data received');
  }

  const boxpaySaltKey = process.env.SALT_KEY;
  const receivedSignature = req.headers['x-signature'];

  // Construct signature text
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
    paymentResponse.money.amount,
  ].join('');

  const hash = crypto.createHash('sha256');
  let hashText = hash.update(signatureText, 'utf8').digest('hex');

  while (hashText.length < 64) {
    hashText = '0' + hashText;
  }

  const calculatedSignature = hashText;

  if (receivedSignature !== calculatedSignature) {
    return res.status(403).send('Invalid signature');
  }

  try {
    const db = req.app.locals.db; // Use the connected database from MongoDB
    const collection = db.collection('payments');
    await collection.insertOne(paymentResponse);
    console.log('Payment data stored in MongoDB:', paymentResponse);
    return res.status(200).send('Payment data and signature verified and stored successfully');
  } catch (err) {
    console.error('Error storing payment data in MongoDB:', err);
    return res.status(500).send('Error storing payment data');
  }
});

// Webhook endpoint for payment data handling
app.post('/api/webhook', (req, res) => {
  const paymentResponse = req.body;

  if (!paymentResponse || !paymentResponse.legalEntityCode || !paymentResponse.orderId) {
    return res.status(400).send('Invalid payment data received');
  }

  console.log('Webhook Data received:', paymentResponse);

  const boxpaySaltKey = process.env.SALT_KEY;

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
    paymentResponse.money.amount,
  ].join('');

  const hash = crypto.createHash('sha256');
  let hashText = hash.update(signatureText, 'utf8').digest('hex');

  while (hashText.length < 64) {
    hashText = '0' + hashText;
  }

  const calculatedSignature = hashText;
  const receivedSignature = req.headers['x-signature'];

  console.log('Received Signature:', receivedSignature);
  console.log('Calculated Signature:', calculatedSignature);

  res.status(200).send('Payment data and signature received and stored successfully');
});*/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
