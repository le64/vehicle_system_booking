const userRepository = require('../repositories/user.repository');
const vehicleRepository = require('../repositories/vehicle.repository');
const reservationRepository = require('../repositories/reservation.repository');
const logger = require('../utils/logger');

class AdminController {
  async getStats(req, res) {
    try {
      // Obtenir les statistiques
      const totalVehicles = await vehicleRepository.count();
      const availableVehicles = await vehicleRepository.count({ status: 'available' });
      const maintenanceVehicles = await vehicleRepository.count({ status: 'maintenance' });
      const unavailableVehicles = await vehicleRepository.count({ status: 'unavailable' });
      
      const totalUsers = await userRepository.count();
      const activeReservations = await reservationRepository.count({ status: 'active' });
      
      const stats = {
        totalVehicles,
        availableVehicles,
        maintenanceCount: maintenanceVehicles,
        unavailableCount: unavailableVehicles,
        totalUsers,
        activeReservations
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEmployeeStats(req, res) {
    try {
      // Statistiques pour les employés
      const totalVehicles = await vehicleRepository.count();
      const availableVehicles = await vehicleRepository.count({ status: 'available' });
      const userActiveReservations = await reservationRepository.count({ 
        user_id: req.user.id,
        status: 'active'
      });
      
      const stats = {
        totalVehicles,
        availableVehicles,
        activeReservations: userActiveReservations
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques employé:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, role } = req.query;
      const offset = (page - 1) * limit;

      const users = await userRepository.getUsersWithStats();
      
      // Filtrer par rôle si nécessaire
      let filtered = users;
      if (role) {
        filtered = users.filter(u => u.role === role);
      }

      // Paginer
      const paginatedUsers = filtered.slice(offset, offset + limit);
      
      // Transformer les données
      const mappedUsers = paginatedUsers.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        role: u.role,
        isActive: u.is_active,
        createdAt: u.created_at,
        totalReservations: u.total_reservations,
        activeReservations: u.active_reservations
      }));

      res.status(200).json({
        success: true,
        data: mappedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filtered.length
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createUser(req, res) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Vérifier que l'email n'existe pas
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Un utilisateur avec cet email existe déjà'
        });
      }

      const user = await userRepository.create({
        email,
        password,
        firstName,
        lastName,
        role: role || 'EMPLOYEE',
        isActive: true
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la création de l\'utilisateur:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, role, password } = req.body;

      // Construire l'objet de mise à jour
      const updateData = {};
      if (firstName) updateData.first_name = firstName;
      if (lastName) updateData.last_name = lastName;
      if (role) updateData.role = role;

      // Si le mot de passe est fourni, le hasher et le mettre à jour
      if (password) {
        await userRepository.updatePassword(id, password);
      }

      // Mettre à jour les autres champs
      if (Object.keys(updateData).length > 0) {
        await userRepository.update(id, updateData);
      }

      const user = await userRepository.findById(id);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async toggleUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      await userRepository.update(id, { is_active: isActive });

      const user = await userRepository.findById(id);

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isActive: user.is_active
        }
      });
    } catch (error) {
      logger.error('Erreur lors du changement de statut:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getVehicles(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const vehicles = await vehicleRepository.getVehiclesWithStats();

      // Filtrer par statut si nécessaire
      let filtered = vehicles;
      if (status) {
        filtered = vehicles.filter(v => v.status === status);
      }

      // Paginer
      const paginatedVehicles = filtered.slice(offset, offset + limit);

      // Transformer les données
      const mappedVehicles = paginatedVehicles.map(v => ({
        id: v.id,
        registrationNumber: v.registration_number,
        brand: v.brand,
        model: v.model,
        type: v.type,
        status: v.status,
        totalReservations: v.total_reservations,
        activeReservations: v.active_reservations
      }));

      res.status(200).json({
        success: true,
        data: mappedVehicles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filtered.length
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des véhicules:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createVehicle(req, res) {
    try {
      const { registrationNumber, brand, model, type, imageUrl1, imageUrl2, imageUrl3 } = req.body;

      // Vérifier que le numéro d'immatriculation n'existe pas
      const existingVehicle = await vehicleRepository.findOne({ registration_number: registrationNumber });
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          message: 'Un véhicule avec ce numéro d\'immatriculation existe déjà'
        });
      }

      const vehicle = await vehicleRepository.create({
        registrationNumber,
        brand,
        model,
        type,
        imageUrl1: imageUrl1 || null,
        imageUrl2: imageUrl2 || null,
        imageUrl3: imageUrl3 || null,
        status: 'available'
      });

      res.status(201).json({
        success: true,
        data: {
          id: vehicle.id,
          registrationNumber: vehicle.registration_number,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          imageUrl1: vehicle.image_url_1,
          imageUrl2: vehicle.image_url_2,
          imageUrl3: vehicle.image_url_3,
          status: vehicle.status
        },
        message: 'Véhicule créé avec succès'
      });
    } catch (error) {
      logger.error('Erreur lors de la création du véhicule:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      const { brand, model, type, status, imageUrl1, imageUrl2, imageUrl3 } = req.body;

      const updateData = {};
      if (brand) updateData.brand = brand;
      if (model) updateData.model = model;
      if (type) updateData.type = type;
      if (status) updateData.status = status;
      if (imageUrl1 !== undefined) updateData.image_url_1 = imageUrl1;
      if (imageUrl2 !== undefined) updateData.image_url_2 = imageUrl2;
      if (imageUrl3 !== undefined) updateData.image_url_3 = imageUrl3;

      await vehicleRepository.update(id, updateData);

      const vehicle = await vehicleRepository.findById(id);

      res.status(200).json({
        success: true,
        data: {
          id: vehicle.id,
          registrationNumber: vehicle.registration_number,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          imageUrl1: vehicle.image_url_1,
          imageUrl2: vehicle.image_url_2,
          imageUrl3: vehicle.image_url_3,
          status: vehicle.status
        },
        message: 'Véhicule mis à jour avec succès'
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du véhicule:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteVehicle(req, res) {
    try {
      const { id } = req.params;

      await vehicleRepository.delete(id);

      res.status(200).json({
        success: true,
        message: 'Véhicule supprimé avec succès'
      });
    } catch (error) {
      logger.error('Erreur lors de la suppression du véhicule:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getReservations(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let filters = {};
      if (status) filters.status = status;

      const reservations = await reservationRepository.getReservationsWithDetails(filters);

      // Paginer
      const paginatedReservations = reservations.slice(offset, offset + limit);

      // Transformer les données
      const mappedReservations = paginatedReservations.map(r => ({
        id: r.id,
        userId: r.user_id,
        vehicleId: r.vehicle_id,
        startDate: r.start_date,
        startTime: r.start_time,
        endDate: r.end_date,
        endTime: r.end_time,
        purpose: r.purpose,
        status: r.status,
        adminNotes: r.admin_notes,
        approvedAt: r.approved_at,
        createdAt: r.created_at,
        vehicle: {
          registrationNumber: r.registration_number,
          brand: r.brand,
          model: r.model,
          type: r.type
        },
        user: {
          firstName: r.first_name,
          lastName: r.last_name,
          email: r.email
        }
      }));

      res.status(200).json({
        success: true,
        data: mappedReservations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: reservations.length
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des réservations:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPendingReservations(req, res) {
    try {
      const reservations = await reservationRepository.findPendingReservations();
      
      res.status(200).json({
        success: true,
        data: reservations,
        message: `${reservations.length} réservation(s) en attente de validation`
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des réservations en attente:', error);
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

      const reservation = await reservationRepository.findById(id);
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Réservation non trouvée'
        });
      }

      if (reservation.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Seules les réservations en attente peuvent être approuvées'
        });
      }

      const updatedReservation = await reservationRepository.approve(id, adminNotes);
      logger.info(`Réservation approuvée: ${id}`);

      res.status(200).json({
        success: true,
        data: updatedReservation,
        message: 'Réservation approuvée avec succès'
      });
    } catch (error) {
      logger.error('Erreur lors de l\'approbation:', error);
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

      const reservation = await reservationRepository.findById(id);
      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Réservation non trouvée'
        });
      }

      if (reservation.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          message: 'Seules les réservations en attente peuvent être rejetées'
        });
      }

      const updatedReservation = await reservationRepository.reject(id, adminNotes);
      logger.info(`Réservation rejetée: ${id}`);

      res.status(200).json({
        success: true,
        data: updatedReservation,
        message: 'Réservation rejetée'
      });
    } catch (error) {
      logger.error('Erreur lors du rejet:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AdminController();
