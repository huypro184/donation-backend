const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const getTop5Campaigns = async ({ limit = 5 } = {}) => {
  try {
    const topCampaigns = await Campaign.find({ status: 'approved' })
      .select('title collectedAmount category createdBy')
      .sort({ collectedAmount: -1 })
      .limit(limit)
      .populate('createdBy', 'name email');

    return topCampaigns;

  } catch (error) {
    throw error;
  }
};

module.exports = {
  getTop5Campaigns
};