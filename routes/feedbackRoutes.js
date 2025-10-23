const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { submitFeedbackController, getFeedbackByCampaignController} = require('../controllers/feedbackController');

const router = express.Router();

router.post('/', protect, submitFeedbackController);
router.get('/:campaignId', protect, getFeedbackByCampaignController);

module.exports = router;
