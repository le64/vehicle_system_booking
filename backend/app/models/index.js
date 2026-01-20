const db = require('../config/database');

class Model {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = db;
  }

  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`;
    
    try {
      const result = await db.run(sql, values);
      return { id: result.id, ...data };
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`;
    return await db.get(sql, [id]);
  }

  async findOne(conditions) {
    const keys = Object.keys(conditions);
    const values = Object.values(conditions);
    const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
    
    const sql = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
    return await db.get(sql, values);
  }

  async findAll(conditions = {}, options = {}) {
    const { limit, offset, orderBy, order = 'ASC' } = options;
    let whereClause = '';
    let values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      values = Object.values(conditions);
      whereClause = `WHERE ${keys.map(key => `${key} = ?`).join(' AND ')}`;
    }

    let sql = `SELECT * FROM ${this.tableName} ${whereClause}`;
    
    if (orderBy) {
      sql += ` ORDER BY ${orderBy} ${order}`;
    }
    
    if (limit) {
      sql += ` LIMIT ${limit}`;
      if (offset) {
        sql += ` OFFSET ${offset}`;
      }
    }

    return await db.all(sql, values);
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    
    try {
      const result = await db.run(sql, [...values, id]);
      if (result.changes === 0) {
        throw new Error('Aucun enregistrement mis à jour');
      }
      return { id, ...data };
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await db.run(sql, [id]);
    
    if (result.changes === 0) {
      throw new Error('Aucun enregistrement supprimé');
    }
    
    return result;
  }

  async count(conditions = {}) {
    let whereClause = '';
    let values = [];

    if (Object.keys(conditions).length > 0) {
      const keys = Object.keys(conditions);
      values = Object.values(conditions);
      whereClause = `WHERE ${keys.map(key => `${key} = ?`).join(' AND ')}`;
    }

    const sql = `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause}`;
    const result = await db.get(sql, values);
    return result.count;
  }
}

module.exports = Model;