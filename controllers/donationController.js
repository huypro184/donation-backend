const { asyncHandler } = require('../utils/asyncHandler');
const { createDonation, myDonations, getDonationsByCampaign } = require('../services/donationService');

const createDonationController = asyncHandler(async (req, res) => {
  const donationData = req.body;
  donationData.donorId = req.user._id;

  const newDonation = await createDonation(donationData);
  res.status(201).json({
    status: 'success',
    data: {
      donation: newDonation
    }
  });
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
  getDonationsByCampaignController
};