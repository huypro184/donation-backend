const Donation = require('../models/Donation');
// const { sendMail } = require('../utils/mail');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const AppError = require('../utils/AppError');
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

const createDonation = async (donationData) => {
  try {
    const { donorId, campaignId, amount, paymentMethod } = donationData;

    // Validation cơ bản
    if (!amount || !campaignId || !donorId) {
      throw new AppError('Please provide all required fields', 400);
    }

    const allowedMethods = ['momo', 'paypal', 'bank'];
    if (!allowedMethods.includes(paymentMethod)) {
        throw new AppError('Invalid payment method', 400);
    }

    const campaign = await Campaign.findOne({ _id: campaignId, status: 'approved' });
    if (!campaign) {
      throw new AppError('Campaign not found or not approved', 404);
    }

    // Cấu hình MoMo
    const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
    const accessKey = process.env.MOMO_ACCESS_KEY;
    const secretKey = process.env.MOMO_SECRET_KEY;
    const requestId = partnerCode + new Date().getTime();
    const orderId = requestId; // Mã giao dịch duy nhất

    // Tạo đơn hàng trong DB với trạng thái PENDING (Chưa cộng tiền)
    const newDonation = await Donation.create({
        donorId,
        campaignId,
        amount,
        paymentMethod,
        transactionId: orderId, // Lưu lại orderId để đối soát với MoMo
        status: 'pending'       // QUAN TRỌNG: Mặc định là pending
    });

    let payUrl = '';

    // Xử lý riêng cho MoMo
    if (paymentMethod === 'momo') {
        const orderInfo = `Donate to Campaign ${campaign.title.substring(0, 20)}...`; // noi dung giao dich
        const hostUrl = process.env.HOST_URL || `http://localhost:${process.env.PORT}`;
        const redirectUrl = `${hostUrl}/payment-result`; // User quay về đây
        const ipnUrl = `${hostUrl}/api/donations/momo-ipn`; // MoMo gọi ngầm vào đây (BẮT BUỘC PHẢI LÀ LINK PUBLIC)
        const requestType = "captureWallet";
        const extraData = ""; 

        // Tạo chữ ký (Signature) chuẩn thuật toán MoMo
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        
        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        // Gửi request sang MoMo
        const requestBody = {
            partnerCode, partnerName: "Donation App", storeId: "MomoTestStore",
            requestId, amount, orderId, orderInfo, redirectUrl, ipnUrl,
            lang: 'vi', requestType, autoCapture: true, extraData, signature
        };

        try {
            const response = await axios.post(process.env.MOMO_ENDPOINT, requestBody);
            if (response.data && response.data.payUrl) {
                payUrl = response.data.payUrl;
            } else {
                // Nếu MoMo lỗi, xóa đơn pending để tránh rác DB
                await Donation.findByIdAndDelete(newDonation._id);
                throw new AppError('MoMo Error: ' + (response.data.message || 'Unknown'), 400);
            }
        } catch (momoError) {
             // Xóa đơn pending nếu gọi API thất bại
            await Donation.findByIdAndDelete(newDonation._id);
            throw new AppError('Connection to Payment Gateway failed', 502);
        }
    } 
    // Nếu là 'bank' (QR Code) hoặc method khác thì xử lý ở đây...
    
    return { 
        donation: newDonation, 
        payUrl 
    };

  } catch (error) {
    throw error;
  }
};

const updatePaymentStatus = async (transactionId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Tìm đơn hàng theo mã giao dịch
        const donation = await Donation.findOne({ transactionId }).session(session);

        if (!donation) {
            await session.abortTransaction();
            session.endSession();
            throw new AppError('Donation not found', 404);
        }

        // Nếu đơn đã thành công rồi thì dừng luôn (Tránh cộng tiền 2 lần)
        if (donation.status === 'success') {
            await session.abortTransaction();
            session.endSession();
            return donation;
        }

        // 2. Cập nhật trạng thái Donation
        donation.status = 'success';
        await donation.save({ session });

        // 3. Cộng tiền vào Campaign
        await Campaign.findByIdAndUpdate(
            donation.campaignId,
            { $inc: { collectedAmount: donation.amount } },
            { new: true, session }
        );

        // 4. Chốt sổ (Lưu DB)
        await session.commitTransaction();
        session.endSession();

        console.log(`>> Donation ${transactionId} updated successfully.`);
        return donation;

    } catch (error) {
        // Nếu có lỗi, hủy giao dịch để không làm sai lệch tiền
        if (session.inTransaction()) {
             await session.abortTransaction();
        }
        session.endSession();
        throw error;
    }
};

const myDonations = async ({ donorId, limit = 10, page = 1 } = {}) => {
  try {
    const donations = await Donation.find({ donorId })
      .populate('campaignId', 'title description')
      .limit(limit)
      .skip((page - 1) * limit);

    total = await Donation.countDocuments({ donorId });
    return {
      total,
      currentPage: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      data: donations
    };
  } catch (error) {
    throw error;
  }
};

const getDonationsByCampaign = async ({ campaignId, limit = 10, page = 1 }) => {
  try {
    const donations = await Donation.find({ campaignId })
      .populate('donorId', 'name email')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Donation.countDocuments({ campaignId });
    return {
      total,
      currentPage: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      data: donations
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createDonation,
  myDonations,
  getDonationsByCampaign,
  updatePaymentStatus
};
