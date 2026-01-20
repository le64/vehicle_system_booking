const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const logger = require('./app/utils/logger');
require('dotenv').config();

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Limiteur de requêtes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});
app.use('/api/', limiter);

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés en tant que fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logger des requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Import des routes
const authRoutes = require('./app/routes/auth.routes');
const userRoutes = require('./app/routes/user.routes');
const vehicleRoutes = require('./app/routes/vehicle.routes');
const reservationRoutes = require('./app/routes/reservation.routes');
const adminRoutes = require('./app/routes/admin.routes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Gestion des erreurs 404
app.use((req, res) => {
  logger.warn(`Route non trouvée: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  logger.error('Erreur serveur:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erreur interne du serveur';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Serveur démarré sur le port ${PORT}`);
  logger.info(`Environnement: ${process.env.NODE_ENV}`);
});