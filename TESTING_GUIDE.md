# Guide de Test - Système de Gestion de Réservation de Véhicules

## État Actuel

L'application est complète avec :
- **Backend** : Express.js, JWT, SQLite, Architecture en couches
- **Frontend** : React + TypeScript, Material-UI, React Router
- **Rôles** : ADMIN (gestion) et EMPLOYEE (utilisateurs)

## Démarrage de l'Application

### Backend
```bash
cd backend
npm start
# Le serveur démarre sur http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev
# L'application est accessible sur http://localhost:3000
```

## Comptes de Test

### Admin
- **Email** : admin@organisation.com
- **Mot de passe** : Admin123!
- **Rôle** : ADMIN

### Employés
- **Email** : employee1@organisation.com / employee2@organisation.com
- **Mot de passe** : Employee123!
- **Rôle** : EMPLOYEE

## Fonctionnalités par Rôle

### EMPLOYEE (Utilisateurs)
1. **Tableau de bord** (`/dashboard`)
   - Vue d'ensemble des statistiques
   - Réservations récentes
   - Accès rapide aux fonctionnalités

2. **Véhicules** (`/vehicles`)
   - Liste des véhicules disponibles
   - Filtre par statut et type
   - Réservation avec dates et motif
   - Validation automatique des chevauchements

3. **Réservations** (`/reservations`)
   - Historique complet des réservations
   - Filtrage par statut (active, annulée, terminée)
   - Annulation de réservations futures
   - Détails avec dates et motif

4. **Profil** (`/profile`)
   - Affichage des informations personnelles
   - Modification des données (prénom, nom)
   - Déconnexion

### ADMIN
**Toutes les fonctionnalités des employés +**

1. **Tableau de bord Admin** (`/admin/dashboard`)
   - Statistiques complètes du système
   - Nombre total de véhicules
   - Véhicules disponibles/en maintenance/indisponibles
   - Nombre d'utilisateurs actifs
   - Réservations actives

2. **Gestion des Utilisateurs** (`/admin/users`)
   - Liste complète des utilisateurs
   - CRUD (Créer, Lire, Mettre à jour, Supprimer)
   - Attribution de rôles (ADMIN/EMPLOYEE)
   - Activation/Désactivation de comptes
   - Statistiques d'utilisation par utilisateur

3. **Gestion des Véhicules** (`/admin/vehicles`)
   - Liste complète du parc automobile
   - CRUD sur les véhicules
   - Changement de statut (disponible/maintenance/indisponible)
   - Immatriculation unique
   - Statistiques d'utilisation

4. **Gestion des Réservations** (`/admin/dashboard` - bientôt accessible via un menu)
   - Vue complète de toutes les réservations
   - Filtrage par statut et date
   - Voir les détails et utilisateurs

## Architecture Backend

```
backend/app/
├── config/
│   └── database.js          # Connexion SQLite
├── controllers/
│   ├── auth.controller.js   # Authentification
│   ├── vehicle.controller.js # Gestion véhicules
│   ├── reservation.controller.js # Réservations
│   └── admin.controller.js  # Admin (NEW)
├── services/
│   ├── auth.service.js      # Logique auth
│   └── reservation.service.js # Logique réservations
├── repositories/
│   ├── user.repository.js   # Accès données users
│   ├── vehicle.repository.js # Accès données véhicules
│   └── reservation.repository.js # Accès données réservations
├── routes/
│   ├── auth.routes.js       # POST /register, /login, GET /me
│   ├── vehicle.routes.js    # Véhicules
│   ├── reservation.routes.js # Réservations
│   ├── admin.routes.js      # Admin (UPDATED)
│   └── user.routes.js       # Utilisateurs
├── middleware/
│   ├── auth.middleware.js   # JWT verify + role authorize
│   └── validation.middleware.js # Validation express-validator
├── validators/
│   └── auth.validator.js    # Règles de validation
├── models/
│   └── index.js             # Base Model class (UPDATED)
├── scripts/
│   ├── migrate.js           # Création tables
│   └── seed.js              # Données test
└── utils/
    └── logger.js            # Winston logger
```

## Architecture Frontend

```
frontend/src/
├── pages/
│   ├── Login.tsx            # Connexion
│   ├── Register.tsx         # Inscription
│   ├── Dashboard.tsx        # Tableau de bord
│   ├── Vehicles.tsx         # Liste véhicules
│   ├── Reservations.tsx     # Mes réservations (NEW)
│   ├── Profile.tsx          # Profil utilisateur (NEW)
│   └── admin/
│       ├── Dashboard.tsx    # Admin dashboard
│       ├── Users.tsx        # Gestion utilisateurs
│       └── Vehicles.tsx     # Gestion véhicules (NEW)
├── components/
│   ├── Layout.tsx           # Navbar + layout
│   └── PrivateRoute.tsx     # Protection routes
├── contexts/
│   └── AuthContext.tsx      # État authentification
├── config/
│   └── api.ts               # Axios config
├── app.tsx                  # Router
└── main.tsx                 # Entry point
```

## Endpoints API

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Données utilisateur (protected)

### Véhicules
- `GET /api/vehicles/available` - Véhicules disponibles (public)
- `GET /api/vehicles` - Tous les véhicules (protected)
- `GET /api/vehicles/:id` - Détails véhicule (protected)
- `POST /api/vehicles` - Créer (admin only)
- `PUT /api/vehicles/:id` - Mettre à jour (admin only)
- `DELETE /api/vehicles/:id` - Supprimer (admin only)
- `PUT /api/vehicles/:id/status` - Changer statut (admin only)

