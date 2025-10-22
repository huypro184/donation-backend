const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { getTopCampaignsController } = require('../controllers/reportController');
const router = express.Router();

router.get('/', protect, restrictTo('admin'), getTopCampaignsController);

module.exports = router;