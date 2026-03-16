const express = require('express');
const documentController = require('../controllers/documentController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Document endpoints
router.post('/', documentController.createDocument);
router.get('/', documentController.listDocuments);
router.get('/:docId', documentController.getDocument);
router.put('/:docId', documentController.updateDocument);
router.patch('/:docId/rename', documentController.renameDocument);
router.delete('/:docId', documentController.deleteDocument);

module.exports = router;
