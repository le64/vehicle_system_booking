# 🔐 Informations de Connexion - Comptes Existants

Ce document contient les identifiants des comptes de test pré-configurés dans l'application. Ces comptes sont créés automatiquement lors du démarrage initial de l'application.

---

## 📌 Important

⚠️ **Sécurité** : Ces identifiants sont fournis à titre d'exemple de test. Pour une utilisation en production, il est **fortement recommandé** de :
- Modifier les mots de passe par défaut
- Créer des nouveaux comptes administrateur
- Supprimer les comptes de test
- Utiliser des variables d'environnement pour les données sensibles

---

## 👤 Comptes de Test Disponibles

### 1. **Compte Administrateur**

| Champ | Valeur |
|-------|--------|
| **Email** | `admin@organisation.com` |
| **Mot de passe** | `Admin123!` |
| **Rôle** | ADMIN |
| **Accès** | Gestion complète de l'application |

**Permissions Admin :**
- ✅ Gestion des utilisateurs (CRUD)
- ✅ Gestion des véhicules (CRUD)
- ✅ Approbation/Rejet des réservations
- ✅ Consultation des statistiques
- ✅ Accès au tableau de bord administrateur
- ✅ Modification des statuts des véhicules

---

### 2. **Compte Employé 1**

| Champ | Valeur |
|-------|--------|
| **Email** | `employee1@organisation.com` |
| **Mot de passe** | `Employee123!` |
| **Nom** | Jean Dupont |
| **Rôle** | EMPLOYÉ |

**Permissions Employé :**
- ✅ Consultation des véhicules disponibles
- ✅ Création de réservations
- ✅ Annulation de ses propres réservations
- ✅ Visualisation de l'historique personnel

---

### 3. **Compte Employé 2**

| Champ | Valeur |
|-------|--------|
| **Email** | `employee2@organisation.com` |
| **Mot de passe** | `Employee123!` |
| **Nom** | Marie Martin |
| **Rôle** | EMPLOYÉ |

**Permissions Employé :**
- ✅ Consultation des véhicules disponibles
- ✅ Création de réservations
- ✅ Annulation de ses propres réservations
- ✅ Visualisation de l'historique personnel

---

## 🚗 Véhicules de Test Disponibles

| Immatriculation | Marque | Modèle | Type | Statut |
|---|---|---|---|---|
| AB-123-CD | Peugeot | 308 | Berline | ✅ Disponible |
| EF-456-GH | Renault | Clio | Compacte | ✅ Disponible |
| IJ-789-KL | Citroën | C3 | Compacte | ✅ Disponible |
| MN-012-OP | Volkswagen | Golf | Berline | 🔧 En maintenance |
| QR-345-ST | Toyota | Yaris | Compacte | ✅ Disponible |
| UV-678-WX | Ford | Focus | Berline | ❌ Indisponible |
| YZ-901-BC | Mercedes | Classe A | Berline | ✅ Disponible |
| DE-234-FG | BMW | Série 3 | Berline | ✅ Disponible |
| HI-567-JK | Audi | A3 | Berline | ✅ Disponible |
| LM-890-NO | Nissan | Qashqai | SUV | ✅ Disponible |

---

## 🔄 Réservations de Test

Plusieurs réservations de test existent déjà pour démontrer les fonctionnalités :

| Employé | Véhicule | Date | Statut | Notes |
|---|---|---|---|---|
| Jean Dupont | Peugeot 308 | Demain | ⏳ En attente | Réunion client |
| Marie Martin | Renault Clio | J+2 | ✅ Approuvée | Déplacement professionnel |
| Jean Dupont | Citroën C3 | J+7 | ✅ Complétée | Formation |
| Marie Martin | VW Golf | J+8 | ⏳ En attente | Visite site |

---

## 🚀 Étapes pour Démarrer

### 1. **Initialiser la Base de Données**
```bash
cd backend
npm run seed
```

### 2. **Démarrer l'Application**

**Option A : Avec Docker Compose**
```bash
docker-compose up --build
```

**Option B : Démarrage Manuel**
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### 3. **Accéder à l'Application**
- Frontend : http://localhost:3000
- Backend API : http://localhost:5000/api

---

## 📖 Flux de Test Recommandé

### Test 1 : Connexion Admin
1. Accédez à http://localhost:3000
2. Connectez-vous avec `admin@organisation.com` / `Admin123!`
3. Explorez le tableau de bord admin
4. Vérifiez la gestion des utilisateurs et véhicules

### Test 2 : Connexion Employé
1. Déconnectez-vous
2. Connectez-vous avec `employee1@organisation.com` / `Employee123!`
3. Consultez les véhicules disponibles
4. Créez une nouvelle réservation
5. Visualisez vos réservations

### Test 3 : Approbation de Réservations (Admin)
1. Reconnectez-vous en tant qu'admin
2. Accédez au tableau de bord des réservations
3. Approuvez/Rejetez des demandes de réservations

---

## 🔒 Changement de Mots de Passe

Pour modifier un mot de passe après connexion :
1. Allez dans **Profil**
2. Sélectionnez **Changer le mot de passe**
3. Entrez l'ancien mot de passe
4. Entrez et confirmez le nouveau mot de passe
5. Cliquez sur **Mettre à jour**

Critères du mot de passe :
- ✅ Au minimum 8 caractères
- ✅ Au moins une majuscule
- ✅ Au moins une minuscule
- ✅ Au moins un chiffre

---

## ⚠️ Resets et Maintenance

### Réinitialiser Complètement la Base de Données
```bash
# Supprimer la base de données actuelle
rm backend/database/vehicle_booking.db

# Relancer l'application (elle recréera la DB)
npm start
```

### Relancer le Seeding
```bash
npm run seed
```

---

## 📞 Support

Pour toute question ou problème lors de l'utilisation des comptes de test, veuillez consulter :
- [README.md](README.md) - Guide général d'installation
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Documentation des endpoints API

---

**Dernière mise à jour** : Janvier 2026  
**Version** : 1.0
