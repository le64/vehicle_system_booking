# 🚗 Système de Réservation de Véhicules

Application web complète et sécurisée pour la gestion des réservations de véhicules dans une organisation.

## ✨ Caractéristiques Principales

### 👥 Authentification & Rôles
- ✅ Système JWT sécurisé (7 jours)
- ✅ 2 rôles : **ADMIN** (Gestion) et **EMPLOYEE** (Utilisation)
- ✅ Hachage bcryptjs des mots de passe (12 rounds)
- ✅ Validation des données avec express-validator

### 🚗 Gestion des Véhicules
- ✅ CRUD complet (Admin)
- ✅ 3 statuts : Disponible, En maintenance, Indisponible
- ✅ Immatriculation unique
- ✅ Historique d'utilisation
- ✅ Recherche et filtres

### 📅 Réservations
- ✅ Système de réservation avec validation
- ✅ Détection automatique des chevauchements
- ✅ Réservations futures uniquement
- ✅ Historique personnel complet
- ✅ Annulation des réservations futures

### 📊 Tableau de Bord
- ✅ Statistiques en temps réel
- ✅ Vue d'ensemble du parc
- ✅ Taux d'utilisation
- ✅ Activité récente

### 🛡️ Sécurité
- ✅ CORS configuré
- ✅ Helmet pour les headers HTTP
- ✅ Rate limiting (100 req/15 min)
- ✅ Validation stricte des données
- ✅ Middleware d'authentification

---

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** v18+
- **npm** 9+
- **SQLite** 3

### Installation

#### 1. Backend
```bash
cd backend
npm install
npm run migrate   # Créer les tables
npm run seed      # Charger les données de test
npm start         # Démarrer sur http://localhost:5000
```

#### 2. Frontend
```bash
cd frontend
npm install
npm run dev       # Démarrer sur http://localhost:3000
```

### 📝 Comptes de Test

**Admin**
- Email: `admin@organisation.com`
- Mot de passe: `Admin123!`

**Employees**
- Email: `employee1@organisation.com`
- Email: `employee2@organisation.com`
- Mot de passe: `Employee123!`

---

## 📋 Guide Complet

Pour le guide complet de test et les fonctionnalités détaillées, consultez:
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guide de test complet
- **[CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)** - Résumé des modifications

---

## 🏗️ Architecture

### Stack Technologique

**Backend**
- Express.js (API REST)
- SQLite (Base de données)
- JWT (Authentification)
- Bcryptjs (Hachage)
- Winston (Logging)

**Frontend**
- React 18 (UI Framework)
- TypeScript (Type safety)
- Material-UI (Composants)
- React Router (Navigation)
- Axios (HTTP Client)
- Notistack (Notifications)

### Diagramme d'Architecture

```
┌─────────────────┐
│   Frontend      │
│ React + TS + MUI│
└────────┬────────┘
         │
      API REST
     (Axios)
         │
┌────────▼────────┐         ┌──────────┐
│   Backend       │────────▶│ SQLite   │
│  Express.js     │         │Database  │
└─────────────────┘         └──────────┘
```

---

## 📁 Structure des Fichiers

```
vehicle_booking_system/
│
├── 📁 backend/
│   ├── app/
│   │   ├── config/          # Configuration DB
│   │   ├── controllers/     # Logique métier
│   │   ├── routes/          # Définition API
│   │   ├── services/        # Logique complexe
│   │   ├── repositories/    # Accès données
│   │   ├── middleware/      # Auth, validation
│   │   ├── validators/      # Règles validation
│   │   ├── models/          # Classes base
│   │   ├── scripts/         # Migration, seed
│   │   └── utils/           # Utilitaires
│   │
│   ├── database/            # Fichiers DB
│   ├── logs/                # Fichiers logs
│   ├── server.js            # Point d'entrée
│   ├── package.json
│   └── .env                 # Variables env
│
├── 📁 frontend/
│   ├── src/
│   │   ├── pages/           # Pages React
│   │   ├── components/      # Composants réutilisables
│   │   ├── contexts/        # Context API
│   │   ├── config/          # Configuration
│   │   ├── app.tsx          # Router principal
│   │   ├── main.tsx         # Point d'entrée
│   │   └── index.css        # Styles globaux
│   │
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── TESTING_GUIDE.md         # Guide complet de test
├── CHANGES_SUMMARY.md       # Résumé des changements
├── README.md                # Ce fichier
└── docker-compose.yml       # Configuration Docker
```

