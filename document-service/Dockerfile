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
ENV PORT=3001

# Maak de containerpoort beschikbaar
EXPOSE 3001

# Start de applicatie
CMD ["npm", "run", "dev"]