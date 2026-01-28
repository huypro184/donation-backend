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
const AppError = require('./utils/AppError');

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
    const query = req.query;
    let isSuccess = false;
    let orderId = '';
    let message = '';

    // 1. Kiểm tra xem là MoMo hay VNPay
    if (query.partnerCode === 'MOMO') {
        // --- XỬ LÝ MOMO ---
        isSuccess = query.resultCode == '0';
        orderId = query.orderId;
        message = query.message || (isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại');
    } 
    else if (query.vnp_TmnCode) {
        // --- XỬ LÝ VNPAY ---
        isSuccess = query.vnp_ResponseCode == '00';
        orderId = query.vnp_TxnRef;
        
        if (isSuccess) {
            message = "Giao dịch thành công qua VNPay";
        } else {
            // Mapping mã lỗi VNPay (nếu cần chi tiết)
            message = "Giao dịch VNPay thất bại hoặc bị hủy";
        }
    }

    // 2. Hiển thị giao diện chung
    if (isSuccess) {
        res.send(`<h1 style="color: green;">${message}</h1><p>Mã đơn hàng: ${orderId}</p>`);
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRouter);
app.use('/api/reports', reportRoutes);
app.use('/api/feedback', feedbackRoutes);

app.all(/(.*)/, (req, res, next) => {
    console.log(`ERROR 404: [${req.method}] ${req.originalUrl}`);
    const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
    next(err);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});