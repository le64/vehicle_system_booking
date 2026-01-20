const db = require('../app/config/database');
const logger = require('../app/utils/logger');

async function migrate() {
  try {
    logger.info('Démarrage des migrations...');

    // Création de la table des utilisateurs
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT CHECK(role IN ('ADMIN', 'EMPLOYEE')) DEFAULT 'EMPLOYEE',
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Création de la table des véhicules
    await db.run(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registration_number TEXT UNIQUE NOT NULL,
        brand TEXT NOT NULL,
        model TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT CHECK(status IN ('available', 'maintenance', 'unavailable')) DEFAULT 'available',
        image_url_1 TEXT,
        image_url_2 TEXT,
        image_url_3 TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Création de la table des réservations
    await db.run(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        vehicle_id INTEGER NOT NULL,
        reservation_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        purpose TEXT,
        status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED')) DEFAULT 'PENDING',
        admin_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        approved_at DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
      )
    `);

    // Création des indexes pour les performances
    await db.run('CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_reservations_vehicle_id ON reservations(vehicle_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations(reservation_date, start_time, end_time)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

    logger.info('Migrations terminées avec succès');
    process.exit(0);
  } catch (error) {
    logger.error('Erreur lors des migrations:', error);
    process.exit(1);
  }
}

migrate();
