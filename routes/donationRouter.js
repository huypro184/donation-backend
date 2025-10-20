const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { createDonationController } = require('../controllers/donationController');

const router = express.Router();

router.post('/', protect, createDonationController);

module.exports = router;
