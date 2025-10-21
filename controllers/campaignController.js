const { createCampaign, approveCampaign, updateCampaign, deleteCampaign, getApprovedCampaigns, getCampaignDetail, getAllCampaigns } = require('../services/campaignService');
const { asyncHandler } = require('../utils/asyncHandler');

const createCampaignController = asyncHandler(async (req, res) => {
  const campaignData = req.body;
  campaignData.imageUrl = req.file ? req.file.path : undefined;
  const userId = req.user._id;

  const newCampaign = await createCampaign(campaignData, userId);

  res.status(201).json({
    status: 'success',
    message: 'Campaign created successfully',
    data: newCampaign
  });
});

const approveCampaignController = asyncHandler(async (req, res) => {
  const approvedCampaign = await approveCampaign(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Campaign approved successfully',
    data: approvedCampaign
  });
});

const updateCampaignController = asyncHandler(async (req, res) => {
  const campaignId = req.params.id;
  const userId = req.user._id;
  const updateData = req.body;
  updateData.imageUrl = req.file ? req.file.path : undefined;

  const updatedCampaign = await updateCampaign(campaignId, userId, updateData);

  res.status(200).json({
    status: 'success',
    message: 'Campaign updated successfully',
    data: updatedCampaign
  });
});

const deleteCampaignController = asyncHandler(async (req, res) => {
  const campaignId = req.params.id;
  const userId = req.user._id;

  const deletedCampaign = await deleteCampaign(campaignId, userId);

  res.status(200).json({
    status: 'success',
    message: 'Campaign deleted successfully',
    data: deletedCampaign
  });
});

const getApprovedCampaignsController = asyncHandler(async (req, res) => {
  const campaigns = await getApprovedCampaigns();

  res.status(200).json({
    status: 'success',
    message: 'Approved campaigns retrieved successfully',
    data: campaigns
  });
});

const getCampaignDetailController = asyncHandler(async (req, res) => {
  const campaignId = req.params.id;
  const campaign = await getCampaignDetail(campaignId);

  res.status(200).json({
    status: 'success',
    message: 'Campaign details retrieved successfully',
    data: campaign
  });
});

const getAllCampaignsController = asyncHandler(async (req, res) => {
  const { limit, page } = req.query;
  const campaigns = await getAllCampaigns({ limit, page });

  res.status(200).json({
    status: 'success',
    message: 'All campaigns retrieved successfully',
    data: campaigns
  });
});

module.exports = {
  createCampaignController,
  approveCampaignController,
  updateCampaignController,
  deleteCampaignController,
  getCampaignDetailController,
  getApprovedCampaignsController,
  getAllCampaignsController
};