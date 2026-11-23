// La base est simulée : les tests tournent sans MySQL (idéal pour la CI).
jest.mock('../src/config/db', () => ({
  pool: { execute: jest.fn() },
  initDb: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const sample = { nom: 'Ben Ali', prenom: 'Sami', email: 'sami@example.com', telephone: '20123456', adresse: 'Tunis' };

beforeEach(() => pool.execute.mockReset());

describe('GET /health', () => {
  it('retourne ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Afficher / Rechercher', () => {
  it('liste tous les contacts', async () => {
    pool.execute.mockResolvedValue([[{ id: 1, ...sample }]]);
    const res = await request(app).get('/api/contacts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('recherche par nom ou email', async () => {
    pool.execute.mockResolvedValue([[{ id: 1, ...sample }]]);
    const res = await request(app).get('/api/contacts?search=sami');
    expect(res.status).toBe(200);
    expect(pool.execute.mock.calls[0][1]).toEqual(['%sami%', '%sami%', '%sami%']);
  });

  it('retourne 404 si le contact est inconnu', async () => {
    pool.execute.mockResolvedValue([[]]);
    const res = await request(app).get('/api/contacts/99');
    expect(res.status).toBe(404);
  });
});

describe('Ajouter', () => {
  it('crée un contact', async () => {
    pool.execute.mockResolvedValue([{ insertId: 5 }]);
    const res = await request(app).post('/api/contacts').send(sample);
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(5);
  });

  it('refuse un email invalide', async () => {
    const res = await request(app).post('/api/contacts').send({ ...sample, email: 'pas-un-email' });
    expect(res.status).toBe(400);
    expect(pool.execute).not.toHaveBeenCalled();
  });

  it('refuse un nom manquant', async () => {
    const res = await request(app).post('/api/contacts').send({ ...sample, nom: '' });
    expect(res.status).toBe(400);
  });
});

describe('Modifier', () => {
  it('modifie un contact existant', async () => {
    pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/contacts/1').send({ ...sample, prenom: 'Karim' });
    expect(res.status).toBe(200);
    expect(res.body.prenom).toBe('Karim');
  });

  it('retourne 404 si absent', async () => {
    pool.execute.mockResolvedValue([{ affectedRows: 0 }]);
    const res = await request(app).put('/api/contacts/99').send(sample);
    expect(res.status).toBe(404);
  });
});

describe('Supprimer', () => {
  it('supprime un contact', async () => {
    pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/contacts/1');
    expect(res.status).toBe(204);
  });

  it('retourne 404 si absent', async () => {
    pool.execute.mockResolvedValue([{ affectedRows: 0 }]);
    const res = await request(app).delete('/api/contacts/99');
    expect(res.status).toBe(404);
  });
});
