FROM node:22-alpine
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY backend/server.js backend/LICENSE backend/NOTICE.md ./
COPY index.html jen_sebastian_portfolio.html contact.html /app/
ENV HOST=0.0.0.0 PORT=8787
EXPOSE 8787
USER node
CMD ["node", "server.js"]
