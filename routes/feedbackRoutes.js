const express = require('express');
const { protect, restrictTo } = require('../middlewares/auth');
const { submitFeedback } = require('../controllers/feedbackController');

const router = express.Router();

router.post('/', protect, submitFeedback);

module.exports = router;
