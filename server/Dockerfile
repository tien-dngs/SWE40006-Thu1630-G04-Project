FROM node:24-alpine

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm install

COPY server/ ./
COPY Data/commands.sql /app/seed/commands.sql

ENV DB_PATH=/data/db.sqlite
ENV SQL_PATH=/app/seed/commands.sql
ENV PORT=4004

EXPOSE 4004

CMD ["sh", "-c", "node scripts/init-db.js && node server.js"]
