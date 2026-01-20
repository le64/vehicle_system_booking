const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Route pour statistiques employé (avant les autres middlewares pour éviter la vérification ADMIN)
router.get('/stats/employee', authenticate, adminController.getEmployeeStats);

// Toutes les routes d'admin nécessitent une authentification et une autorisation ADMIN
router.use(authenticate);
router.use(authorize('ADMIN'));

// Routes de statistiques
router.get('/stats', adminController.getStats);

// Routes des utilisateurs
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/status', adminController.toggleUserStatus);

// Routes des véhicules
router.get('/vehicles', adminController.getVehicles);
router.post('/vehicles', adminController.createVehicle);
router.put('/vehicles/:id', adminController.updateVehicle);
router.delete('/vehicles/:id', adminController.deleteVehicle);

// Routes des réservations
router.get('/reservations', adminController.getReservations);
router.get('/reservations/pending', adminController.getPendingReservations);
router.put('/reservations/:id/approve', adminController.approveReservation);
router.put('/reservations/:id/reject', adminController.rejectReservation);

module.exports = router;
