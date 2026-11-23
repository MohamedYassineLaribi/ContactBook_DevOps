# 📒 ContactBook

Application web de gestion de contacts : **ajouter, afficher, modifier, supprimer, rechercher** (par nom, prénom ou email).

**Stack** : HTML/CSS/Bootstrap · Node.js + Express · MySQL · Jest + Supertest · Docker / Compose · GitHub Actions

## Lancer l'application

```bash
docker compose up -d --build
# -> http://localhost:3000  (mots de passe : copier .env.example en .env pour les changer)
./scripts/check.sh
```

## Lancer les tests (sans MySQL)

```bash
cd backend && npm install && npm test
```

## API REST

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/contacts?search=xxx` | Lister / rechercher |
| GET | `/api/contacts/:id` | Un contact |
| POST | `/api/contacts` | Ajouter |
| PUT | `/api/contacts/:id` | Modifier |
| DELETE | `/api/contacts/:id` | Supprimer |
| GET | `/health` | Santé (HEALTHCHECK) |

Contact : `id, nom, prenom, email, telephone, adresse`.

---

## Mise en œuvre des 7 étapes DevOps

### 1. Git (GitHub)

```bash
git init -b main
git add . && git commit -m "feat: version initiale ContactBook"
git remote add origin https://github.com/<utilisateur>/contactbook.git
git push -u origin main

# Une branche par fonctionnalité + Pull Request (appelée « merge request » dans le sujet)
git checkout -b feature/recherche
# ... modifications ...
git commit -am "feat: ajout de la recherche"
git push -u origin feature/recherche   # puis ouvrir la Pull Request sur GitHub
```

Convention : `main` (stable), `feature/*` (développement). Fusion par Pull Request uniquement, avec les tests au vert obligatoires (protection de branche).

### 2. Bash
`scripts/check.sh` vérifie les outils, les fichiers du projet et que l'application répond (`/health`, `/api/contacts`). Code de sortie 0 = OK, 1 = erreur.

### 3. Docker
`Dockerfile` : image `node:20-alpine`, utilisateur non-root, `HEALTHCHECK` sur `/health`.

```bash
docker build -t contactbook:1.0.0 .
docker run -p 3000:3000 contactbook:1.0.0   # (nécessite MySQL, voir Compose)
docker inspect --format='{{.State.Health.Status}}' <conteneur>
```

### 4. Docker Compose
`docker-compose.yml` : services `app` + `db` (MySQL 8), volume `db_data`, `depends_on` avec `service_healthy` (l'app attend que MySQL soit prêt).

### 5. CI/CD (`.github/workflows/ci.yml`)
Jobs : **test** (Jest, Node 18 et 20, rapport JUnit en artefact) → **build** (`needs: test`, image dans GitHub Container Registry `ghcr.io`) → **release** (tag `vX.Y.Z`, sans reconstruire) → **deploy-test** (mise en service + contrôle de santé).

### 6. Déploiement d'une version

```bash
git tag v1.0.0 && git push origin v1.0.0     # le workflow retague l'image en :v1.0.0
# Mise en service automatique par le job deploy-test, ou en local :
echo $TOKEN | docker login ghcr.io -u <utilisateur> --password-stdin   # token avec read:packages
export IMAGE=ghcr.io/<utilisateur>/contactbook
IMAGE_TAG=v1.0.0 docker compose up -d
./scripts/check.sh
```

### 7. Rollback
Après avoir publié `v1.1.0`, en cas de problème on redéploie l'image précédente :

```bash
IMAGE_TAG=v1.0.0 docker compose up -d
./scripts/check.sh      # /health doit afficher "version": "v1.0.0"
```

Les données MySQL sont conservées (volume `db_data`). Sur GitHub : relancer (Re-run) le workflow du tag `v1.0.0`.
