# Vehicle Booking Management System

Application web professionnelle de gestion de réservation de véhicules pour une organisation publique.

---

## 📖 Contexte de l'Application

### Problématique
Les organisations possédant un parc automobile important ont besoin d'une solution centralisée pour gérer les réservations de véhicules par leurs employés. Le système manuel était fastidieux et sources d'erreurs (doublons de réservations, conflits de planning, etc.).

### Objectif
Développer une plateforme web permettant :
- Aux **employés** de visualiser et réserver les véhicules disponibles de manière autonome
- Aux **administrateurs** de gérer le parc, valider les réservations et suivre l'utilisation
- De centraliser l'historique des réservations pour audit et reporting

### Public cible
- **Employés** : Utilisateurs finaux effectuant les réservations
- **Administrateurs** : Gestionnaires du parc automobile et valideurs de demandes

---

## 🛠️ Choix Techniques Effectués

### Backend - Express.js + Node.js

#### Justifications
- **Performance** : Runtime JavaScript côté serveur offrant une grande performance pour les opérations I/O
- **Écosystème** : NPM offre une grande richesse de packages
- **Scalabilité** : Architecture légère idéale pour des APIs RESTful
- **Facilité de déploiement** : Même stack que le frontend (JavaScript partout)

#### Architecture
- **Framework** : Express.js
- **Authentification** : JWT + Bcrypt
- **Validation** : Express Validator
- **Base de données** : SQLite
- **Structure** : Architecture en couches (Controllers/Services/Repositories)
- **Sécurité** : Helmet, CORS, Rate Limiting
- **Logs** : Winston avec rotation

### Frontend - React + TypeScript

#### Justifications
- **Typage statique** : Détection d'erreurs à la compilation, amélioration de la documentation
- **Composants réutilisables** : Facilite la maintenance et l'évolution de l'UI
- **Performance** : Optimisations automatiques (comme le code splitting)
- **Écosystème** : Richesse des bibliothèques disponibles (routing, state management, etc.)

#### Architecture
- **Framework** : React + TypeScript
- **UI** : Material-UI + TailwindCSS
- **Gestion d'état** : Context API
- **Formulaires** : React Hook Form
- **Dates** : Date-fns + MUI Date Pickers
- **Notifications** : Notistack
- **Charts** : Recharts

---

## 📋 Fonctionnalités

### 🛡️ Authentification & Rôles
- Inscription/Connexion sécurisée avec JWT
- Rôles : ADMIN / EMPLOYÉ
- Gestion des sessions

### 👥 Gestion des utilisateurs (Admin)
- CRUD utilisateurs
- Activation/Désactivation de comptes
- Attribution de rôles
- Historique des réservations

### 🚗 Gestion des véhicules (Admin)
- CRUD véhicules
- Statuts : Disponible / Maintenance / Indisponible
- Immatriculation unique
- Historique d'utilisation

### 📅 Réservations (Employé)
- Consultation des véhicules disponibles
- Réservation avec validation de période
- Annulation de réservations
- Historique personnel
- Recherche par période

### 📊 Tableau de bord Admin
- Statistiques en temps réel
- Vue d'ensemble du parc
- Activité récente
- Indicateurs clés

---

## 🗄️ Schéma de Base de Données

```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT CHECK(role IN ('ADMIN', 'EMPLOYEE')) DEFAULT 'EMPLOYEE',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration_number TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT CHECK(status IN ('available', 'maintenance', 'unavailable')) DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    purpose TEXT,
    status TEXT CHECK(status IN ('active', 'cancelled', 'completed')) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id) ON DELETE CASCADE
);
```

---

## 🚀 Installation et Démarrage

### ✅ Prérequis

- **Node.js** >= 14.x
- **npm** >= 6.x
- **Docker & Docker Compose** (optionnel, pour le déploiement)
- **SQLite3** (inclus dans le package npm)

### 📥 Option 1 : Démarrage avec Docker Compose (Recommandé)

Cette option est la plus simple et ne nécessite que Docker et Docker Compose.

```bash
# 1. Cloner le repository
git clone https://github.com/le64/vehicule_system_book.git
cd vehicule_system_book

# 2. Démarrer les conteneurs
docker-compose up --build

# 3. L'application est prête !
# Frontend  : http://localhost:3000
# Backend   : http://localhost:5000/api
```

**Arrêter l'application :**
```bash
docker-compose down
```

---

### 🔧 Option 2 : Démarrage Manuel (Développement)

#### Étape 1 : Préparation du Backend

```bash
# Naviguer vers le répertoire backend
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement (optionnel)
# Un fichier .env peut être créé pour personnaliser la configuration
# Voir .env.example si disponible

# Initialiser la base de données
npm run migrate

# Charger les données de test
npm run seed

# Démarrer le serveur backend
npm start
# Le serveur écoute sur http://localhost:5000
```

