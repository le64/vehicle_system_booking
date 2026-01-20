const Model = require('../models');

class VehicleRepository extends Model {
  constructor() {
    super('vehicles');
  }

  async create(vehicleData) {
    const vehicle = {
      registration_number: vehicleData.registrationNumber,
      brand: vehicleData.brand,
      model: vehicleData.model,
      type: vehicleData.type,
      status: vehicleData.status || 'available',
      image_url_1: vehicleData.imageUrl1 || null,
      image_url_2: vehicleData.imageUrl2 || null,
      image_url_3: vehicleData.imageUrl3 || null,
      created_at: new Date().toISOString()
    };

    return super.create(vehicle);
  }

  async findAvailableVehicles(startDate, endDate) {
    const sql = `
      SELECT v.* 
      FROM vehicles v
      WHERE v.status = 'available'
      AND v.id NOT IN (
        SELECT vehicle_id 
        FROM reservations 
        WHERE status IN ('APPROVED', 'PENDING')
        AND (
          (start_date <= ? AND end_date >= ?)
          OR (start_date <= ? AND end_date >= ?)
          OR (start_date >= ? AND end_date <= ?)
        )
      )
      ORDER BY v.brand, v.model
    `;

    return await this.db.all(sql, [
      endDate, startDate,
      startDate, endDate,
      startDate, endDate
    ]);
  }

  async updateStatus(id, status) {
    const validStatuses = ['available', 'maintenance', 'unavailable'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Statut invalide. Doit être l'un des suivants: ${validStatuses.join(', ')}`);
    }

    return this.update(id, { status });
  }

  async getVehiclesWithStats() {
    const sql = `
      SELECT 
        v.*,
        (SELECT COUNT(*) FROM reservations WHERE vehicle_id = v.id) as total_reservations,
        (SELECT COUNT(*) FROM reservations WHERE vehicle_id = v.id AND status = 'active') as active_reservations
      FROM vehicles v
      ORDER BY v.status, v.brand
    `;
    
    return await this.db.all(sql);
  }
}

module.exports = new VehicleRepository();