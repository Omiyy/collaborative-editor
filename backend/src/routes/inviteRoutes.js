const express = require('express');
const inviteController = require('../controllers/inviteController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Invite endpoints
router.post('/send', inviteController.sendInvite);
router.post('/share-link', inviteController.generateShareLink);
router.post('/join', inviteController.joinWithInviteCode);
router.get('/my-invites', inviteController.getMyInvites);

module.exports = router;
