const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { getTopCampaignsController, getOverviewController } = require('../controllers/reportController');
const router = express.Router();

router.get('/', protect, restrictTo('admin'), getTopCampaignsController);
router.get('/overview', protect, restrictTo('admin'), getOverviewController);

module.exports = router;