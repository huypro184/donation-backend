const { asyncHandler } = require('../utils/asyncHandler');
const { createDonation } = require('../services/donationService');

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

module.exports = {
  createDonationController
};