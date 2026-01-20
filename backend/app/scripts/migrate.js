const db = require('../config/database');
const logger = require('../utils/logger');

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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Vérifier si la table réservations existe et a la bonne structure
    const checkReservations = await db.all("PRAGMA table_info(reservations)");
    
    if (checkReservations.length > 0) {
      // Table existe, vérifier les colonnes
      const columnNames = checkReservations.map(col => col.name);
      
      // Ajouter les colonnes manquantes
      if (!columnNames.includes('reservation_date')) {
        try {
          await db.run(`ALTER TABLE reservations ADD COLUMN reservation_date TEXT`);
          logger.info('Colonne reservation_date ajoutée');
        } catch (e) { /* colonne existe déjà */ }
      }
      
      if (!columnNames.includes('start_time')) {
        try {
          await db.run(`ALTER TABLE reservations ADD COLUMN start_time TEXT`);
          logger.info('Colonne start_time ajoutée');
        } catch (e) { /* colonne existe déjà */ }
      }
      
      if (!columnNames.includes('end_time')) {
        try {
          await db.run(`ALTER TABLE reservations ADD COLUMN end_time TEXT`);
          logger.info('Colonne end_time ajoutée');
        } catch (e) { /* colonne existe déjà */ }
      }
      
      if (!columnNames.includes('admin_notes')) {
        try {
          await db.run(`ALTER TABLE reservations ADD COLUMN admin_notes TEXT`);
          logger.info('Colonne admin_notes ajoutée');
        } catch (e) { /* colonne existe déjà */ }
      }
      
      if (!columnNames.includes('approved_at')) {
        try {
          await db.run(`ALTER TABLE reservations ADD COLUMN approved_at DATETIME`);
          logger.info('Colonne approved_at ajoutée');
        } catch (e) { /* colonne existe déjà */ }
      }
    } else {
      // Créer la table réservations neuve
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
    }

    // Vérifier et ajouter les colonnes manquantes dans vehicles
    const checkVehicles = await db.all("PRAGMA table_info(vehicles)");
    const vehicleColumns = checkVehicles.map(col => col.name);
    
    if (!vehicleColumns.includes('image_url_1')) {
      try {
        await db.run(`ALTER TABLE vehicles ADD COLUMN image_url_1 TEXT`);
        logger.info('Colonne image_url_1 ajoutée');
      } catch (e) { /* colonne existe déjà */ }
    }
    
    if (!vehicleColumns.includes('image_url_2')) {
      try {
        await db.run(`ALTER TABLE vehicles ADD COLUMN image_url_2 TEXT`);
        logger.info('Colonne image_url_2 ajoutée');
      } catch (e) { /* colonne existe déjà */ }
    }
    
    if (!vehicleColumns.includes('image_url_3')) {
      try {
        await db.run(`ALTER TABLE vehicles ADD COLUMN image_url_3 TEXT`);
        logger.info('Colonne image_url_3 ajoutée');
      } catch (e) { /* colonne existe déjà */ }
    }

    // Création des indexes pour les performances
    await db.run('CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_reservations_vehicle_id ON reservations(vehicle_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_reservations_date_time ON reservations(reservation_date, start_time, end_time)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');

    logger.info('Migrations terminées avec succès');
  } catch (error) {
    logger.error('Erreur lors des migrations:', error);
    process.exit(1);
  }
}

migrate();