const { pool } = require('../config/db');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body) {
  const { nom, prenom, email } = body || {};
  if (!nom || !nom.trim()) return 'Le nom est obligatoire';
  if (!prenom || !prenom.trim()) return 'Le prénom est obligatoire';
  if (!email || !EMAIL_RE.test(email)) return "L'email est invalide";
  return null;
}

// GET /api/contacts?search=...
exports.list = async (req, res, next) => {
  try {
    const search = (req.query.search || '').trim();
    let rows;
    if (search) {
      const like = `%${search}%`;
      [rows] = await pool.execute(
        'SELECT * FROM contacts WHERE nom LIKE ? OR prenom LIKE ? OR email LIKE ? ORDER BY nom, prenom',
        [like, like, like]
      );
    } else {
      [rows] = await pool.execute('SELECT * FROM contacts ORDER BY nom, prenom');
    }
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// GET /api/contacts/:id
exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Contact introuvable' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/contacts
exports.create = async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });
    const { nom, prenom, email, telephone = null, adresse = null } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO contacts (nom, prenom, email, telephone, adresse) VALUES (?, ?, ?, ?, ?)',
      [nom.trim(), prenom.trim(), email.trim(), telephone, adresse]
    );
    res.status(201).json({
      id: result.insertId, nom: nom.trim(), prenom: prenom.trim(), email: email.trim(), telephone, adresse,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/contacts/:id
exports.update = async (req, res, next) => {
  try {
    const error = validate(req.body);
    if (error) return res.status(400).json({ error });
    const { nom, prenom, email, telephone = null, adresse = null } = req.body;
    const [result] = await pool.execute(
      'UPDATE contacts SET nom = ?, prenom = ?, email = ?, telephone = ?, adresse = ? WHERE id = ?',
      [nom.trim(), prenom.trim(), email.trim(), telephone, adresse, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Contact introuvable' });
    res.json({ id: Number(req.params.id), nom: nom.trim(), prenom: prenom.trim(), email: email.trim(), telephone, adresse });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/contacts/:id
exports.remove = async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM contacts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Contact introuvable' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
