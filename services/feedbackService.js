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

module.exports = {
  submitFeedback
};


