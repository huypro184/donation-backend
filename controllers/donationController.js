const { asyncHandler } = require('../utils/asyncHandler');
const { createDonation, myDonations, getDonationsByCampaign, updatePaymentStatus } = require('../services/donationService');

const createDonationController = asyncHandler(async (req, res) => {
  const donationData = req.body;
  donationData.donorId = req.user._id;

  let ipAddr = req.headers['x-forwarded-for'] ||
               req.connection.remoteAddress ||
               req.socket.remoteAddress ||
               req.connection.socket.remoteAddress;

  const newDonation = await createDonation(donationData, ipAddr);
  res.status(201).json({
    status: 'success',
    data: {
      donation: newDonation.donation,
      payUrl: newDonation.payUrl
    }
  });
});

const momoWebhookController = asyncHandler(async (req, res) => {
  const { orderId, resultCode } = req.body;

  console.log(">> MOMO WEBHOOK RECEIVED:", req.body);

  // resultCode = 0 nghĩa là Giao dịch thành công
  if (resultCode == 0) {
      await updatePaymentStatus(orderId);
      console.log(` Donation ${orderId} updated successfully!`);
  } else {
      console.log(` Donation ${orderId} failed or cancelled.`);
  }
  res.status(204).send();
});

const vnpayIpnController = asyncHandler(async (req, res) => {
    try {
        const vnp_Params = req.query; // VNPAY bắn GET query params
        console.log(">> VNPAY IPN:", vnp_Params);

        const result = await verifyVnPayIpn(vnp_Params);
        
        if (result) {
            res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
        } else {
            // Trả về cho VNPAY biết là xử lý xong (dù thất bại)
            res.status(200).json({ RspCode: '00', Message: 'Confirm Success' }); 
        }
    } catch (error) {
        console.error("VNPAY IPN Error:", error);
        res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
    }
});

const myDonationsController = asyncHandler(async (req, res) => {
  const donorId = req.user._id;
  const { limit, page } = req.query;
  const donations = await myDonations({ donorId, limit, page });
  res.status(200).json({
    status: 'success',
    data: {
      donations
    }
  });
});

const getDonationsByCampaignController = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  const { limit, page } = req.query;
  const donations = await getDonationsByCampaign({ campaignId, limit, page });
  res.status(200).json({
    status: 'success',
    data: {
      donations
    }
  });
});

module.exports = {
  createDonationController,
  myDonationsController,
  getDonationsByCampaignController,
  momoWebhookController,
  vnpayIpnController
};