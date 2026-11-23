const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'contactbook',
  password: process.env.DB_PASSWORD || 'contactbook',
  database: process.env.DB_NAME || 'contactbook',
  waitForConnections: true,
  connectionLimit: 10,
});

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    telephone VARCHAR(30) DEFAULT NULL,
    adresse VARCHAR(255) DEFAULT NULL
  ) CHARACTER SET utf8mb4`;

// Crée la table au démarrage ; réessaie tant que MySQL n'est pas prêt.
async function initDb(retries = 20, delayMs = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query(CREATE_TABLE);
      console.log('Base de données prête');
      return;
    } catch (err) {
      console.log(`MySQL indisponible (${i}/${retries}) : ${err.code || err.message}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw new Error('Impossible de se connecter à MySQL');
}

module.exports = { pool, initDb };
