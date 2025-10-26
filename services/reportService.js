const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const redisClient = require('../config/redis');
const User = require('../models/User');

const getTop5Campaigns = async ({ limit = 5 } = {}) => {
  try {
    const cacheKey = `dashboard:topCampaigns:limit=${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const topCampaigns = await Campaign.find({ status: 'approved' })
      .select('title collectedAmount category createdBy')
      .sort({ collectedAmount: -1 })
      .limit(limit)
      .populate('createdBy', 'name email');

        await redisClient.set(cacheKey, JSON.stringify(topCampaigns), { EX: 120 });

    return topCampaigns;

  } catch (error) {
    throw error;
  }
};

const getOverview = async () => {
  try {
    const cacheKey = 'dashboard:overview';
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [campaignCount, donationCount, userCount, totalAgg] = await Promise.all([
      Campaign.countDocuments(),
      Donation.countDocuments(),
      User.countDocuments(),
      Donation.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalDonated = totalAgg?.[0]?.total || 0;
    const result = { campaignCount, donationCount, userCount, totalDonated };

    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 120 });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getTop5Campaigns,
  getOverview
};