# Guide de Déploiement - Production

Guide complet pour déployer le système de gestion de réservation de véhicules en production.

## 🚀 Checklist Pré-Déploiement

- [ ] Tester tous les endpoints en développement
- [ ] Vérifier les logs pour les erreurs
- [ ] Mettre à jour les secrets `.env`
- [ ] Tester avec Docker localement
- [ ] Configurer le HTTPS
- [ ] Mettre en place une sauvegarde DB
- [ ] Configurer le monitoring
- [ ] Tester les performances
- [ ] Vérifier la sécurité

---

## 📋 Configuration pour la Production

### Backend (.env)

```env
# Environnement
NODE_ENV=production

# Serveur
PORT=5000
HOST=0.0.0.0

# JWT (générer une clé secrète forte!)
JWT_SECRET=your-super-secure-random-key-here-min-32-chars
JWT_EXPIRE=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Base de données
DATABASE_PATH=/data/vehicle_booking.db

# Logs
LOG_LEVEL=info

# CORS (à adapter avec votre domaine)
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Email (optionnel pour les notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_ENV=production
```

---

## 🐳 Déploiement avec Docker

### Build et Run avec Docker Compose

```bash
# Construire les images
docker-compose build

# Démarrer les conteneurs
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Dockerfile Backend

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Dépendances système
RUN apk add --no-cache python3 make g++

# Dépendances npm
COPY package*.json ./
RUN npm ci --only=production

# Code source
COPY . .

# Répertoires
RUN mkdir -p database logs

# Migration et seed (optionnel)
RUN npm run migrate && npm run seed

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 5000

CMD ["npm", "start"]
```

### Dockerfile Frontend

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔐 Sécurité en Production

### 1. Variables d'Environnement
```bash
# Générer une clé JWT sécurisée
openssl rand -base64 32
# Sortie: AbCd1234567890+/=...

# Utiliser dans .env
JWT_SECRET=AbCd1234567890+/=...
```

### 2. HTTPS/SSL
```bash
# Avec Let's Encrypt (recommandé)
certbot certonly --standalone -d yourdomain.com

# Configuration Nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

### 3. Database Encryption
```sql
-- Chiffrer les mots de passe sensibles
ALTER TABLE users ADD COLUMN password_encrypted TEXT;

-- Mettre en place des backups réguliers
-- cronjob: 0 2 * * * /path/to/backup.sh
```

### 4. Environment Variables
- Ne jamais commiter les `.env` en git
- Utiliser un gestionnaire de secrets (AWS Secrets Manager, HashiCorp Vault)
- Rotater les clés secrètes régulièrement

---

## 🚀 Déploiement sur Serveur Linux

### 1. Préparer le Serveur
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PM2 (gestionnaire de processus)
sudo npm install -g pm2

# Installer Nginx
sudo apt install -y nginx

# Installer SQLite
sudo apt install -y sqlite3
```

### 2. Clone et Configuration
```bash
# Clone du repo
cd /opt
sudo git clone https://github.com/youruser/vehicle_booking.git
cd vehicle_booking

# Configuration
sudo cp backend/.env.example backend/.env
# Éditer backend/.env avec les valeurs de production

sudo cp frontend/.env.example frontend/.env.production
# Éditer frontend/.env.production
```

### 3. Installation des Dépendances
```bash
# Backend
cd backend
npm ci --only=production
npm run migrate
npm run seed  # Optionnel - charger les données test

# Frontend
cd ../frontend
npm ci
npm run build
```

### 4. Configuration PM2
```bash
# Créer un fichier ecosystem.config.js
cat > /opt/vehicle_booking/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'vehicle-booking-api',
      script: './server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'database'],
      max_memory_restart: '500M'
    }
  ]
};
EOF

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration
pm2 save

# Configuration au démarrage
sudo pm2 startup systemd -u $USER --hp /home/$USER
```

### 5. Configuration Nginx
```nginx
# /etc/nginx/sites-available/vehicle-booking

upstream api {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirection vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css text/javascript application/json;
    gzip_min_length 1000;
    
    # API Proxy
    location /api/ {
        proxy_pass http://api/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Frontend Static Files
    location / {
        root /opt/vehicle_booking/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Cache control
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        location = /index.html {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }
    }
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
}
```

### 6. Enable Nginx Config
```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/vehicle-booking \
           /etc/nginx/sites-enabled/vehicle-booking

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

---

## 📊 Monitoring en Production

### PM2 Monitoring
```bash
# Dashboard web
pm2 web

# Accéder à: http://localhost:9615
```

### Logs
```bash
# Afficher les logs en temps réel
pm2 logs

# Logs du backend
tail -f /opt/vehicle_booking/backend/logs/error.log
tail -f /opt/vehicle_booking/backend/logs/combined.log
```

### Health Check
```bash
# Vérifier le statut du service
curl https://yourdomain.com/health

# Résultat attendu:
# {"status":"OK","timestamp":"2026-01-19T13:30:00Z"}
```

---

## 🔄 Backups et Recovery

### Backup automatique de la DB
```bash
# /usr/local/bin/backup-db.sh

