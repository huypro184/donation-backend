const Campaign = require('../models/Campaign');
const AppError = require('../utils/AppError');

const createCampaign = async (campaignData, userId) => {
  const { title, description, category, goalAmount, startDate, endDate, imageUrl } = campaignData;

  if (!title || !description || !category || !goalAmount || !startDate || !endDate || !imageUrl) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (goalAmount <= 0) {
    throw new AppError('Goal amount must be greater than 0', 400);
  }

  if (new Date(startDate) >= new Date(endDate)) {
    throw new AppError('End date must be after start date', 400);
  }

  const existing = await Campaign.findOne({ title });
  if (existing) {
    throw new AppError('Campaign with this title already exists', 409);
  }

  const newCampaign = await Campaign.create({
    title,
    description,
    category,
    goalAmount,
    startDate,
    endDate,
    imageUrl,
    createdBy: userId
  });

  return newCampaign;
};

const approveCampaign = async (campaignId) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }

  if (campaign.status !== 'pending') {
    throw new AppError('Only pending campaigns can be approved', 400);
  }

  campaign.status = 'approved';
  await campaign.save();

  return campaign;
};

module.exports = { 
  createCampaign,
  approveCampaign
};