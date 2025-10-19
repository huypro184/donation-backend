const Campaign = require('../models/Campaign');
const AppError = require('../utils/AppError');

const createCampaign = async (campaignData, userId) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

const approveCampaign = async (campaignId) => {
  try {
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
  } catch (error) {
    throw error;
  }
};


const rejectCampaign = async (campaignId, data) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    if (campaign.status !== 'pending') {
      throw new AppError('Only pending campaigns can be rejected', 400);
    }

    campaign.status = 'rejected';
    await campaign.save();

    return campaign;
  } catch (error) {
    throw error;
  }
};

const updateCampaign = async (campaignId, userId, updateData) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    if (userId.toString() !== campaign.createdBy.toString()) {
      throw new AppError('Not authorized to update this campaign', 403);
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new AppError('Please provide data to update', 400);
    }

    const newStart = updateData.startDate !== undefined ? new Date(updateData.startDate) : campaign.startDate;
    const newEnd = updateData.endDate !== undefined ? new Date(updateData.endDate) : campaign.endDate;

    if ((updateData.startDate !== undefined && isNaN(newStart.getTime())) ||
        (updateData.endDate !== undefined && isNaN(newEnd.getTime()))) {
      throw new AppError('Invalid date format', 400);
    }

    if (newStart && newEnd && newStart >= newEnd) {
      throw new AppError('End date must be after start date', 400);
    }

    if (updateData.description !== undefined) campaign.description = updateData.description;
    if (updateData.imageUrl !== undefined) campaign.imageUrl = updateData.imageUrl;
    if (updateData.startDate !== undefined) campaign.startDate = newStart;
    if (updateData.endDate !== undefined) campaign.endDate = newEnd;
    await campaign.save();

    return campaign;
  } catch (error) {
    throw error;
  }
};

const deleteCampaign = async (campaignId, userId) => {
  try {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }

    if (userId.toString() !== campaign.createdBy.toString()) {
      throw new AppError('Not authorized to delete this campaign', 403);
    }

    if (campaign.collectedAmount > 0) {
      throw new AppError('Cannot delete a campaign that has received donations', 400);
    }
    await Campaign.findByIdAndDelete(campaignId);

    return campaign;
  } catch (error) {
    throw error;
  }
};

const getApprovedCampaigns = async ({ category, sortBy = 'latest', limit = 10, page = 1 } = {}) => {
  try {
    const filter = { status: 'approved' };

    if (category) {
      filter.category = category;
    }

    let sort = {};
    if (sortBy === 'latest') {
      sort = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const campaigns = await Campaign.find(filter)
      .select('-rejectReason -status')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Campaign.countDocuments(filter);

    return {
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: campaigns
    };
  } catch (error) {
    throw error;
  }
};

const getCampaignDetail = async (campaignId) => {
  try {
    const campaign = await Campaign.findOne({
      _id: campaignId,
      status: 'approved'
    })
      .select('-rejectReason -status')
      .populate('createdBy', 'name email');
    if (!campaign) {
      throw new AppError('Campaign not found or not approved', 404);
    }

    return campaign;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createCampaign,
  approveCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignDetail,
  getApprovedCampaigns,
  rejectCampaign
};