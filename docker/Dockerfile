# syntax=docker/dockerfile:1

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install libc6-compat for native modules (lightningcss, etc.)
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
# Use npm install instead of npm ci to properly resolve platform-specific
# optional dependencies (lightningcss-linux-x64-musl) that may not be in
# the lockfile when it was generated on a different platform (macOS)
RUN npm install --prefer-offline --no-audit

# Copy source code
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
