# syntax=docker/dockerfile:1

# Stage 1: Build (use debian slim for better native module compatibility)
FROM node:20-slim AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including optional platform-specific binaries
# Force install of lightningcss linux binary which is an optional dep
RUN npm install && \
    npm install lightningcss-linux-x64-gnu --save-optional || true

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