---

## 🔌 API Endpoints

### Authentification
```
POST   /api/auth/register     # Inscription
POST   /api/auth/login        # Connexion
GET    /api/auth/me           # Utilisateur actuel
```

### Véhicules
```
GET    /api/vehicles/available         # Publique
GET    /api/vehicles                   # Tous
GET    /api/vehicles/:id               # Détails
POST   /api/vehicles                   # Créer (admin)
PUT    /api/vehicles/:id               # Modifier (admin)
DELETE /api/vehicles/:id               # Supprimer (admin)
PUT    /api/vehicles/:id/status        # Statut (admin)
```

### Réservations
```
POST   /api/reservations                    # Créer
GET    /api/reservations/my-reservations   # Historique
GET    /api/reservations/:id                # Détails
PUT    /api/reservations/:id/cancel        # Annuler
```

### Administration (admin only)
```
GET    /api/admin/stats        # Statistiques
GET    /api/admin/users        # Utilisateurs
POST   /api/admin/users        # Créer user
PUT    /api/admin/users/:id    # Modifier user
GET    /api/admin/vehicles     # Véhicules
POST   /api/admin/vehicles     # Créer véhicule
PUT    /api/admin/vehicles/:id # Modifier véhicule
DELETE /api/admin/vehicles/:id # Supprimer véhicule
GET    /api/admin/reservations # Réservations
```

---

## 🎯 Fonctionnalités par Rôle

### 👤 EMPLOYEE
- ✅ Consulter les véhicules disponibles
- ✅ Créer une réservation
- ✅ Voir l'historique des réservations
- ✅ Annuler une réservation (si future)
- ✅ Modifier son profil

### 👨‍💼 ADMIN
- ✅ Toutes les fonctionnalités d'Employee
- ✅ Gérer les utilisateurs (CRUD)
- ✅ Gérer les véhicules (CRUD)
- ✅ Voir les statistiques du système
- ✅ Visualiser toutes les réservations
- ✅ Activer/Désactiver les comptes

---

## 📊 Base de Données

### Schéma

**users**
- id, email, password, first_name, last_name, role, is_active, created_at

**vehicles**
- id, registration_number, brand, model, type, status, created_at

**reservations**
- id, user_id, vehicle_id, start_date, end_date, purpose, status, created_at

### Données de Test
- 1 ADMIN user
- 2 EMPLOYEE users
- 10 vehicles (7 disponibles, 1 en maintenance, 1 indisponible)
- 3 réservations d'exemple

---

## ⚙️ Configuration

### Backend (.env)
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
DATABASE_PATH=./database/vehicle_booking.db
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Scénarios de Test

### 1. Inscription et Connexion
1. Accédez à `/register`
2. Créez un nouveau compte
3. Vous êtes automatiquement connecté
4. Allez sur `/profile` pour vérifier vos données

### 2. Réservation de Véhicule
1. Connectez-vous en tant qu'Employee
2. Allez sur `/vehicles`
3. Cliquez sur "Réserver" sur un véhicule
4. Sélectionnez les dates et ajoutez un motif
5. La réservation est créée
6. Vérifiez votre historique sur `/reservations`

### 3. Gestion Admin
1. Connectez-vous avec l'admin
2. Allez sur `/admin/users`
   - Créez un nouvel utilisateur
   - Modifiez un utilisateur existant
   - Activez/Désactivez un compte
