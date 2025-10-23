const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true
  },
  goalAmount: {
    type: Number,
    required: true
  },
  collectedAmount: {
    type: Number,
    default: 0
  },
  startDate: Date,
  endDate: Date,
  imageUrl: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  }],
  rejectReason: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);