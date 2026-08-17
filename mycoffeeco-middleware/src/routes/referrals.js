/**
 * Referral Routes
 */

const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');

// Create new referral code
router.post('/', referralController.createReferral);

// Get all referral codes
router.get('/', referralController.getAllReferrals);

// Validate referral code
router.get('/validate/:code', referralController.validateReferral);

// Get referral stats
router.get('/:code', referralController.getReferralStats);

// Update referral
router.put('/:code', referralController.updateReferral);

// Delete referral
router.delete('/:code', referralController.deleteReferral);

// Export referral report
router.get('/:code/export', referralController.exportReferralReport);

module.exports = router;
