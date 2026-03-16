const express = require('express');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Room endpoints
router.post('/', roomController.createRoom);
router.get('/', roomController.getUserRooms);
router.get('/:roomId', roomController.getRoom);
router.get('/:roomId/members', roomController.getRoomMembers);
router.post('/:roomId/members', roomController.addMember);
router.patch('/:roomId/members/:memberId/role', roomController.updateMemberRole);
router.delete('/:roomId/members/:memberId', roomController.removeMember);

module.exports = router;
