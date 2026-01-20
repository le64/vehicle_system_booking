const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const logger = require('../utils/logger');

class AuthService {
  async register(userData) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      // Créer l'utilisateur
      const user = await userRepository.create(userData);

      // Générer le token JWT
      const token = this.generateToken(user);

      // Retourner les données de l'utilisateur (sans mot de passe)
      const userResponse = this.sanitizeUser(user);
      
      return {
        user: userResponse,
        token
      };
    } catch (error) {
      logger.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Trouver l'utilisateur
      const user = await userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier si le compte est actif
      if (!user.is_active) {
        throw new Error('Ce compte est désactivé. Contactez un administrateur.');
      }

      // Vérifier le mot de passe
      const isValidPassword = await userRepository.verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Générer le token JWT
      const token = this.generateToken(user);

      // Retourner les données de l'utilisateur (sans mot de passe)
      const userResponse = this.sanitizeUser(user);
      
      return {
        user: userResponse,
        token
      };
    } catch (error) {
      logger.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  }

  sanitizeUser(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userRepository.findById(decoded.id);
      
      if (!user || !user.is_active) {
        throw new Error('Utilisateur non trouvé ou compte désactivé');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error('Token invalide');
    }
  }
}

module.exports = new AuthService();