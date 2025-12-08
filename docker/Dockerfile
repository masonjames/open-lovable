# syntax=docker/dockerfile:1

# Stage 1: Build (use debian slim for native module compatibility)
FROM node:20-slim AS builder
WORKDIR /app

# Copy package.json only (not package-lock.json)
# This forces npm to resolve platform-specific optional deps fresh
COPY package.json ./

# Install dependencies - let npm resolve all platform deps
RUN npm install

# Copy source code
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Production
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
