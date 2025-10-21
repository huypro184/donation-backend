const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { createDonationController, myDonationsController } = require('../controllers/donationController');

const router = express.Router();

router.post('/', protect, createDonationController);
router.get('/my', protect, myDonationsController);

module.exports = router;
