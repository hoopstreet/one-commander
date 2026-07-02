# OpenClaw Gateway Dockerfile for Northflank Deployment
# Optimized for reliable builds on Northflank's build infrastructure

FROM node:22-bookworm

# Set environment variables early
ENV PNPM_VERSION=9.0.0 \
    COREPACK_ENABLE_DOWNLOAD=1 \
    COREPACK_ENABLE_PNPM=1 \
    NODE_ENV=production

# Enable corepack for pnpm
RUN corepack enable && \
    corepack prepare pnpm@${PNPM_VERSION} --activate && \
    pnpm config set store-dir /tmp/pnpm-store

WORKDIR /app

# Install system dependencies for OpenClaw
# These are passed via build arguments from northflank.json
ARG OPENCLAW_DOCKER_APT_PACKAGES=""
RUN if [ -n "$OPENCLAW_DOCKER_APT_PACKAGES" ]; then \
      apt-get update && \
      DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends $OPENCLAW_DOCKER_APT_PACKAGES && \
      apt-get clean && \
      rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*; \
    fi

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY patches ./patches
COPY scripts ./scripts

# Install dependencies with frozen lockfile for reproducibility
# Use --strict-peer-dependencies to catch version conflicts early
RUN pnpm install --frozen-lockfile --strict-peer-dependencies

# Copy the rest of the application
COPY . .

# Build the application
# The build script runs: tsdown, plugin-sdk builds, and various post-build scripts
RUN pnpm build

# Build the UI
# Force pnpm for UI build to avoid Bun compatibility issues on ARM
ENV OPENCLAW_PREFER_PNPM=1
RUN pnpm ui:build

# Create data directory for persistent storage
RUN mkdir -p /data/.openclaw /data/workspace

# Allow non-root user to write to app and data directories
RUN chown -R node:node /app /data

# Security hardening: Run as non-root user
# The node:22-bookworm image includes a 'node' user (uid 1000)
USER node

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('node:http').get('http://localhost:18789/healthz', (res) => { \
        if (res.statusCode !== 200) process.exit(1); \
        let data = ''; \
        res.on('data', chunk => data += chunk); \
        res.on('end', () => { \
            if (data.trim() !== 'OK') process.exit(1); \
        }); \
    }).on('error', () => process.exit(1))" || exit 1

# Start gateway server with Northflank-compatible configuration.
# Binds to LAN (0.0.0.0) for Northflank deployment
# Supports health checks on /healthz endpoint
# Uses environment variables for configuration:
#   - OPENCLAW_GATEWAY_PORT: Gateway port (default: 18789)
#   - OPENCLAW_GATEWAY_BIND: Bind address (lan for Northflank)
#   - OPENCLAW_GATEWAY_TOKEN: Authentication token
#   - OPENCLAW_GATEWAY_PASSWORD: Password for basic auth
#   - TELEGRAM_BOT_TOKEN: Telegram bot token
#   - OPENCLAW_GATEWAY_ALLOW_UNCONFIGURED: Allow unconfigured startup
CMD ["node", "openclaw.mjs", "gateway", "--allow-unconfigured", "--bind", "lan"]
