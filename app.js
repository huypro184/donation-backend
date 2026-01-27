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
        res.send(`
            <div style="text-align: center; padding-top: 50px; font-family: Arial, sans-serif;">
                <h1 style="color: green; font-size: 24px;">✅ THANH TOÁN THÀNH CÔNG!</h1>
                <p>Cảm ơn bạn đã quyên góp.</p>
                <p>Mã đơn hàng: <b>${orderId}</b></p>
                <p>Thông báo: ${message}</p>
                <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Quay về Trang chủ</a>
            </div>
        `);
    } else {
        res.send(`
            <div style="text-align: center; padding-top: 50px; font-family: Arial, sans-serif;">
                <h1 style="color: red; font-size: 24px;">❌ THANH TOÁN THẤT BẠI</h1>
                <p>Mã đơn hàng: <b>${orderId}</b></p>
                <p>Lý do: ${message}</p>
                <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #6c757d; color: white; text-decoration: none; border-radius: 5px;">Thử lại</a>
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