### Réservations
- `POST /api/reservations` - Créer réservation (protected)
- `GET /api/reservations/my-reservations` - Mes réservations (protected)
- `GET /api/reservations/:id` - Détails réservation (protected)
- `PUT /api/reservations/:id/cancel` - Annuler réservation (protected)

### Admin
- `GET /api/admin/stats` - Statistiques (admin only)
- `GET /api/admin/users` - Liste utilisateurs (admin only)
- `POST /api/admin/users` - Créer utilisateur (admin only)
- `PUT /api/admin/users/:id` - Mettre à jour utilisateur (admin only)
- `PUT /api/admin/users/:id/status` - Changer statut (admin only)
- `GET /api/admin/vehicles` - Liste véhicules (admin only)
- `POST /api/admin/vehicles` - Créer véhicule (admin only)
- `PUT /api/admin/vehicles/:id` - Mettre à jour véhicule (admin only)
- `DELETE /api/admin/vehicles/:id` - Supprimer véhicule (admin only)
- `GET /api/admin/reservations` - Toutes les réservations (admin only)

## Validation

### Inscription/Connexion
- **Email** : Format valide
- **Mot de passe** : Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
- **Prénom/Nom** : Minimum 2 caractères

### Réservations
- Véhicule doit être disponible
- Pas de chevauchement avec d'autres réservations
- Date de début avant date de fin
- Dates futures uniquement

### Sécurité
- JWT tokens (7 jours d'expiration)
- Bcryptjs pour les mots de passe (12 rounds)
- CORS activé (localhost:3000)
- Rate limiting (100 req/15 min)
- Helmet pour les headers HTTP

## Données de Test

### Utilisateurs
- 1 ADMIN
- 2 EMPLOYEES

### Véhicules
- 10 véhicules
  - 7 disponibles
  - 1 en maintenance
  - 1 indisponible

### Réservations
- 3 réservations de test

## Scénarios de Test Recommandés

### 1. Authentification
```
1. Se connecter avec admin@organisation.com / Admin123!
2. Vérifier le token JWT dans localStorage
3. Se déconnecter
4. Créer un nouveau compte en tant que nouvel employé
5. Se connecter avec ce nouveau compte
```

### 2. Réservation (Employee)
```
1. Aller sur /vehicles
2. Consulter la liste des véhicules disponibles
3. Filtrer par type ou statut
4. Cliquer sur "Réserver" sur un véhicule
5. Sélectionner dates et motif
6. Vérifier que le système détecte les chevauchements
7. Confirmer la réservation
8. Aller sur /reservations pour voir l'historique
```

### 3. Gestion Admin
```
1. Se connecter avec admin@organisation.com
2. Aller sur /admin/users
   - Créer un nouvel utilisateur
   - Modifier un utilisateur existant
   - Activer/Désactiver un utilisateur
3. Aller sur /admin/vehicles
   - Créer un nouveau véhicule
   - Modifier un véhicule (statut, marque, modèle)
   - Supprimer un véhicule
4. Aller sur /admin/dashboard
   - Vérifier les statistiques
   - Voir le taux d'utilisation
```

### 4. Gestion de Profil
```
1. Se connecter avec n'importe quel compte
2. Aller sur /profile
3. Voir les informations personnelles
4. Modifier prénom/nom
5. Vérifier la mise à jour
```

## Notes de Développement

### Fichiers Créés/Modifiés

**Backend (Nouveaux)**
- `app/controllers/admin.controller.js` - Contrôleur admin complet

**Backend (Modifiés)**
- `app/routes/admin.routes.js` - Routes admin étendues
- `app/controllers/vehicle.controller.js` - Implémentation complète
- `app/models/index.js` - Ajout de `this.db` pour les repositories

**Frontend (Nouveaux)**
- `src/pages/Reservations.tsx` - Historique des réservations
- `src/pages/Profile.tsx` - Profil utilisateur
- `src/pages/admin/Vehicles.tsx` - Gestion des véhicules

**Frontend (Modifiés)**
- `src/app.tsx` - Routes additionnelles
- `src/components/Layout.tsx` - Navigation améliorée

## Prochaines Améliorations Possibles

1. **Authentification**
   - Réinitialisation de mot de passe
   - Authentification 2FA
   - Intégration OAuth (Google, Microsoft)

2. **Réservations**
   - Système de notations/commentaires
   - Export PDF des réservations
   - Rappels par email
   - Historique des modifications

3. **Gestion**
   - Dashboard analytique avancé
   - Rapports détaillés
   - Système de coûts/facturation
   - Maintenance préventive

4. **Interface**
   - Calendrier interactif
   - Carte des véhicules
   - Mode sombre
   - Responsive mobile amélioré

5. **Sécurité**
   - Audit logs
   - Chiffrement des données sensibles
   - Authentification LDAP

## Dépannage

### Le backend refuse les connexions
```
Vérifier : NODE_ENV=development, CORS_ORIGIN=http://localhost:3000
```

### Les réservations ne se créent pas
```
Vérifier :
1. Le véhicule est disponible
2. Les dates ne se chevauchent pas
3. La date de début est dans le futur
4. Le token JWT est valide
```

### Les données ne s'affichent pas
```
Vérifier :
1. Le backend est en cours d'exécution (npm start)
2. La base de données SQLite existe
3. Les migrations ont été exécutées (npm run migrate)
4. Les données de test ont été chargées (npm run seed)
```

## Support

Pour toute question ou problème, consultez les logs :
- **Backend** : `backend/logs/combined.log` et `error.log`
- **Frontend** : Console du navigateur (F12 > Console)
