const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, '../../database/vehicle_booking.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Erreur de connexion à la base de données:', err.message);
      } else {
        logger.info('Connecté à la base de données SQLite');
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          logger.error('Erreur SQL:', err.message);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          logger.error('Erreur SQL:', err.message);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          logger.error('Erreur SQL:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = new Database();