# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install prisma tsx dotenv && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/shared/infra/database/client ./src/shared/infra/database/client
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/src/shared/infra/database/prisma ./src/shared/infra/database/prisma
COPY --from=build /app/prisma/seed.ts ./prisma/seed.ts
COPY --from=build /app/src/shared/infra/database/createPrismaClient.ts ./src/shared/infra/database/createPrismaClient.ts
COPY --from=build /app/src/shared/infra/env ./src/shared/infra/env
EXPOSE 3333
CMD ["node", "dist/shared/server.js"]
