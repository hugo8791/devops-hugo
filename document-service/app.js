// app.js
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { db } = require("./services/database");
const promBundle = require('express-prom-bundle');

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  normalizePath: true,
  promClient: {collectDefaultMetrics: {}}
});
app.use(metricsMiddleware);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  const userFilesDir = path.join(__dirname, 'userfiles');
  const userFilePath = path.join(userFilesDir, `${userId}.txt`);

  if (fs.existsSync(userFilePath)) {
    fs.readFile(userFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading user file:', err);
        return res.status(500).send('Error reading user data');
      }
      res.json(JSON.parse(data)); // This should set Content-Type to application/json
    });
  } else {
    // Make sure this path also returns JSON
    res.status(404).json({ error: 'User not found' });
  }
});

// Export the Express app for importing in server.js
module.exports = app;