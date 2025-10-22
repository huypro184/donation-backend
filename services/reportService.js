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

const getOverview = async () => {
  try {
    const [campaignCount, donationCount, userCount, totalAgg] = await Promise.all([
      Campaign.countDocuments(),
      Donation.countDocuments(),
      User.countDocuments(),
      Donation.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalDonated = (totalAgg[0] && totalAgg[0].total) ? totalAgg[0].total : 0;

    return {
      campaignCount,
      donationCount,
      userCount,
      totalDonated
    };
  } catch (error) {
    throw new AppError('Error fetching overview stats', 500);
  }
};

module.exports = {
  getTop5Campaigns,
  getOverview
};