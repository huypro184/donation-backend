const express = require('express');
const upload = require('../middlewares/upload');
const { protect, restrictTo } = require('../middlewares/auth');
const { createCampaignController, approveCampaignController } = require('../controllers/campaignController');

const router = express.Router();

router.post('/create', protect, restrictTo('admin', 'organizer'), upload.single('image'), createCampaignController);
router.patch('/approve/:id', protect, restrictTo('admin'), approveCampaignController);

module.exports = router;