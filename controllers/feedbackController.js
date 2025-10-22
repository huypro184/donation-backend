const { asyncHandler } = require('../utils/asyncHandler');
const feedbackService = require('../services/feedbackService');

const submitFeedback = asyncHandler(async (req, res) => {

    const feedbackData = {
        userId: req.user.id,
        campaignId: req.body.campaignId,
        comment: req.body.comment
    };

    const feedback = await feedbackService.submitFeedback(feedbackData);
    res.status(201).json({
        status: 'success',
        data: {
            feedback
        }
    });
});

module.exports = {
  submitFeedback
};