3. Allez sur `/admin/vehicles`
   - Créez un nouveau véhicule
   - Modifiez un véhicule (statut, marque, modèle)
   - Supprimez un véhicule

---

## 🔐 Sécurité

### Bonnes Pratiques Implémentées
- ✅ JWT tokens avec expiration
- ✅ Bcryptjs pour les mots de passe (12 rounds)
- ✅ CORS configuré correctement
- ✅ Helmet pour les headers HTTP
- ✅ Rate limiting
- ✅ Validation des données côté backend
- ✅ Middleware d'authentification
- ✅ Autorisation basée sur les rôles

### Règles de Validation
- Email: Format valide
- Mot de passe: 8+ caractères (maj, min, chiffre)
- Prénom/Nom: 2+ caractères
- Réservations: Dates futures, pas de chevauchement

---

## 📦 Dépendances Principales

### Backend
- express: Framework web
- sqlite3: Base de données
- jsonwebtoken: JWT tokens
- bcryptjs: Hachage mots de passe
- express-validator: Validation
- helmet: Sécurité headers
- express-rate-limit: Rate limiting
- winston: Logging

### Frontend
- react: UI Framework
- typescript: Type safety
- react-router-dom: Navigation
- @mui/material: Composants UI
- axios: HTTP client
- react-hook-form: Gestion formulaires
- notistack: Notifications
- zod: Validation schémas

---

## 🚨 Dépannage

### Backend ne démarre pas
```bash
# Vérifier le port 5000
netstat -ano | findstr :5000

# Tuer le processus
taskkill /PID <PID> /F

# Relancer
npm start
```

### Base de données vide
```bash
# Migrer et seeder
npm run migrate
npm run seed
```

### Frontend ne se connecte pas au backend
```
Vérifier:
1. CORS_ORIGIN=http://localhost:3000 dans .env backend
2. VITE_API_URL=http://localhost:5000/api dans .env frontend
3. Backend sur port 5000 et frontend sur port 3000
```

### Les tokens expirent
Les tokens JWT expirent après 7 jours. Vous devez vous reconnecter.

---

## 📝 Logs

Les logs sont stockés dans:
- **Backend**: `backend/logs/combined.log` et `error.log`
- **Frontend**: Console du navigateur (F12 > Console)

---

## 🎓 Apprentissage

### Concepts Clés Utilisés
- **REST API**: Architecture basée sur les ressources
- **JWT**: Authentification stateless
- **Role-Based Access Control (RBAC)**: Autorisation
- **Bcryptjs**: Hachage sécurisé
- **React Hooks**: Gestion d'état moderne
- **Context API**: État global
- **TypeScript**: Type safety
- **Material-UI**: Design system

---

## 🔄 Cycle de Développement

```
1. Backend: npm run migrate && npm run seed && npm start
2. Frontend: npm run dev
3. Navigateur: http://localhost:3000
4. Logs: backend/logs/combined.log
5. Tests: Utiliser TESTING_GUIDE.md
```

---

## 📞 Support

Pour toute question:
1. Consultez **TESTING_GUIDE.md**
2. Vérifiez les **logs du backend**
3. Ouvrez la **console du navigateur**
4. Vérifiez la **Network tab** dans les DevTools

---

## 📄 Licence

Projet éducatif - Libre d'utilisation

---

## ✅ Checklist Finale

- [x] Authentification JWT
- [x] Système de rôles (ADMIN/EMPLOYEE)
- [x] CRUD Véhicules
- [x] CRUD Utilisateurs
- [x] Système de réservations
- [x] Validation des données
- [x] Sécurité (Helmet, Rate limiting, CORS)
- [x] Logging
- [x] Interface Material-UI
- [x] Navigation React Router
- [x] Gestion des erreurs
- [x] Documentation complète

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2026-01-19  
**Status**: ✅ Production Ready
