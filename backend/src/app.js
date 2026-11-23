const path = require('path');
const express = require('express');
const cors = require('cors');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Utilisé par le HEALTHCHECK Docker et le script check.sh
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: process.env.APP_VERSION || 'dev' });
});

app.use('/api/contacts', contactRoutes);

// Frontend statique
app.use(express.static(path.join(__dirname, '../../frontend')));

// Gestion d'erreurs
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur' });
});

module.exports = app;
