const express = require('express');
const activityController = require('../controllers/activityController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Activity endpoints
router.get('/:docId/logs', activityController.getActivityLogs);
router.post('/:docId/logs', activityController.logActivity);

module.exports = router;
