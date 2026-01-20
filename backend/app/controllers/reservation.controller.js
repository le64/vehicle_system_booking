const reservationService = require('../services/reservation.service');

class ReservationController {
  async create(req, res) {
    try {
      const { vehicleId, reservationDate, startTime, endTime, purpose } = req.body;
      
      const reservation = await reservationService.createReservation({
        userId: req.user.id,
        vehicleId,
        reservationDate,
        startTime,
        endTime,
        purpose
      });

      res.status(201).json({
        success: true,
        data: reservation,
        message: 'Réservation créée et en attente de validation admin'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancel(req, res) {
    try {
      const { id } = req.params;
      
      const reservation = await reservationService.cancelReservation(
        id,
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getMyReservations(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const reservations = await reservationService.getUserReservations(
        req.user.id,
        { status, limit, offset }
      );

      // Transformer les données avec deux formats : un pour le Reservations.tsx (flat), un pour DashboardEnhanced (nested)
      const mappedReservations = reservations.map(r => ({
        id: r.id,
        userId: r.user_id,
        vehicleId: r.vehicle_id,
        // Pour Reservations.tsx (flat structure)
        reservationDate: r.reservation_date,
        startTime: r.start_time,
        endTime: r.end_time,
        // Pour DashboardEnhanced (nested structure)
        startDate: r.reservation_date + ' ' + r.start_time,
        endDate: r.reservation_date + ' ' + r.end_time,
        purpose: r.purpose,
        status: r.status,
        createdAt: r.created_at,
        approvedAt: r.approved_at,
        adminNotes: r.admin_notes,
        registrationNumber: r.registration_number,
        brand: r.brand,
        model: r.model,
        type: r.type,
        firstName: r.first_name,
        lastName: r.last_name,
        email: r.email,
        vehicle: {
          brand: r.brand,
          model: r.model,
          registrationNumber: r.registration_number
        }
      }));

      res.status(200).json({
        success: true,
        data: mappedReservations
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getReservationDetails(req, res) {
    try {
      const { id } = req.params;
      
      const reservation = await reservationService.getReservationDetails(
        id,
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        data: reservation
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPendingReservations(req, res) {
    try {
      const reservations = await reservationService.getPendingReservations();

      res.status(200).json({
        success: true,
        data: reservations
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async approveReservation(req, res) {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const reservation = await reservationService.approveReservation(id, adminNotes);

      res.status(200).json({
        success: true,
        data: reservation,
        message: 'Réservation approuvée avec succès'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async rejectReservation(req, res) {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const reservation = await reservationService.rejectReservation(id, adminNotes);

      res.status(200).json({
        success: true,
        data: reservation,
        message: 'Réservation rejetée'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ReservationController();