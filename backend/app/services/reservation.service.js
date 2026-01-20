const reservationRepository = require('../repositories/reservation.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const logger = require('../utils/logger');

class ReservationService {
  async createReservation(reservationData) {
    try {
      // Vérifier que le véhicule existe et est disponible
      const vehicle = await vehicleRepository.findById(reservationData.vehicleId);
      if (!vehicle) {
        throw new Error('Véhicule non trouvé');
      }

      if (vehicle.status !== 'available') {
        throw new Error(`Le véhicule n'est pas disponible. Statut: ${vehicle.status}`);
      }

      // Vérifier les heures (format HH:mm)
      if (!reservationData.startTime || !reservationData.endTime) {
        throw new Error('Les heures de début et fin sont obligatoires');
      }

      if (reservationData.startTime >= reservationData.endTime) {
        throw new Error('L\'heure de début doit être avant l\'heure de fin');
      }

      // Vérifier que la réservation n'est pas dans le passé
      const startDateTime = new Date(reservationData.reservationDate + 'T' + reservationData.startTime);
      if (startDateTime < new Date()) {
        throw new Error('La date et heure de début ne peuvent pas être dans le passé');
      }

      // Vérifier les chevauchements de véhicule
      const overlappingVehicleReservations = await reservationRepository.findOverlappingReservations(
        reservationData.vehicleId,
        reservationData.reservationDate,
        reservationData.startTime,
        reservationData.endTime
      );

      if (overlappingVehicleReservations.length > 0) {
        throw new Error('Ce véhicule est déjà réservé pour ces horaires à cette date');
      }

      // Vérifier que l'employé n'a pas d'autre réservation qui chevauche les mêmes horaires
      const overlappingUserReservations = await reservationRepository.findOverlappingUserReservations(
        reservationData.userId,
        reservationData.reservationDate,
        reservationData.startTime,
        reservationData.endTime
      );

      if (overlappingUserReservations.length > 0) {
        throw new Error('Vous avez déjà une réservation qui chevauche ces horaires à cette date. Un employé ne peut pas réserver plusieurs véhicules simultanément');
      }

      // Créer la réservation avec le champ purpose
      const reservation = await reservationRepository.create({
        ...reservationData,
        purpose: reservationData.purpose || null
      });
      
      logger.info(`Réservation créée: ${reservation.id} pour l'utilisateur ${reservationData.userId} (en attente de validation)`);
      
      return reservation;
    } catch (error) {
      logger.error('Erreur lors de la création de la réservation:', error);
      throw error;
    }
  }

  async cancelReservation(reservationId, userId, userRole) {
    try {
      const reservation = await reservationRepository.findById(reservationId);
      
      if (!reservation) {
        throw new Error('Réservation non trouvée');
      }

      // Vérifier les permissions
      if (userRole !== 'ADMIN' && reservation.user_id !== userId) {
        throw new Error('Vous n\'êtes pas autorisé à annuler cette réservation');
      }

      // Vérifier que la réservation n'est pas déjà annulée
      if (reservation.status === 'CANCELLED') {
        throw new Error('Cette réservation est déjà annulée');
      }

      // Vérifier que la réservation n'a pas encore commencé
      const startDateTime = new Date(reservation.start_date + 'T' + reservation.start_time);
      if (startDateTime < new Date()) {
        throw new Error('Impossible d\'annuler une réservation déjà commencée');
      }

      // Annuler la réservation
      const updatedReservation = await reservationRepository.cancel(reservationId);
      
      logger.info(`Réservation annulée: ${reservationId} par l'utilisateur ${userId}`);
      
      return updatedReservation;
    } catch (error) {
      logger.error('Erreur lors de l\'annulation de la réservation:', error);
      throw error;
    }
  }

  async getUserReservations(userId, options = {}) {
    try {
      return await reservationRepository.findByUserId(userId, options);
    } catch (error) {
      logger.error('Erreur lors de la récupération des réservations:', error);
      throw error;
    }
  }

  async getReservationDetails(reservationId, userId, userRole) {
    try {
      const reservation = await reservationRepository.findById(reservationId);
      
      if (!reservation) {
        throw new Error('Réservation non trouvée');
      }

      // Vérifier les permissions
      if (userRole !== 'ADMIN' && reservation.user_id !== userId) {
        throw new Error('Vous n\'êtes pas autorisé à voir cette réservation');
      }

      return reservation;
    } catch (error) {
      logger.error('Erreur lors de la récupération des détails de la réservation:', error);
      throw error;
    }
  }

  async getPendingReservations() {
    try {
      return await reservationRepository.findPendingReservations();
    } catch (error) {
      logger.error('Erreur lors de la récupération des réservations en attente:', error);
      throw error;
    }
  }

  async approveReservation(reservationId, adminNotes = null) {
    try {
      const reservation = await reservationRepository.findById(reservationId);
      
      if (!reservation) {
        throw new Error('Réservation non trouvée');
      }

      if (reservation.status !== 'PENDING') {
        throw new Error('Seules les réservations en attente peuvent être approuvées');
      }

      // Vérifier à nouveau les chevauchements (au cas où d'autres réservations auraient été approuvées)
      const overlappingReservations = await reservationRepository.findOverlappingReservations(
        reservation.vehicle_id,
        reservation.start_date,
        reservation.end_date,
        reservationId
      );

      if (overlappingReservations.length > 0) {
        throw new Error('Cette réservation chevauche une autre réservation approuvée');
      }

      const updatedReservation = await reservationRepository.approve(reservationId, adminNotes);
      logger.info(`Réservation approuvée: ${reservationId}`);
      return updatedReservation;
    } catch (error) {
      logger.error('Erreur lors de l\'approbation de la réservation:', error);
      throw error;
    }
  }

  async rejectReservation(reservationId, adminNotes = null) {
    try {
      const reservation = await reservationRepository.findById(reservationId);
      
      if (!reservation) {
        throw new Error('Réservation non trouvée');
      }

      if (reservation.status !== 'PENDING') {
        throw new Error('Seules les réservations en attente peuvent être rejetées');
      }

      const updatedReservation = await reservationRepository.reject(reservationId, adminNotes);
      logger.info(`Réservation rejetée: ${reservationId}`);
      return updatedReservation;
    } catch (error) {
      logger.error('Erreur lors du rejet de la réservation:', error);
      throw error;
    }
  }
}

module.exports = new ReservationService();