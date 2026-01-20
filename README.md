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