const { asyncHandler } = require('../utils/asyncHandler');
const { getTop5Campaigns } = require('../services/reportService');

const getTopCampaignsController = asyncHandler(async (req, res) => {
  const topCampaigns = await getTop5Campaigns({ limit: 5 });
  res.status(200).json({
    status: 'success',
    data: topCampaigns
  });
});

module.exports = {
  getTopCampaignsController
};
