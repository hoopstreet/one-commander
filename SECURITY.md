# 🔒 Security Rules & Policies

## Authentication
- Only Telegram user ID: 8296776401 is allowed
- Gateway requires token authentication
- All connections must be encrypted

## Access Control
- Telegram DM Policy: Allowlist only
- Gateway bound to loopback (127.0.0.1)
- SSH key authentication required

## Security Practices
- No secrets in code
- Environment variables for all credentials
- Regular security audits

## Anti-Tampering
- Code signing verification
- Integrity checks on startup
- Tamper-proof config

## End-to-End Encryption
- All external communications encrypted
- Tailscale VPN for remote access
- SSH with key authentication

## Permanent Connections
- Only one authorized connection: Termux ↔ Telegram
- Single user only: Xenia Xu
- Multi-factor authentication enabled

## Reporting Issues
- Contact: hoopstreet143@gmail.com
- Response time: < 24 hours
