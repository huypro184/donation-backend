const express = require('express');
const upload = require('../middlewares/upload');
const { protect, restrictTo } = require('../middlewares/auth');
const { createCampaignController, approveCampaignController, updateCampaignController, deleteCampaignController, getApprovedCampaignsController, getCampaignDetailController, getAllCampaignsController, rejectCampaignController } = require('../controllers/campaignController');

const router = express.Router();

router.post('/create', protect, restrictTo('admin', 'organizer'), upload.single('image'), createCampaignController);
router.patch('/approve/:id', protect, restrictTo('admin'), approveCampaignController);
router.patch('/reject/:id', protect, restrictTo('admin'), rejectCampaignController);
router.patch('/:id', protect, restrictTo('admin', 'organizer'), upload.single('image'), updateCampaignController);
router.delete('/:id', protect, restrictTo('admin', 'organizer'), deleteCampaignController);
router.get('/approved', getApprovedCampaignsController);
router.get('/:id', getCampaignDetailController);
router.get('/', protect, restrictTo('admin'), getAllCampaignsController);

module.exports = router;