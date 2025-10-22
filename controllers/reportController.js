const { asyncHandler } = require('../utils/asyncHandler');
const { getTop5Campaigns, getOverview } = require('../services/reportService');

const getTopCampaignsController = asyncHandler(async (req, res) => {
  const topCampaigns = await getTop5Campaigns({ limit: 5 });
  res.status(200).json({
    status: 'success',
    data: topCampaigns
  });
});

const getOverviewController = asyncHandler(async (req, res) => {
  const overview = await getOverview();
  res.status(200).json({
    status: 'success',
    data: overview
  });
});

module.exports = {
  getTopCampaignsController,
  getOverviewController
};
