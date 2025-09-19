## Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci || npm install
COPY tsconfig.json ./
COPY src ./src
COPY .env.example ./.env
RUN npx tsc -p tsconfig.json

## Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY src/wsdl ./src/wsdl
EXPOSE 3000
CMD ["node", "dist/server.js"]

