const { createCampaign } = require('../services/campaignService');
const { asyncHandler } = require('../utils/asyncHandler');

const createCampaignController = asyncHandler(async (req, res) => {
  const campaignData = req.body;
  const userId = req.user._id;

  const newCampaign = await createCampaign(campaignData, userId);

  res.status(201).json({
    status: 'success',
    message: 'Campaign created successfully',
    data: newCampaign
  });
});

module.exports = {
  createCampaignController
};