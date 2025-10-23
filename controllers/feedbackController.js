const { asyncHandler } = require('../utils/asyncHandler');
const { getFeedbackByCampaign, submitFeedback } = require('../services/feedbackService');

const submitFeedbackController = asyncHandler(async (req, res) => {
    const feedbackData = {
        userId: req.user.id,
        campaignId: req.body.campaignId,
        comment: req.body.comment
    };

    const feedback = await submitFeedback(feedbackData);
    res.status(201).json({
        status: 'success',
        data: {
            feedback
        }
    });
});

const getFeedbackByCampaignController = asyncHandler(async (req, res) => {
    const { campaignId } = req.params;
    const { limit, page } = req.query;

    const feedback = await getFeedbackByCampaign(campaignId, { limit, page });
    res.status(200).json({
        status: 'success',
        data: feedback
    });
});

module.exports = {
  submitFeedbackController,
  getFeedbackByCampaignController
};