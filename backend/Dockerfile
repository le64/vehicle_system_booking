FROM node:18-alpine

WORKDIR /app

# Installer les dépendances système requises
RUN apk add --no-cache python3 make g++

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p database logs

# Exposer le port
EXPOSE 5000

# Démarrer l'application
CMD ["npm", "start"]