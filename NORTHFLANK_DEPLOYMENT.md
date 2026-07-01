# OpenClaw Northflank Deployment Guide

This guide provides step-by-step instructions for deploying OpenClaw to Northflank with Telegram support.

## Prerequisites

- A [Northflank](https://northflank.com) account
- A GitHub repository with your OpenClaw configuration
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- Basic understanding of container deployment

## Quick Start

### 1. Fork and Configure Repository

1. **Fork this repository** to your GitHub account
2. **Update the Northflank configuration** in `northflank.json`:
   - Set `gitops.repoUrl` to your forked repository URL
   - Update `gitops.accountLogin` to your GitHub username
   - Ensure `gitops.branch` matches your target branch (default: `main`)

### 2. Set Up Telegram Bot

1. **Create a Telegram bot** with [@BotFather](https://t.me/BotFather)
2. **Get your bot token** (starts with `123456789:ABC-DEF...`)
3. **Start a chat** with your bot to initialize it

### 3. Deploy to Northflank

#### Method A: Using Northflank Template (Recommended)

1. **Go to Northflank Dashboard** → **Templates**
2. **Import this template** by uploading the `northflank.json` file
3. **Configure the deployment**:
   - **Project Name**: OpenClaw (or your preferred name)
   - **Region**: Choose the closest region (e.g., `europe-west`)
   - **TELEGRAM_BOT_TOKEN**: Your Telegram bot token
   - **SETUP_PASSWORD**: A secure password for gateway authentication

4. **Start the deployment**
5. **Wait for build completion** (typically 5-15 minutes)

#### Method B: Manual Deployment

1. **Create a new project** in Northflank
2. **Create a Combined Service**:
   - **Name**: OpenClaw Service
   - **Build Source**: Connect your GitHub repository
   - **Dockerfile**: Use the provided `Dockerfile`
   - **Build Arguments**: `OPENCLAW_DOCKER_APT_PACKAGES=""` (empty for basic setup)
   - **Ports**: Expose port `18789` (HTTP)
   - **Health Checks**: Configure as shown in `northflank.json`

3. **Add Environment Variables**:
   ```bash
   OPENCLAW_GATEWAY_PORT=18789
   OPENCLAW_GATEWAY_BIND=lan
   OPENCLAW_GATEWAY_TOKEN=auto-generated
   OPENCLAW_STATE_DIR=/data/.openclaw
   OPENCLAW_WORKSPACE_DIR=/data/workspace
   TELEGRAM_BOT_TOKEN=your-bot-token
   OPENCLAW_GATEWAY_ALLOW_UNCONFIGURED=true
   OPENCLAW_GATEWAY_AUTH_MODE=password
   OPENCLAW_GATEWAY_PASSWORD=your-secure-password
   ```

4. **Add Persistent Volume**:
   - **Mount Path**: `/data`
   - **Size**: 10GB (recommended)
   - **Access Mode**: ReadWriteOnce

5. **Deploy the service**

### 4. Configure Telegram Webhook (Optional)

For better reliability, you can configure Telegram webhook:

1. **Get your Northflank service URL** (e.g., `https://openclaw.nf.sh`)
2. **Set webhook in your OpenClaw configuration**:
   ```json
   {
     "channels": {
       "telegram": {
         "botToken": "YOUR_BOT_TOKEN",
         "webhookUrl": "https://your-service-url.nf.sh/telegram-webhook",
         "webhookSecret": "your-webhook-secret"
       }
     }
   }
   ```

3. **Restart the service** for changes to take effect

## Configuration Reference

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENCLAW_GATEWAY_PORT` | No | `18789` | Gateway WebSocket port |
| `OPENCLAW_GATEWAY_BIND` | No | `loopback` | Bind address (`lan` for Northflank) |
| `OPENCLAW_GATEWAY_TOKEN` | No | Auto-generated | Authentication token |
| `OPENCLAW_GATEWAY_PASSWORD` | Yes | - | Password for basic auth |
| `OPENCLAW_STATE_DIR` | No | `~/.openclaw` | State directory path |
| `OPENCLAW_WORKSPACE_DIR` | No | `~/workspace` | Workspace directory path |
| `TELEGRAM_BOT_TOKEN` | Yes | - | Your Telegram bot token |
| `OPENCLAW_GATEWAY_ALLOW_UNCONFIGURED` | No | `false` | Allow gateway to start without config |
| `OPENCLAW_GATEWAY_AUTH_MODE` | No | `token` | Authentication mode (`password` or `token`) |

### Northflank Configuration (northflank.json)

The provided `northflank.json` includes:

- **Project**: OpenClaw with red color (#EF233C)
- **Secrets**: Secure storage for tokens and passwords
- **Service**: Containerized OpenClaw gateway
- **Volume**: Persistent storage for state and workspace
- **Health Checks**: Startup, liveness, and readiness probes
- **GitOps**: Automatic deployment from GitHub

### Ports and Endpoints

| Port | Protocol | Path | Description |
|------|----------|------|-------------|
| 18789 | HTTP/WS | `/` | Gateway WebSocket and HTTP server |
| 18789 | HTTP | `/healthz` | Health check endpoint |
| 18789 | HTTP | `/telegram-webhook` | Telegram webhook (if configured) |

## Post-Deployment Setup

### 1. Connect to Your Bot

Once deployed, start a chat with your Telegram bot and send:
```
/start
```

### 2. Configure OpenClaw

Send a message to configure your assistant:
```
Set up my AI assistant with model gpt-4o-mini
```

### 3. Test the Connection

Send a simple message:
```
Hello, are you working?
```

### 4. Set Up Additional Channels (Optional)

You can add other messaging channels by updating your configuration:

```json
{
  "channels": {
    "telegram": {
      "botToken": "YOUR_BOT_TOKEN"
    },
    "discord": {
      "token": "YOUR_DISCORD_TOKEN"
    },
    "slack": {
      "botToken": "YOUR_SLACK_BOT_TOKEN",
      "appToken": "YOUR_SLACK_APP_TOKEN"
    }
  }
}
```

## Troubleshooting

### Build Failures

1. **Check build logs** in Northflank dashboard
2. **Ensure Node.js 22** is available in your build environment
3. **Verify pnpm** is properly installed
4. **Check disk space** - OpenClaw requires ~16GB for build cache

### Service Won't Start

1. **Check health probe logs**:
   ```bash
   # The health check should return "OK" at /healthz
   curl http://localhost:18789/healthz
   ```

2. **Verify environment variables** are correctly set
3. **Check container logs** for startup errors
4. **Ensure volume is mounted** correctly

### Telegram Bot Not Responding

1. **Verify bot token** is correct
2. **Check if webhook is configured** (for production)
3. **Test with polling mode** first:
   ```json
   {
     "channels": {
       "telegram": {
         "botToken": "YOUR_TOKEN",
         "webhookUrl": null
       }
     }
   }
   ```
4. **Check Northflank logs** for Telegram API errors

### Connection Issues

1. **Verify port 18789** is exposed and accessible
2. **Check firewall rules** in Northflank
3. **Test WebSocket connection**:
   ```bash
   # Using websocat or similar tool
   websocat ws://your-service-url.nf.sh:18789
   ```

## Security Considerations

### Authentication

- **Always use authentication**: Set `OPENCLAW_GATEWAY_AUTH_MODE=password`
- **Use strong passwords**: Minimum 16 characters, mixed case, numbers, symbols
- **Rotate tokens regularly**: Update `OPENCLAW_GATEWAY_TOKEN` periodically

### Network Security

- **Use HTTPS**: Northflank provides automatic HTTPS
- **Restrict access**: Configure Northflank firewall rules if needed
- **Monitor logs**: Regularly check for suspicious activity

### Data Protection

- **Persistent volume**: State and workspace data is stored in `/data`
- **Backup regularly**: Export your configuration and state
- **Encrypt sensitive data**: Use Northflank secrets for tokens and passwords

## Scaling and Performance

### Resource Recommendations

| Usage Level | CPU | Memory | Storage |
|-------------|-----|--------|---------|
| Personal | 1 vCPU | 2GB | 10GB |
| Small Team | 2 vCPU | 4GB | 20GB |
| Production | 4 vCPU | 8GB | 50GB+ |

### Performance Tips

1. **Enable build caching** in Northflank for faster deployments
2. **Use ARM architecture** if available (better price/performance)
3. **Monitor resource usage** in Northflank dashboard
4. **Scale horizontally** by running multiple instances with shared state

## Updating Your Deployment

### Automatic Updates (GitOps)

1. **Push changes** to your connected branch
2. **Northflank will automatically rebuild and redeploy**
3. **Monitor deployment** in Northflank dashboard

### Manual Updates

1. **Update your local repository**:
   ```bash
   git pull origin main
   ```
2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Update OpenClaw"
   git push origin main
   ```
3. **Trigger redeployment** in Northflank

## Monitoring and Maintenance

### Health Checks

Northflank automatically monitors:
- **Startup Probe**: Ensures service starts correctly
- **Liveness Probe**: Verifies service is running
- **Readiness Probe**: Checks if service can accept traffic

### Logs

Access logs through:
- **Northflank Dashboard** → Your Service → Logs
- **Container exec** for real-time debugging

### Metrics

Monitor key metrics:
- **CPU Usage**: Should stay below 80%
- **Memory Usage**: Watch for memory leaks
- **Response Time**: Should be < 100ms for health checks
- **Error Rate**: Should be near 0%

## Advanced Configuration

### Custom Build Arguments

Add packages needed for your setup:
```json
{
  "buildArguments": {
    "OPENCLAW_DOCKER_APT_PACKAGES": "ffmpeg libwebp"
  }
}
```

### Multiple Instances

For high availability:
1. **Create multiple services** with the same configuration
2. **Use shared volume** for state (if supported)
3. **Configure load balancer** in Northflank

### Custom Domains

1. **Add domain** in Northflank service configuration
2. **Configure DNS** to point to your Northflank service
3. **Set up SSL certificates** (Northflank handles this automatically)

## Migration from Other Platforms

### From Local Development

1. **Export your configuration**:
   ```bash
   cp ~/.openclaw/openclaw.json ./config/
   ```
2. **Update paths** to use `/data/.openclaw`
3. **Deploy to Northflank**

### From Other Cloud Providers

1. **Export your configuration and state**
2. **Update environment variables** for Northflank
3. **Test locally** with Docker before deploying
4. **Deploy to Northflank**

## Support and Community

- **Documentation**: [https://docs.openclaw.ai](https://docs.openclaw.ai)
- **Discord**: [https://discord.gg/clawd](https://discord.gg/clawd)
- **GitHub**: [https://github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
- **Northflank Docs**: [https://northflank.com/docs](https://northflank.com/docs)

## Example Configurations

### Minimal Telegram Bot

```json
{
  "agent": {
    "model": "gpt-4o-mini",
    "provider": "openai"
  },
  "channels": {
    "telegram": {
      "botToken": "YOUR_BOT_TOKEN"
    }
  }
}
```

### Multi-Channel Assistant

```json
{
  "agent": {
    "model": "claude-3-5-sonnet",
    "provider": "anthropic"
  },
  "channels": {
    "telegram": {
      "botToken": "YOUR_TELEGRAM_TOKEN"
    },
    "discord": {
      "token": "YOUR_DISCORD_TOKEN"
    },
    "slack": {
      "botToken": "YOUR_SLACK_BOT_TOKEN",
      "appToken": "YOUR_SLACK_APP_TOKEN"
    }
  }
}
```

### Production with Webhooks

```json
{
  "gateway": {
    "port": 18789,
    "bind": "lan",
    "auth": {
      "mode": "password",
      "password": "YOUR_SECURE_PASSWORD"
    }
  },
  "channels": {
    "telegram": {
      "botToken": "YOUR_BOT_TOKEN",
      "webhookUrl": "https://your-service.nf.sh/telegram-webhook",
      "webhookSecret": "YOUR_WEBHOOK_SECRET"
    }
  }
}
```

---

**Happy Deploying!** 🚀

For issues or questions, join the [OpenClaw Discord](https://discord.gg/clawd) or open an issue on [GitHub](https://github.com/openclaw/openclaw).