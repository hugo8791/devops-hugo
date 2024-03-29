# Gebruik een specifieke Node.js versie
FROM node:20

# Stel de werkdirectory in de container in
WORKDIR /app

# Kopieer package.json en package-lock.json
COPY package*.json ./

# Installeer alle afhankelijkheden
RUN npm install

# Kopieer de rest van de applicatiecode
COPY . .

# Stel de omgevingsvariabelen in
ENV PORT=3000
ENV MONGO_URL=mongodb://root:root@mongo:27017/

# Maak de containerpoort beschikbaar
EXPOSE 3000

# Start de applicatie
CMD ["npm", "run", "dev"]