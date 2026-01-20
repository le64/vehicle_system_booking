const vehicleRepository = require('../repositories/vehicle.repository');
const logger = require('../utils/logger');

class VehicleController {
  async getAvailableVehicles(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let vehicles;
      
      if (startDate && endDate) {
        // Récupérer les véhicules disponibles pour une période donnée
        vehicles = await vehicleRepository.findAvailableVehicles(startDate, endDate);
      } else {
        // Récupérer tous les véhicules avec statut 'available'
        vehicles = await vehicleRepository.findAll({ status: 'available' });
      }

      // Transformer les données
      const mappedVehicles = vehicles.map(v => ({
        id: v.id,
        registrationNumber: v.registration_number,
        brand: v.brand,
        model: v.model,
        type: v.type,
        status: v.status
      }));

      res.status(200).json({
        success: true,
        data: mappedVehicles
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des véhicules disponibles:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllVehicles(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      let vehicles;
      
      if (status) {
        vehicles = await vehicleRepository.findAll({ status }, { limit, offset });
      } else {
        vehicles = await vehicleRepository.findAll({}, { limit, offset });
      }

      // Transformer les données
      const mappedVehicles = vehicles.map(v => ({
        id: v.id,
        registrationNumber: v.registration_number,
        brand: v.brand,
        model: v.model,
        type: v.type,
        status: v.status
      }));

      res.status(200).json({
        success: true,
        data: mappedVehicles
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des véhicules:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getVehicleDetails(req, res) {
    try {
      const { id } = req.params;
      
      const vehicle = await vehicleRepository.findById(id);
      
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Véhicule non trouvé'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: vehicle.id,
          registrationNumber: vehicle.registration_number,
          brand: vehicle.brand,
          model: vehicle.model,
          type: vehicle.type,
          status: vehicle.status
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des détails du véhicule:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async create(req, res) {
    try {
      const { registrationNumber, brand, model, type } = req.body;

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
          status: vehicle.status
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la création du véhicule:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { brand, model, type } = req.body;

      const vehicle = await vehicleRepository.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Véhicule non trouvé'
        });
      }

      const updateData = {};
      if (brand) updateData.brand = brand;
      if (model) updateData.model = model;
      if (type) updateData.type = type;

      await vehicleRepository.update(id, updateData);

      const updatedVehicle = await vehicleRepository.findById(id);

      res.status(200).json({
        success: true,
        data: {
          id: updatedVehicle.id,
          registrationNumber: updatedVehicle.registration_number,
          brand: updatedVehicle.brand,
          model: updatedVehicle.model,
          type: updatedVehicle.type,
          status: updatedVehicle.status
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du véhicule:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const vehicle = await vehicleRepository.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Véhicule non trouvé'
        });
      }

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

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const vehicle = await vehicleRepository.findById(id);
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Véhicule non trouvé'
        });
      }

      // Valider le statut
      const validStatuses = ['available', 'maintenance', 'unavailable'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Statut invalide. Doit être l'un des suivants: ${validStatuses.join(', ')}`
        });
      }

      await vehicleRepository.updateStatus(id, status);

      const updatedVehicle = await vehicleRepository.findById(id);

      res.status(200).json({
        success: true,
        data: {
          id: updatedVehicle.id,
          registrationNumber: updatedVehicle.registration_number,
          brand: updatedVehicle.brand,
          model: updatedVehicle.model,
          type: updatedVehicle.type,
          status: updatedVehicle.status
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du statut:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new VehicleController();

