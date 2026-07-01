FROM node:22-bookworm

# Install Bun (required for build scripts)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN corepack enable

WORKDIR /app

ARG OPENCLAW_DOCKER_APT_PACKAGES=""
RUN if [ -n "$OPENCLAW_DOCKER_APT_PACKAGES" ]; then \
      apt-get update && \
      DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends $OPENCLAW_DOCKER_APT_PACKAGES && \
      apt-get clean && \
      rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*; \
    fi

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY ui/package.json ./ui/package.json
COPY patches ./patches
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
# Force pnpm for UI build (Bun may fail on ARM/Synology architectures)
ENV OPENCLAW_PREFER_PNPM=1
RUN pnpm ui:build

ENV NODE_ENV=production

# Allow non-root user to write temp files during runtime/tests.
RUN chown -R node:node /app

# Security hardening: Run as non-root user
# The node:22-bookworm image includes a 'node' user (uid 1000)
# This reduces the attack surface by preventing container escape via root privileges
USER node

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