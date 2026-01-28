const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { createDonationController, myDonationsController, getDonationsByCampaignController, momoWebhookController } = require('../controllers/donationController');

const router = express.Router();

router.post('/', protect, createDonationController);
router.get('/my', protect, myDonationsController);
router.get('/campaign/:campaignId', protect, restrictTo('admin', 'organizer'), getDonationsByCampaignController);

router.post('/momo-ipn', momoWebhookController);


module.exports = router;
