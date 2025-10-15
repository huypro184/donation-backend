const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { createCampaignController } = require('../controllers/campaignController');

const router = express.Router();

router.post('/create', protect, restrictTo('admin', 'organizer'), createCampaignController);

module.exports = router;