const { asyncHandler } = require('../utils/asyncHandler');
const { createDonation, myDonations, getDonationsByCampaign, updatePaymentStatus, verifyMomoSignature } = require('../services/donationService');

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
  
  await verifyMomoSignature(req.body);

  // resultCode = 0 nghĩa là Giao dịch thành công
  if (resultCode == 0) {
      await updatePaymentStatus(orderId);
      console.log(` Donation ${orderId} updated successfully!`);
  } else {
      console.log(` Donation ${orderId} failed or cancelled.`);
  }
  res.status(204).send();
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
  momoWebhookController
};