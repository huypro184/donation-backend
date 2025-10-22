const Feedback = require('../models/Feedback');
const AppError = require('../utils/AppError');

const submitFeedback = async (feedbackData) => {
  try {
    const { userId, campaignId, comment } = feedbackData;
    if (!userId || !campaignId || !comment) {
      throw new AppError('Please provide all required fields', 400);
    }

    const feedback = await Feedback.create({
      userId,
      campaignId,
      comment
    });

    return feedback;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  submitFeedback
};


