require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
require('./config/redis');

const authRoutes = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const donationRouter = require('./routes/donationRouter');
const reportRoutes = require('./routes/reportRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

// Middleware
app.use(express.json());

// Route test
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/payment-result', (req, res) => {
    const { resultCode, message, transId } = req.query;
    if (resultCode == '0') {
        res.send(`
            <div style="text-align: center; padding-top: 50px; font-family: sans-serif;">
                <h1 style="color: green;">✅ THANH TOÁN THÀNH CÔNG!</h1>
                <p>Mã giao dịch: <b>${transId}</b></p>
                <a href="/" style="color: blue;">Quay về App</a>
            </div>
        `);
    } else {
        res.send(`
            <div style="text-align: center; padding-top: 50px; font-family: sans-serif;">
                <h1 style="color: red;">❌ THANH TOÁN THẤT BẠI</h1>
                <p>Lý do: ${message}</p>
            </div>
        `);
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRouter);
app.use('/api/reports', reportRoutes);
app.use('/api/feedback', feedbackRoutes);

app.all(/.*/, (req, res) => {
  throw new Error('Route not found');
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});