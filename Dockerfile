FROM node:20-alpine

WORKDIR /app

# Dépendances (couche mise en cache)
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Code
COPY backend ./backend
COPY frontend ./frontend

ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION \
    NODE_ENV=production \
    PORT=3000

# Exécution avec un utilisateur non-root
USER node

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "backend/src/server.js"]
