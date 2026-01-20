const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Routes pour les employés
router.post('/', reservationController.create);
router.get('/my-reservations', reservationController.getMyReservations);
router.get('/:id', reservationController.getReservationDetails);
router.put('/:id/cancel', reservationController.cancel);

// Routes pour l'admin
router.get('/admin/pending', authorize('ADMIN'), reservationController.getPendingReservations);
router.put('/:id/approve', authorize('ADMIN'), reservationController.approveReservation);
router.put('/:id/reject', authorize('ADMIN'), reservationController.rejectReservation);

module.exports = router;