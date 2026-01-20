const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Routes publiques pour voir les véhicules disponibles
router.get('/available', vehicleController.getAvailableVehicles);

// Routes protégées
router.use(authenticate);

// Routes pour tous les utilisateurs authentifiés
router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleDetails);

// Routes réservées aux administrateurs
router.post('/', authorize('ADMIN'), vehicleController.create);
router.put('/:id', authorize('ADMIN'), vehicleController.update);
router.delete('/:id', authorize('ADMIN'), vehicleController.delete);
router.put('/:id/status', authorize('ADMIN'), vehicleController.updateStatus);

// Route pour l'upload d'images
router.post('/upload/image', authorize('ADMIN'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Aucun fichier envoyé'
    });
  }

  res.json({
    success: true,
    message: 'Image uploadée avec succès',
    data: {
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`,
      size: req.file.size
    }
  });
});

module.exports = router;