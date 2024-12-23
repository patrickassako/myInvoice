const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');

// Appliquer le middleware d'authentification à toutes les routes
router.use(auth);

router.post('/', documentController.createDocument);
router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);
router.get('/:id/pdf', documentController.generatePDF);
router.post('/:id/send', documentController.sendDocument);

module.exports = router; 