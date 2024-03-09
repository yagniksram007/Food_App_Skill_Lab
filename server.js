const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const foodRoutes = require('./routes/foodRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
mongoose.connect('mongodb://0.0.0.0:27017/Food', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
});

// Define Mongoose Schema for Orders
const orderSchema = new mongoose.Schema({
  userId: String,
  status: String,
  otp: String,
});

// Middleware
app.use(bodyParser.json());

// Routes
app.post('/placeOrder', async (req, res) => {
  try {
    // Assuming you have a user ID in the request
    const { userId } = req.body;

    // Place order in the database
    const order = new Order({
      userId,
      status: 'Pending',
      otp: Math.floor(1000 + Math.random() * 9000).toString(), // Generate a random OTP
    });

    await order.save();

    // Send OTP to the user's email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'yagniksram@gmail.com',
        pass: 'password',
      },
    });

    const mailOptions = {
      from: 'yagnik.ci21@hsahyadri.edu.in',
      to: 'yagniksram@example.com', // Replace with the user's email
      subject: 'Order Verification OTP',
      text: `Your OTP for order verification is: ${order.otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Order placed successfully. Check your email for OTP.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/getOrders/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch orders based on user ID
    const orders = await Order.find({ userId });

    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/processPayment', async (req, res) => {
  try {
    const { invoiceId, userId, userName, paymentDetails } = req.body;

    // Process payment logic (replace this with your actual payment gateway integration)

    // Assuming payment is successful, store order in the database
    const order = new Order({
      invoiceId,
      userId,
      userName,
      paymentDetails,
    });

    await order.save();

    res.status(200).json({ message: 'Payment processed successfully. Order stored.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:{PORT}}`);
});