#!/bin/bash
BACKUP_DIR="/backups/vehicle_booking"
DB_PATH="/opt/vehicle_booking/backend/database/vehicle_booking.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
sqlite3 $DB_PATH ".backup $BACKUP_DIR/vehicle_booking_$DATE.db"

# Garder seulement les 30 derniers backups
find $BACKUP_DIR -name "*.db" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/vehicle_booking_$DATE.db"
```

### Cronjob
```bash
# Ajouter au crontab
crontab -e

# Backup tous les jours à 2h00
0 2 * * * /usr/local/bin/backup-db.sh
```

### Restore à partir d'un backup
```bash
# Arrêter l'application
pm2 stop all

# Restaurer la base de données
cp /backups/vehicle_booking/vehicle_booking_20260119_020000.db \
   /opt/vehicle_booking/backend/database/vehicle_booking.db

# Redémarrer
pm2 start all
```

---

## 🔍 Performance Optimization

### 1. Database Indexing
```sql
-- Créer les indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_vehicle_id ON reservations(vehicle_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_dates ON reservations(start_date, end_date);
```

### 2. Connection Pooling
```javascript
// À implémenter dans database.js
const sqlite3 = require('sqlite3').verbose();
const pool = require('sqlite3-pool')(sqlite3, {
  max: 10,
  min: 2
});
```

### 3. Caching
```javascript
// Redis (optionnel)
const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

// Mettre en cache les véhicules disponibles
app.get('/api/vehicles/available', async (req, res) => {
  const cached = await client.get('vehicles:available');
  if (cached) return res.json(JSON.parse(cached));
  
  // Sinon, calculer et mettre en cache
  const vehicles = await fetchAvailable();
  await client.setex('vehicles:available', 300, JSON.stringify(vehicles));
  
  res.json({ data: vehicles });
});
```

---

## 🚨 Monitoring et Alertes

### Setup Alerts
```bash
# Utiliser Sentry pour les erreurs
npm install @sentry/node

# Configurer dans server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});
```

### Health Check Service
```bash
#!/bin/bash
# /usr/local/bin/health-check.sh

HEALTH_URL="https://yourdomain.com/health"
MAIL="admin@yourdomain.com"

response=$(curl -s -w "\n%{http_code}" $HEALTH_URL)
http_code=$(echo "$response" | tail -n1)

if [ $http_code -ne 200 ]; then
    echo "Service down! HTTP Code: $http_code" | \
    mail -s "Alert: Vehicle Booking Service Down" $MAIL
fi
```

---

## 📈 Scaling

### Load Balancing
```nginx
upstream api_backend {
    server 127.0.0.1:5000 weight=1;
    server 127.0.0.2:5000 weight=1;
    server 127.0.0.3:5000 weight=1;
    keepalive 32;
}
```

### Horizontal Scaling
```bash
# Ajouter des instances avec PM2
pm2 scale vehicle-booking-api 4  # 4 instances

# Load balancer avec Nginx
# Déjà configuré ci-dessus avec upstream
```

---

## 🔐 Security Checklist

- [ ] HTTPS/SSL configuré
- [ ] Headers de sécurité en place (Helmet)
- [ ] Rate limiting activé
- [ ] CORS configuré correctement
- [ ] Input validation en place
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens (si formulaires)
- [ ] Secrets en variables d'environnement
- [ ] Firewall configuré
- [ ] Backups automatiques
- [ ] Monitoring actif
- [ ] Logs centralisés
- [ ] Updates de sécurité appliquées

---

## 📋 Maintenance

### Updates Réguliers
```bash
# Mettre à jour les dépendances
cd /opt/vehicle_booking/backend
npm update

cd /opt/vehicle_booking/frontend
npm update

# Redémarrer les services
pm2 restart all
```

### Database Maintenance
```bash
# Optimiser la base de données
sqlite3 /opt/vehicle_booking/backend/database/vehicle_booking.db "VACUUM"

# Vérifier l'intégrité
sqlite3 /opt/vehicle_booking/backend/database/vehicle_booking.db "PRAGMA integrity_check"
```

---

## 🆘 Troubleshooting

### Service n'a pas commencé
```bash
pm2 logs vehicle-booking-api
# Vérifier les erreurs

# Redémarrer
pm2 restart vehicle-booking-api
```

### Base de données corrompue
```bash
# Restaurer à partir du backup
cp /backups/vehicle_booking/latest.db \
   /opt/vehicle_booking/backend/database/vehicle_booking.db

# Redémarrer
pm2 restart all
```

### Performance dégradée
```bash
# Vérifier les ressources
top -b | head -n 20

# Analyser les logs
tail -n 1000 /opt/vehicle_booking/backend/logs/error.log | grep -i error

# Vérifier les indexes
sqlite3 /opt/vehicle_booking/backend/database/vehicle_booking.db ".indices"
```

---

## 📞 Support Production

En cas de problème:
1. Vérifier les logs: `pm2 logs`
2. Vérifier la santé: `curl https://yourdomain.com/health`
3. Vérifier les ressources: `top`, `df -h`
4. Consulter les backups: `ls -lah /backups/vehicle_booking/`

---

**Status**: ✅ Production Ready
**Dernière mise à jour**: 2026-01-19
