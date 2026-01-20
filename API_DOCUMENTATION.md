# API Documentation

Documentation complète de tous les endpoints disponibles dans l'application.

## Base URL
- Development: `http://localhost:5000/api`
- Production: À configurer

## Authentication

### Header Required
```
Authorization: Bearer <JWT_TOKEN>
```

### Response Structure
```json
{
  "success": true|false,
  "data": {},
  "message": "Description optionnelle",
  "errors": []
}
```

---

## 🔓 Public Endpoints

### POST /auth/register
Créer un nouveau compte utilisateur.

**Request**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "firstName": "Jean",
  "lastName": "Dupont"
}
```

**Validation**
- Email: Format valide, unique
- Password: 8+ chars, 1 majuscule, 1 minuscule, 1 chiffre
- FirstName: 2+ caractères
- LastName: 2+ caractères

**Response (201)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "EMPLOYEE"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors**
- 400: Email already exists
- 400: Validation failed

---

### POST /auth/login
Se connecter avec email et mot de passe.

**Request**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "EMPLOYEE"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors**
- 401: Invalid email or password
- 401: Account disabled

---

### GET /vehicles/available
Récupérer les véhicules disponibles (sans authentification).

**Query Parameters**
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format

**Example**
```
GET /api/vehicles/available?startDate=2026-01-20&endDate=2026-01-25
```

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "registrationNumber": "AB-123-CD",
      "brand": "Peugeot",
      "model": "308",
      "type": "Berline",
      "status": "available"
    }
  ]
}
```

---

## 🔐 Protected Endpoints (Authentification requise)

### GET /auth/me
Récupérer les informations de l'utilisateur actuel.

**Headers**
```
Authorization: Bearer <TOKEN>
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "EMPLOYEE",
      "first_name": "Jean",
      "last_name": "Dupont"
    }
  }
}
```

**Errors**
- 401: Missing token
- 401: Invalid token
- 401: Token expired

---

## 🚗 Vehicles Endpoints

### GET /vehicles
Récupérer tous les véhicules (authentifiés).

**Query Parameters**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional): available|maintenance|unavailable

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "registrationNumber": "AB-123-CD",
      "brand": "Peugeot",
      "model": "308",
      "type": "Berline",
      "status": "available"
    }
  ]
}
```

---

### GET /vehicles/:id
Récupérer les détails d'un véhicule.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "registrationNumber": "AB-123-CD",
    "brand": "Peugeot",
    "model": "308",
    "type": "Berline",
    "status": "available"
  }
}
```

**Errors**
- 404: Vehicle not found

---

### POST /vehicles
Créer un nouveau véhicule (admin only).

**Request**
```json
{
  "registrationNumber": "AB-999-XY",
  "brand": "Renault",
  "model": "Clio",
  "type": "Compacte"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": 11,
    "registrationNumber": "AB-999-XY",
    "brand": "Renault",
    "model": "Clio",
    "type": "Compacte",
    "status": "available"
  }
}
```

**Errors**
- 400: Registration number already exists
- 403: Admin role required

---

### PUT /vehicles/:id
Modifier un véhicule (admin only).

**Request**
```json
{
  "brand": "Renault",
  "model": "Clio5",
  "type": "Compacte"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "registrationNumber": "AB-123-CD",
    "brand": "Renault",
    "model": "Clio5",
    "type": "Compacte",
    "status": "available"
  }
}
```

---

### DELETE /vehicles/:id
Supprimer un véhicule (admin only).

**Response (200)**
```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

**Errors**
- 404: Vehicle not found
- 403: Admin role required

---

### PUT /vehicles/:id/status
Changer le statut d'un véhicule (admin only).

**Request**
```json
{
  "status": "maintenance"
}
```

**Valid Status Values**
- `available`: Disponible
- `maintenance`: En maintenance
- `unavailable`: Indisponible

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "registrationNumber": "AB-123-CD",
    "brand": "Peugeot",
    "model": "308",
    "type": "Berline",
    "status": "maintenance"
  }
}
```

---

## 📅 Reservations Endpoints

### POST /reservations
Créer une nouvelle réservation.

**Request**
```json
{
  "vehicleId": 1,
  "startDate": "2026-01-25T08:00:00Z",
  "endDate": "2026-01-26T18:00:00Z",
  "purpose": "Réunion client"
}
```

**Validation**
- Vehicle must exist and be available
- No overlapping reservations
- Start date before end date
- Start date in future
- Purpose is required

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 2,
    "vehicleId": 1,
    "startDate": "2026-01-25T08:00:00Z",
    "endDate": "2026-01-26T18:00:00Z",
    "purpose": "Réunion client",
    "status": "active"
  }
}
```

**Errors**
- 400: Vehicle not found
- 400: Vehicle not available
- 400: Vehicle already reserved
- 400: Invalid dates

---

### GET /reservations/my-reservations
Récupérer les réservations de l'utilisateur.

**Query Parameters**
- `status` (optional): active|cancelled|completed
- `page` (default: 1)
- `limit` (default: 10)

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "vehicleId": 1,
      "startDate": "2026-01-25T08:00:00Z",
      "endDate": "2026-01-26T18:00:00Z",
      "purpose": "Réunion client",
      "status": "active",
      "registrationNumber": "AB-123-CD",
      "brand": "Peugeot",
      "model": "308",
      "type": "Berline",
      "first_name": "Jean",
      "last_name": "Dupont",
      "email": "jean@example.com"
    }
  ]
}
```

