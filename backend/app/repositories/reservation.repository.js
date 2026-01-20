const Model = require('../models');

class ReservationRepository extends Model {
  constructor() {
    super('reservations');
  }

  async create(reservationData) {
    const reservation = {
      user_id: reservationData.userId,
      vehicle_id: reservationData.vehicleId,
      reservation_date: reservationData.reservationDate,
      start_time: reservationData.startTime,
      end_time: reservationData.endTime,
      purpose: reservationData.purpose || null,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };

    return super.create(reservation);
  }

  async findOverlappingReservations(vehicleId, reservationDate, startTime, endTime, excludeId = null) {
    let sql = `
      SELECT * FROM reservations 
      WHERE vehicle_id = ?
      AND reservation_date = ?
      AND status IN ('APPROVED', 'PENDING')
      AND (
        (start_time < ? AND end_time > ?)
        OR (start_time <= ? AND end_time >= ?)
      )
    `;
    
    const params = [
      vehicleId,
      reservationDate,
      endTime, startTime,
      startTime, endTime
    ];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    return await this.db.all(sql, params);
  }

  async findOverlappingUserReservations(userId, reservationDate, startTime, endTime, excludeId = null) {
    let sql = `
      SELECT * FROM reservations 
      WHERE user_id = ?
      AND reservation_date = ?
      AND status IN ('APPROVED', 'PENDING')
      AND (
        (start_time < ? AND end_time > ?)
        OR (start_time <= ? AND end_time >= ?)
      )
    `;
    
    const params = [
      userId,
      reservationDate,
      endTime, startTime,
      startTime, endTime
    ];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    return await this.db.all(sql, params);
  }

  async findByUserId(userId, options = {}) {
    const { status, limit, offset } = options;
    let whereClause = 'WHERE r.user_id = ?';
    const params = [userId];

    if (status) {
      whereClause += ' AND r.status = ?';
      params.push(status);
    }

    let sql = `
      SELECT r.*, 
             v.registration_number,
             v.brand,
             v.model,
             v.type,
             u.first_name,
             u.last_name,
             u.email
      FROM reservations r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
    `;

    if (limit) {
      sql += ` LIMIT ${limit}`;
      if (offset) {
        sql += ` OFFSET ${offset}`;
      }
    }

    return await this.db.all(sql, params);
  }

  async cancel(id) {
    return this.update(id, { 
      status: 'CANCELLED',
      cancelled_at: new Date().toISOString() 
    });
  }

  async getReservationsWithDetails(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (filters.status) {
      whereClause += ' AND r.status = ?';
      params.push(filters.status);
    }

    if (filters.startDate) {
      whereClause += ' AND r.reservation_date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      whereClause += ' AND r.reservation_date <= ?';
      params.push(filters.endDate);
    }

    if (filters.vehicleId) {
      whereClause += ' AND r.vehicle_id = ?';
      params.push(filters.vehicleId);
    }

    if (filters.userId) {
      whereClause += ' AND r.user_id = ?';
      params.push(filters.userId);
    }

    const sql = `
      SELECT 
        r.*,
        v.registration_number,
        v.brand,
        v.model,
        v.type,
        v.status as vehicle_status,
        u.first_name,
        u.last_name,
        u.email,
        u.role
      FROM reservations r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT 100
    `;

    return await this.db.all(sql, params);
  }

  async approve(id, adminNotes = null) {
    return this.update(id, { 
      status: 'APPROVED',
      admin_notes: adminNotes,
      approved_at: new Date().toISOString() 
    });
  }

  async reject(id, adminNotes = null) {
    return this.update(id, { 
      status: 'REJECTED',
      admin_notes: adminNotes
    });
  }

  async findPendingReservations() {
    const sql = `
      SELECT 
        r.*,
        v.registration_number,
        v.brand,
        v.model,
        v.type,
        u.first_name,
        u.last_name,
        u.email
      FROM reservations r
      JOIN vehicles v ON r.vehicle_id = v.id
      JOIN users u ON r.user_id = u.id
      WHERE r.status = 'PENDING'
      ORDER BY r.created_at ASC
    `;
    
    return await this.db.all(sql);
  }
}

module.exports = new ReservationRepository();