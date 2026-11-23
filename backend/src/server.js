const app = require('./app');
const { initDb } = require('./config/db');

const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`ContactBook écoute sur le port ${PORT}`));
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
