FROM node:24-alpine AS base
WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json tsconfig.base.json ./

# Copy shared package definitions
COPY packages/database/package.json ./packages/database/
COPY packages/database-entities/package.json ./packages/database-entities/

# Copy service package definition
COPY services/product-service/package.json ./services/product-service/

# Install all dependencies (uses workspace resolution)
RUN npm ci

# Copy shared package source code
COPY packages/database-entities/ ./packages/database-entities/
COPY packages/database/ ./packages/database/

# Copy service source code
COPY services/product-service/ ./services/product-service/

# Build shared packages first, then the service
RUN npm run build --workspace=@ms-mono-share/database-entities
RUN npm run build --workspace=@ms-mono-share/database 
RUN npm run build --workspace=services/product-service

# Production stage - only include what is needed at runtime
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/packages/database-entities/package.json ./packages/database-entities/
COPY --from=base /app/packages/database/package.json ./packages/database/
COPY --from=base /app/services/product-service/package.json ./services/product-service/

RUN npm ci --omit=dev

COPY --from=base /app/packages/database-entities/dist/ ./packages/database-entities/dist/
COPY --from=base /app/packages/database/dist/ ./packages/database/dist/
COPY --from=base /app/services/product-service/dist/ ./services/product-service/dist/

EXPOSE 3002
CMD ["node", "services/product-service/dist/index.js"]