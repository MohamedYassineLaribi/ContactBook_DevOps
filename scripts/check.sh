#!/usr/bin/env bash
# Script de vérification ContactBook (étape 2 - Bash)
# Usage : ./scripts/check.sh [URL]    (défaut : http://localhost:3000)
set -u

URL="${1:-http://localhost:3000}"
ERRORS=0

ok()   { echo "[OK]   $1"; }
fail() { echo "[FAIL] $1"; ERRORS=$((ERRORS + 1)); }

echo "== Vérification de ContactBook =="

# 1. Outils requis
for tool in git node npm docker curl; do
  if command -v "$tool" >/dev/null 2>&1; then ok "$tool installé"; else fail "$tool manquant"; fi
done

# 2. Fichiers du projet
for f in Dockerfile docker-compose.yml .github/workflows/ci.yml backend/package.json frontend/index.html; do
  if [ -f "$f" ]; then ok "fichier $f présent"; else fail "fichier $f absent"; fi
done

# 3. Application en marche ?
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$URL/health" || true)
if [ "$CODE" = "200" ]; then ok "GET $URL/health -> 200"; else fail "GET $URL/health -> ${CODE:-aucune réponse}"; fi

CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$URL/api/contacts" || true)
if [ "$CODE" = "200" ]; then ok "GET $URL/api/contacts -> 200"; else fail "GET $URL/api/contacts -> ${CODE:-aucune réponse}"; fi

echo "----"
if [ "$ERRORS" -eq 0 ]; then echo "Tout est OK"; exit 0; else echo "$ERRORS erreur(s)"; exit 1; fi
