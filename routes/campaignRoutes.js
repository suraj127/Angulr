const express = require('express');
const router = express.Router();
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
} = require('../controllers/campaignController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createCampaign).get(protect, getCampaigns);
router.route('/:id').get(protect, getCampaignById);

module.exports = router;
