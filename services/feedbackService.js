const Feedback = require('../models/Feedback');
const AppError = require('../utils/AppError');
const axios = require('axios');

const analyzeSentiment = async (text) => {
  try {
    const response = await axios.post(
      "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment",
      { inputs: text },
      {
        headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
      }
    );
    const labelMap = {
      LABEL_2: 'positive',
      LABEL_1: 'neutral',
      LABEL_0: 'negative'
    };
    const top = response.data[0][0];
    return labelMap[top.label] || 'neutral';
  } catch (error) {
    return 'neutral';
  }
};

const submitFeedback = async (feedbackData) => {
  try { 
    const { userId, campaignId, comment } = feedbackData;
    if (!userId || !campaignId || !comment) {
      throw new AppError('Please provide all required fields', 400);
    }

    if (comment.length > 500) {
      throw new AppError('Comment is too long (max 500 characters)', 400);
    }

    const feedbackCount = await Feedback.countDocuments({ userId, campaignId });
    if (feedbackCount >= 3) {
      throw new AppError('You have reached the maximum number of feedbacks for this campaign', 400);
    }

    const sentiment = await analyzeSentiment(comment);

    const feedback = await Feedback.create({
      userId,
      campaignId,
      comment,
      sentiment
    });

    return feedback;
  } catch (error) {
    throw error;
  }
};

const getFeedbackByCampaign = async (campaignId, { limit = 10, page = 1 } = {}) => {
  try {
    const feedback = await Feedback.find({ campaignId })
      .populate('userId', 'name email')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    if (feedback.length === 0) {
      throw new AppError('No feedback found for this campaign', 404);
    }
    const total = await Feedback.countDocuments({ campaignId });

    return {
      total,
      currentPage: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      data: feedback
    };
  } catch (error) {
    throw error;
  }
};
  
module.exports = {
  submitFeedback,
  getFeedbackByCampaign
};