---

### GET /reservations/:id
Récupérer les détails d'une réservation.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 2,
    "vehicleId": 1,
    "startDate": "2026-01-25T08:00:00Z",
    "endDate": "2026-01-26T18:00:00Z",
    "purpose": "Réunion client",
    "status": "active"
  }
}
```

**Errors**
- 404: Reservation not found
- 403: Not authorized to view this reservation

---

### PUT /reservations/:id/cancel
Annuler une réservation.

**Request**
```json
{}
```

**Validation**
- Reservation must be active
- Start date must be in future
- Only owner or admin can cancel

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 2,
    "vehicleId": 1,
    "startDate": "2026-01-25T08:00:00Z",
    "endDate": "2026-01-26T18:00:00Z",
    "purpose": "Réunion client",
    "status": "cancelled",
    "cancelledAt": "2026-01-19T13:30:00Z"
  }
}
```

**Errors**
- 404: Reservation not found
- 400: Reservation already cancelled
- 400: Cannot cancel past reservation

---

## 👥 Admin - Users Endpoints

All endpoints require ADMIN role.

### GET /admin/users
Récupérer la liste des utilisateurs.

**Query Parameters**
- `page` (default: 1)
- `limit` (default: 10)
- `role` (optional): ADMIN|EMPLOYEE

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@organisation.com",
      "firstName": "Admin",
      "lastName": "System",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "totalReservations": 0,
      "activeReservations": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3
  }
}
```

---

### POST /admin/users
Créer un nouvel utilisateur.

**Request**
```json
{
  "email": "newuser@organisation.com",
  "password": "Password123!",
  "firstName": "Marie",
  "lastName": "Martin",
  "role": "EMPLOYEE"
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "email": "newuser@organisation.com",
    "firstName": "Marie",
    "lastName": "Martin",
    "role": "EMPLOYEE"
  }
}
```

---

### PUT /admin/users/:id
Modifier un utilisateur.

**Request**
```json
{
  "firstName": "Marie-Claire",
  "lastName": "Martin",
  "role": "ADMIN"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "email": "newuser@organisation.com",
    "firstName": "Marie-Claire",
    "lastName": "Martin",
    "role": "ADMIN"
  }
}
```

---

### PUT /admin/users/:id/status
Activer/Désactiver un utilisateur.

**Request**
```json
{
  "isActive": false
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": 4,
    "email": "newuser@organisation.com",
    "firstName": "Marie",
    "lastName": "Martin",
    "isActive": false
  }
}
```

---

## 🚗 Admin - Vehicles Endpoints

All endpoints require ADMIN role.

### GET /admin/vehicles
Récupérer tous les véhicules (vue admin).

**Query Parameters**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional): available|maintenance|unavailable

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "registrationNumber": "AB-123-CD",
      "brand": "Peugeot",
      "model": "308",
      "type": "Berline",
      "status": "available",
      "totalReservations": 5,
      "activeReservations": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10
  }
}
```

---

### POST /admin/vehicles
Créer un véhicule (via admin).

Same as `POST /vehicles` but requires ADMIN role.

---

### PUT /admin/vehicles/:id
Modifier un véhicule (via admin).

Same as `PUT /vehicles/:id` but requires ADMIN role.

---

### DELETE /admin/vehicles/:id
Supprimer un véhicule (via admin).

Same as `DELETE /vehicles/:id` but requires ADMIN role.

---

## 📊 Admin - Statistics

### GET /admin/stats
Récupérer les statistiques du système.

**Response (200)**
```json
{
  "success": true,
  "data": {
    "totalVehicles": 10,
    "availableVehicles": 7,
    "maintenanceCount": 1,
    "unavailableCount": 1,
    "totalUsers": 3,
    "activeReservations": 8
  }
}
```

---

## 📅 Admin - Reservations

### GET /admin/reservations
Récupérer toutes les réservations (vue admin).

**Query Parameters**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (optional): active|cancelled|completed

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "vehicleId": 1,
      "startDate": "2026-01-25T08:00:00Z",
      "endDate": "2026-01-26T18:00:00Z",
      "purpose": "Réunion client",
      "status": "active",
      "vehicle": {
        "registrationNumber": "AB-123-CD",
        "brand": "Peugeot",
        "model": "308",
        "type": "Berline"
      },
      "user": {
        "firstName": "Jean",
        "lastName": "Dupont",
        "email": "jean@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Nouvelle ressource créée |
| 400 | Bad Request - Données invalides |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Ressource inexistante |
| 500 | Server Error - Erreur serveur |

---

## Rate Limiting

- Limite: 100 requêtes par 15 minutes par IP
- Header: `X-RateLimit-Remaining`

---

## CORS

- Origine autorisée: `http://localhost:3000`
- Méthodes: GET, POST, PUT, DELETE, OPTIONS
- Headers: Authorization, Content-Type

---

## Status: ✅ Documentation Complete
Dernière mise à jour: 2026-01-19