#### Étape 2 : Préparation du Frontend

Dans un **nouveau terminal** :

```bash
# Naviguer vers le répertoire frontend
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
# L'application est accessible à http://localhost:3000
```

---

### 🔑 Accès à l'Application

Une fois démarrée, accédez à l'application à l'adresse suivante :

**http://localhost:3000**

#### Comptes de Test Disponibles

Pour vous connecter et explorer l'application, veuillez consulter [CREDENTIALS.md](CREDENTIALS.md) qui contient :
- ✅ Les identifiants de test (admin et employés)
- ✅ Les véhicules pré-configurés
- ✅ Les réservations d'exemple
- ✅ Le flux de test recommandé

---

### 📋 Scripts Disponibles

#### Backend
```bash
npm start          # Démarrer le serveur (production)
npm run dev        # Démarrer en mode développement avec rechargement auto
npm run migrate    # Initialiser/mettre à jour la base de données
npm run seed       # Remplir la base de données avec des données de test
npm test           # Exécuter les tests
```

#### Frontend
```bash
npm run dev        # Démarrer le serveur Vite en développement
npm run build      # Compiler le projet pour la production
npm run preview    # Prévisualiser la build de production
```

---

### 🗂️ Structure du Projet

```
vehicle_booking_system/
├── backend/
│   ├── app/
│   │   ├── config/         # Configuration BD
│   │   ├── controllers/    # Logique métier
│   │   ├── middleware/     # Middlewares Express
│   │   ├── models/         # Schémas de données
│   │   ├── repositories/   # Couche d'accès aux données
│   │   ├── routes/         # Routes API
│   │   ├── services/       # Logique métier réutilisable
│   │   ├── utils/          # Utilitaires (logs, etc.)
│   │   └── validators/     # Validation des données
│   ├── scripts/            # Scripts de migration et seeding
│   ├── database/           # Base de données SQLite
│   ├── logs/               # Fichiers de logs
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React réutilisables
│   │   ├── config/         # Configuration (API, etc.)
│   │   ├── contexts/       # Context API
│   │   ├── pages/          # Pages/vues de l'application
│   │   ├── app.tsx         # Composant principal
│   │   └── main.tsx        # Point d'entrée
│   ├── package.json
│   └── vite.config.ts      # Configuration Vite
│
├── docker-compose.yml      # Configuration Docker
├── README.md               # Ce fichier
├── CREDENTIALS.md          # Identifiants de test
└── API_DOCUMENTATION.md    # Documentation API complète
```

---

### 🔐 Configuration Sécurité

Pour la production, modifiez les variables d'environnement :

```bash
# Backend (.env ou dans docker-compose.yml)
NODE_ENV=production
PORT=5000
JWT_SECRET=votre-cle-secrete-forte
BCRYPT_SALT_ROUNDS=12
DATABASE_PATH=/app/database/vehicle_booking.db
LOG_LEVEL=info
CORS_ORIGIN=votre-domaine.com
```

⚠️ **Important** : 
- Ne jamais committer de fichiers `.env` contenant des secrets
- Utiliser des variables d'environnement pour la production
- Modifier les mots de passe par défaut après le déploiement

---

### 🧪 Tester l'API

#### Avec cURL
```bash
# Connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@organisation.com","password":"Admin123!"}'

# Récupérer les véhicules (nécessite un token JWT)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/vehicles
```

#### Avec Postman
1. Importer l'API_DOCUMENTATION.md
2. Configurer la base URL : `http://localhost:5000/api`
3. Tester les endpoints disponibles

---

### 📊 Base de Données

La base de données SQLite est automatiquement créée et initialisée.

**Chemin par défaut** : `backend/database/vehicle_booking.db`

**Réinitialiser la BD** :
```bash
# Supprimer la base de données
rm backend/database/vehicle_booking.db

# Redémarrer l'application (elle recréera la BD)
npm start

# Recharger les données de test
npm run seed
```

---

## 🐛 Dépannage

### Le backend ne démarre pas

1. Vérifier que le port 5000 est disponible
2. Vérifier les permissions du répertoire `backend/database`
3. Consulter les logs : `backend/logs/`

### Le frontend affiche une erreur de connexion

1. Vérifier que le backend est en cours d'exécution
2. Vérifier l'URL dans `frontend/src/config/api.ts`
3. Vérifier les paramètres CORS

### Les données de test ne sont pas présentes

1. Exécuter : `npm run seed` dans le répertoire backend
2. Redémarrer le frontend

---

## 📚 Documentation Additionnelle

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** : Documentation complète des endpoints API
- **[CREDENTIALS.md](CREDENTIALS.md)** : Identifiants et comptes de test
- **Code source** : Commenté et facile à naviguer

---

## 📝 Licence

Tous droits réservés - 2026