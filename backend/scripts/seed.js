const bcrypt = require('bcryptjs');
const db = require('../app/config/database');
const logger = require('../app/utils/logger');

async function seed() {
  try {
    logger.info('Démarrage du seeding...');

    // Hacher les mots de passe
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const adminPassword = await bcrypt.hash('Admin123!', saltRounds);
    const employeePassword = await bcrypt.hash('Employee123!', saltRounds);

    // Insertion des utilisateurs
    await db.run(`
      INSERT OR IGNORE INTO users (email, password, first_name, last_name, role, is_active)
      VALUES 
        ('admin@organisation.com', ?, 'Admin', 'System', 'ADMIN', 1),
        ('employee1@organisation.com', ?, 'Jean', 'Dupont', 'EMPLOYEE', 1),
        ('employee2@organisation.com', ?, 'Marie', 'Martin', 'EMPLOYEE', 1)
    `, [adminPassword, employeePassword, employeePassword]);

    // Insertion des véhicules
    await db.run(`
      INSERT OR IGNORE INTO vehicles (registration_number, brand, model, type, status)
      VALUES 
        ('AB-123-CD', 'Peugeot', '308', 'Berline', 'available'),
        ('EF-456-GH', 'Renault', 'Clio', 'Compacte', 'available'),
        ('IJ-789-KL', 'Citroën', 'C3', 'Compacte', 'available'),
        ('MN-012-OP', 'Volkswagen', 'Golf', 'Berline', 'maintenance'),
        ('QR-345-ST', 'Toyota', 'Yaris', 'Compacte', 'available'),
        ('UV-678-WX', 'Ford', 'Focus', 'Berline', 'unavailable'),
        ('YZ-901-BC', 'Mercedes', 'Classe A', 'Berline', 'available'),
        ('DE-234-FG', 'BMW', 'Série 3', 'Berline', 'available'),
        ('HI-567-JK', 'Audi', 'A3', 'Berline', 'available'),
        ('LM-890-NO', 'Nissan', 'Qashqai', 'SUV', 'available')
    `);

    // Insertion de réservations de test
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 2);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekPlus1 = new Date();
    nextWeekPlus1.setDate(nextWeekPlus1.getDate() + 8);

    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const nextDayStr = nextDay.toISOString().split('T')[0];
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    const nextWeekPlus1Str = nextWeekPlus1.toISOString().split('T')[0];

    await db.run(`
      INSERT OR IGNORE INTO reservations (user_id, vehicle_id, reservation_date, start_time, end_time, purpose, status, admin_notes, approved_at)
      VALUES 
        (2, 1, ?, '09:00', '18:00', ?, 'PENDING', NULL, NULL),
        (3, 2, ?, '10:30', '17:00', ?, 'APPROVED', ?, datetime('now', '-1 day')),
        (2, 3, ?, '08:00', '16:00', ?, 'COMPLETED', ?, datetime('now', '-2 days')),
        (3, 4, ?, '12:00', '19:00', ?, 'PENDING', NULL, NULL),
        (2, 5, ?, '14:00', '20:00', ?, 'APPROVED', ?, datetime('now', '-3 days')),
        (3, 6, ?, '07:00', '14:00', ?, 'REJECTED', ?, datetime('now', '-2 days')),
        (2, 7, ?, '09:00', '18:00', ?, 'PENDING', NULL, NULL),
        (3, 8, ?, '10:00', '17:00', ?, 'CANCELLED', ?, NULL)
    `, [
      tomorrowStr, 'Réunion client',
      nextDayStr, 'Déplacement professionnel', 'Approuvé pour déplacement client',
      nextWeekStr, 'Formation', 'Formation effectuée normalement',
      nextWeekPlus1Str, 'Visite site',
      tomorrowStr, 'Transport', 'Visite fournisseur approuvée',
      nextDayStr, 'Déplacement', 'Véhicule indisponible à cette date',
      nextWeekStr, 'Réunion',
      nextWeekPlus1Str, 'Conférence', 'Annulée par l\'utilisateur'
    ]);

    logger.info('Seeding terminé avec succès');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du seeding:', error);
    process.exit(1);
  }
}

seed();
