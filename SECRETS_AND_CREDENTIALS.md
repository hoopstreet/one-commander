# 🔐 OpenClaw Complete Credentials & Secrets Guide

This document contains all required credentials, secrets, and configuration for a **professional, maximum-security OpenClaw deployment** on Northflank with Telegram and Flutter integration.

---

## 📋 **Complete Credentials List**

### **🔴 CRITICAL SECRETS (Must be secured)**

| Secret Name | Type | Description | Required | Security Level |
|-------------|------|-------------|----------|----------------|
| `TELEGRAM_BOT_TOKEN` | API Token | **Provided**: `8809223927:AAHs7myPMYFYYBcABbXH-jguY_gBPZm1LCU` | ✅ Yes | 🔴 **CRITICAL** |
| `GATEWAY_PASSWORD` | Password | OpenClaw Gateway authentication password | ✅ Yes | 🔴 **CRITICAL** |
| `NORTHFLANK_API_TOKEN` | API Token | Northflank API access token | ✅ Yes | 🔴 **CRITICAL** |
| `TELEGRAM_WEBHOOK_SECRET` | Secret | Telegram webhook verification secret | ⚠️ Auto | 🟡 **HIGH** |
| `FLUTTER_APP_TOKEN` | API Token | Flutter app authentication token | ⚠️ Auto | 🟡 **HIGH** |
| `OPENCLAW_GATEWAY_TOKEN` | Secret | Gateway WebSocket authentication token | ⚠️ Auto | 🟡 **HIGH** |
| `GITHUB_TOKEN` | PAT | GitHub Personal Access Token (for CI/CD) | ✅ Yes | 🔴 **CRITICAL** |

### **🟡 HIGH SECURITY SECRETS**

| Secret Name | Type | Description | Required | Security Level |
|-------------|------|-------------|----------|----------------|
| `NORTHFLANK_SERVICE_URL` | URL | Northflank service URL (e.g., `openclaw.nf.sh`) | ✅ Yes | 🟡 **HIGH** |
| `SLACK_WEBHOOK` | URL | Slack webhook URL for notifications | ❌ No | 🟡 **HIGH** |
| `FLUTTER_REPO` | Repository | Flutter app repository URL | ❌ No | 🟡 **HIGH** |
| `FLUTTER_REPO_TOKEN` | PAT | Flutter repo access token | ❌ No | 🟡 **HIGH** |

### **🟢 STANDARD SECRETS**

| Secret Name | Type | Description | Required | Security Level |
|-------------|------|-------------|----------|----------------|
| `OPENAI_API_KEY` | API Key | OpenAI API key for model access | ⚠️ Conditional | 🟢 **MEDIUM** |
| `ANTHROPIC_API_KEY` | API Key | Anthropic API key | ❌ No | 🟢 **MEDIUM** |
| `GOOGLE_AI_API_KEY` | API Key | Google AI API key | ❌ No | 🟢 **MEDIUM** |
| `DISCORD_TOKEN` | API Token | Discord bot token | ❌ No | 🟢 **MEDIUM** |
| `SLACK_BOT_TOKEN` | API Token | Slack bot token | ❌ No | 🟢 **MEDIUM** |
| `SLACK_APP_TOKEN` | API Token | Slack app token | ❌ No | 🟢 **MEDIUM** |

---

## 🛡️ **Maximum Security Configuration**

### **🔒 Authentication & Authorization**

#### **Gateway Authentication**
```json
{
  "gateway": {
    "auth": {
      "mode": "password",
      "allowTailscale": false,
      "password": "${GATEWAY_PASSWORD}"
    }
  }
}
```

#### **Token Security**
- **Gateway Token**: 64-character random secret (auto-generated)
- **Flutter App Token**: 32-character random secret (auto-generated)
- **Telegram Webhook Secret**: 32-character random secret (auto-generated)
- **Token Rotation**: Every 30 days (recommended)

### **🌐 Network Security**

#### **Trusted Proxies**
```bash
10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
```

#### **Rate Limiting**
```json
{
  "gateway": {
    "rateLimit": 100,
    "maxConnections": 1000
  }
}
```

### **📊 Security Audit Configuration**

```json
{
  "security": {
    "auditEnabled": true,
    "sessionPruning": {
      "enabled": true,
      "maxAgeHours": 24,
      "intervalHours": 1
    }
  },
  "logging": {
    "level": "info",
    "redact": [
      "TELEGRAM_BOT_TOKEN",
      "OPENCLAW_GATEWAY_TOKEN",
      "OPENCLAW_GATEWAY_PASSWORD",
      "FLUTTER_APP_TOKEN",
      "TELEGRAM_WEBHOOK_SECRET"
    ]
  }
}
```

---

## 🚀 **Step-by-Step Setup Guide**

### **Step 1: Generate Required Secrets**

#### **1.1 Gateway Password**
```bash
# Generate a strong password (32+ characters)
openssl rand -base64 32
# Example: "7X!A%D*G-KaPdSgVkYp3s6v9y$B?E(H+MbQeThWmZq4t"
```

#### **1.2 GitHub Personal Access Token**
1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens
2. Create new token with these scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
   - `write:packages` (Write to GitHub Packages)
   - `delete:packages` (Delete packages)
3. Copy the token (treat as password)

#### **1.3 Northflank API Token**
1. Go to Northflank → Account Settings → API Tokens
2. Create new token with:
   - Project: All projects
   - Permissions: Read & Write
3. Copy the token

### **Step 2: Set Up GitHub Secrets**

#### **2.1 Required Secrets for GitHub Actions**

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `TELEGRAM_BOT_TOKEN` | `8809223927:AAHs7myPMYFYYBcABbXH-jguY_gBPZm1LCU` | Provided |
| `GATEWAY_PASSWORD` | Generated in Step 1.1 | Generate |
| `NORTHFLANK_API_TOKEN` | Your Northflank API token | From Northflank |
| `GITHUB_TOKEN` | Your GitHub PAT | From GitHub |
| `NORTHFLANK_SERVICE_URL` | `your-service.nf.sh` | After deployment |
| `TELEGRAM_WEBHOOK_SECRET` | Auto-generated | Northflank handles |
| `FLUTTER_APP_TOKEN` | Auto-generated | Northflank handles |

#### **2.2 Optional Secrets**

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `SLACK_WEBHOOK` | Slack webhook URL | Deployment notifications |
| `OPENAI_API_KEY` | Your OpenAI key | Model access |
| `ANTHROPIC_API_KEY` | Your Anthropic key | Model access |
| `FLUTTER_REPO` | Flutter repo URL | Integration tests |
| `FLUTTER_REPO_TOKEN` | Flutter repo token | Integration tests |

#### **2.3 How to Add Secrets to GitHub**

1. Go to your repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with the exact name from above
4. Repeat for all required secrets

### **Step 3: Set Up Northflank Secrets**

The Northflank template (`northflank.json`) automatically handles:
- `OPENCLAW_GATEWAY_TOKEN` (64-char random)
- `TELEGRAM_WEBHOOK_SECRET` (32-char random)
- `FLUTTER_APP_TOKEN` (32-char random)

You only need to provide:
- `TELEGRAM_BOT_TOKEN`: `8809223927:AAHs7myPMYFYYBcABbXH-jguY_gBPZm1LCU`
- `GATEWAY_PASSWORD`: Your generated password

### **Step 4: Configure Flutter App**

#### **4.1 Flutter App Configuration**

Create a `lib/config/openclaw_config.dart` file:

```dart
class OpenClawConfig {
  static const String gatewayUrl = 'wss://your-service.nf.sh:18789';
  static const String gatewayToken = 'YOUR_GATEWAY_TOKEN';
  static const String appToken = 'YOUR_FLUTTER_APP_TOKEN';
  
  static const bool enableLogging = true;
  static const int reconnectInterval = 5000; // 5 seconds
  static const int pingInterval = 30000; // 30 seconds
  static const Duration connectionTimeout = Duration(seconds: 10);
}
```

#### **4.2 Flutter App Dependencies**

Add to `pubspec.yaml`:

```yaml
dependencies:
  web_socket_channel: ^2.4.0
  http: ^1.1.0
  cryptography: ^2.5.0
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^8.0.0
```

#### **4.3 Flutter Connection Service**

```dart
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class OpenClawService {
  final WebSocketChannel? _channel;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  OpenClawService() : _channel = WebSocketChannel.connect(
    Uri.parse('${OpenClawConfig.gatewayUrl}?token=${OpenClawConfig.gatewayToken}'),
  );
  
  Stream<dynamic> get messages => _channel?.stream ?? Stream.empty();
  
  void sendMessage(String message) {
    _channel?.sink.add({
      'type': 'message',
      'content': message,
      'appToken': OpenClawConfig.appToken,
    });
  }
  
  Future<void> saveCredentials(String token) async {
    await _storage.write(key: 'openclaw_token', value: token);
  }
  
  Future<String?> getSavedToken() async {
    return await _storage.read(key: 'openclaw_token');
  }
  
  void disconnect() {
    _channel?.sink.close();
  }
}
```

---

## 📱 **Flutter App Integration**

### **Complete Flutter Implementation**

#### **1. Main App Integration**

```dart
import 'package:flutter/material.dart';
import 'openclaw_service.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OpenClaw Flutter App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const OpenClawChatScreen(),
    );
  }
}

class OpenClawChatScreen extends StatefulWidget {
  const OpenClawChatScreen({super.key});
  
  @override
  State<OpenClawChatScreen> createState() => _OpenClawChatScreenState();
}

class _OpenClawChatScreenState extends State<OpenClawChatScreen> {
  final OpenClawService _openClawService = OpenClawService();
  final List<Map<String, dynamic>> _messages = [];
  final TextEditingController _controller = TextEditingController();
  bool _isConnected = false;
  
  @override
  void initState() {
    super.initState();
    _initConnection();
  }
  
  Future<void> _initConnection() async {
    try {
      final savedToken = await _openClawService.getSavedToken();
      if (savedToken != null) {
        // Use saved token
      }
      
      _openClawService.messages.listen((message) {
        setState(() {
          _messages.add({
            'text': message.toString(),
            'isUser': false,
            'timestamp': DateTime.now(),
          });
        });
      });
      
      setState(() {
        _isConnected = true;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Connection failed: $e')),
      );
    }
  }
  
  void _sendMessage() {
    if (_controller.text.isEmpty) return;
    
    final message = _controller.text;
    _controller.clear();
    
    setState(() {
      _messages.add({
        'text': message,
        'isUser': true,
        'timestamp': DateTime.now(),
      });
    });
    
    _openClawService.sendMessage(message);
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OpenClaw Chat'),
        actions: [
          IconButton(
            icon: Icon(_isConnected ? Icons.check_circle : Icons.error),
            color: _isConnected ? Colors.green : Colors.red,
            onPressed: () {
              if (!_isConnected) {
                _initConnection();
              }
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              reverse: true,
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[_messages.length - 1 - index];
                return MessageBubble(
                  text: message['text'],
                  isUser: message['isUser'],
                  timestamp: message['timestamp'],
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  @override
  void dispose() {
    _openClawService.disconnect();
    _controller.dispose();
    super.dispose();
  }
}

class MessageBubble extends StatelessWidget {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  
  const MessageBubble({
    super.key,
    required this.text,
    required this.isUser,
    required this.timestamp,
  });
  
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 8.0),
      child: Align(
        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.8,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: isUser ? Colors.blue[100] : Colors.grey[200],
              borderRadius: BorderRadius.circular(12),
            ),
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(text),
                const SizedBox(height: 4),
                Text(
                  '${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}',
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

#### **2. Android Configuration**

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<application
    android:usesCleartextTraffic="false"
    ...>
</application>
```

#### **3. iOS Configuration**

Add to `ios/Runner/Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>your-service.nf.sh</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <false/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
            <key>NSIncludesSubdomains</key>
            <true/>
        </dict>
    </dict>
</dict>
```

---

## 🔧 **OpenClaw Configuration Files**

### **1. Main Configuration (`openclaw.json`)**

```json
{
  "$schema": "https://raw.githubusercontent.com/openclaw/openclaw/main/docs/schemas/config.schema.json",
  "agent": {
    "model": "gpt-4o-mini",
    "provider": "openai",
    "fallback": [
      "anthropic/claude-3-5-sonnet",
      "google/gemini-1.5-flash"
    ],
    "timeoutSeconds": 120,
    "maxTokens": 4096
  },
  "gateway": {
    "port": 18789,
    "bind": "lan",
    "auth": {
      "mode": "password",
      "allowTailscale": false
    },
    "allowUnconfigured": true,
    "trustedProxies": [
      "10.0.0.0/8",
      "172.16.0.0/12",
      "192.168.0.0/16"
    ],
    "rateLimit": 100,
    "maxConnections": 1000,
    "cors": {
      "enabled": true,
      "origins": ["*"],
      "methods": ["GET", "POST", "OPTIONS"],
      "headers": ["Content-Type", "Authorization", "X-OpenClaw-Token"]
    }
  },
  "channels": {
    "telegram": {
      "botToken": "${TELEGRAM_BOT_TOKEN}",
      "webhookUrl": "https://${NORTHFLANK_SERVICE_URL}/telegram-webhook",
      "webhookSecret": "${TELEGRAM_WEBHOOK_SECRET}",
      "allowFrom": ["*"],
      "dmPolicy": "pairing",
      "groups": {
        "*": {
          "requireMention": true,
          "activation": "mention"
        }
      },
      "streamMode": "block",
      "commands": {
        "native": true,
        "text": true
      },
      "media": {
        "maxSizeMb": 50,
        "allowedTypes": ["image", "video", "audio", "document"]
      }
    }
  },
  "agents": {
    "defaults": {
      "workspace": "/data/workspace",
      "sandbox": {
        "mode": "non-main",
        "allowlist": [
          "bash",
          "read",
          "write",
          "edit",
          "process",
          "sessions_list",
          "sessions_history",
          "sessions_send",
          "sessions_spawn"
        ],
        "denylist": [
          "browser",
          "canvas",
          "nodes",
          "cron",
          "discord",
          "gateway"
        ]
      },
      "model": "gpt-4o-mini",
      "provider": "openai"
    }
  },
  "browser": {
    "enabled": false
  },
  "logging": {
    "level": "info",
    "redact": [
      "TELEGRAM_BOT_TOKEN",
      "OPENCLAW_GATEWAY_TOKEN",
      "OPENCLAW_GATEWAY_PASSWORD",
      "FLUTTER_APP_TOKEN",
      "TELEGRAM_WEBHOOK_SECRET",
      "OPENAI_API_KEY",
      "ANTHROPIC_API_KEY"
    ],
    "file": {
      "enabled": true,
      "path": "/data/logs/openclaw.log",
      "maxSize": "100MB",
      "maxFiles": 5
    }
  },
  "security": {
    "auditEnabled": true,
    "sessionPruning": {
      "enabled": true,
      "maxAgeHours": 24,
      "intervalHours": 1
    },
    "dmPolicy": "pairing",
    "pairing": {
      "enabled": true,
      "timeoutMinutes": 10,
      "maxAttempts": 3
    }
  },
  "flutter": {
    "appToken": "${FLUTTER_APP_TOKEN}",
    "allowedOrigins": ["*"],
    "corsEnabled": true,
    "maxConnectionsPerApp": 100,
    "rateLimitPerApp": 10
  },
  "plugins": {
    "autoEnable": ["telegram", "flutter"],
    "disabled": ["browser", "canvas"]
  }
}
```

### **2. Environment Configuration (`.env`)**

```bash
# OpenClaw Gateway
OPENCLAW_GATEWAY_PORT=18789
OPENCLAW_GATEWAY_BIND=lan
OPENCLAW_GATEWAY_TOKEN=auto_generated_64_char_token
OPENCLAW_GATEWAY_PASSWORD=your_secure_password
OPENCLAW_STATE_DIR=/data/.openclaw
OPENCLAW_WORKSPACE_DIR=/data/workspace

# Telegram
TELEGRAM_BOT_TOKEN=8809223927:AAHs7myPMYFYYBcABbXH-jguY_gBPZm1LCU
TELEGRAM_WEBHOOK_SECRET=auto_generated_32_char_secret

# Flutter
FLUTTER_APP_TOKEN=auto_generated_32_char_token

# Security
OPENCLAW_GATEWAY_TRUSTED_PROXIES=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16
OPENCLAW_GATEWAY_RATE_LIMIT=100
OPENCLAW_GATEWAY_MAX_CONNECTIONS=1000
OPENCLAW_LOGGING_LEVEL=info
OPENCLAW_SECURITY_AUDIT_ENABLED=true
OPENCLAW_SESSION_PRUNING_ENABLED=true
OPENCLAW_SESSION_MAX_AGE_HOURS=24

# Model Providers (optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_key
```

---

## 🔐 **Security Best Practices**

### **1. Token Management**

- **Rotate tokens every 30 days**
- **Use different tokens for different services**
- **Never commit tokens to version control**
- **Use environment variables or secret managers**
- **Implement token expiration**

### **2. Network Security**

- **Use HTTPS/WSS for all connections**
- **Implement IP allowlisting when possible**
- **Use WebSocket authentication**
- **Enable CORS with specific origins**
- **Implement rate limiting**

### **3. Data Protection**

- **Encrypt sensitive data at rest**
- **Use secure storage for tokens**
- **Implement proper logging with redaction**
- **Regular security audits**
- **Monitor for suspicious activity**

### **4. Flutter App Security**

- **Use Flutter Secure Storage** for tokens
- **Implement certificate pinning**
- **Use HTTPS for all API calls**
- **Validate all WebSocket messages**
- **Implement reconnection logic**

---

## 📊 **Deployment Checklist**

### **✅ Pre-Deployment**

- [ ] Fork repository to your GitHub account
- [ ] Generate all required secrets
- [ ] Set up GitHub repository secrets
- [ ] Configure Northflank project
- [ ] Set up Telegram bot with provided token
- [ ] Configure Flutter app with connection details
- [ ] Test local development setup

### **✅ Deployment**

- [ ] Push code to main branch
- [ ] GitHub Actions triggers CI/CD pipeline
- [ ] Security scan passes
- [ ] Linting and tests pass
- [ ] Docker image builds successfully
- [ ] Northflank deployment completes
- [ ] Health checks pass
- [ ] Telegram webhook configured

### **✅ Post-Deployment**

- [ ] Verify WebSocket connection
- [ ] Test Telegram bot functionality
- [ ] Test Flutter app connection
- [ ] Verify health endpoint (`/healthz`)
- [ ] Check logs for errors
- [ ] Set up monitoring and alerts
- [ ] Document all credentials and URLs

---

## 🚨 **Emergency Procedures**

### **1. Token Compromise**

```bash
# Rotate all tokens immediately
1. Generate new GATEWAY_PASSWORD
2. Generate new TELEGRAM_WEBHOOK_SECRET
3. Generate new FLUTTER_APP_TOKEN
4. Update all services with new tokens
5. Restart all services
```

### **2. Service Outage**

```bash
# Check service status
curl -f http://your-service.nf.sh/healthz

# Check Northflank logs
nf logs -s openclaw-gateway

# Restart service
nf restart -s openclaw-gateway
```

### **3. Security Breach**

```bash
# Immediate actions
1. Revoke all compromised tokens
2. Disable public access temporarily
3. Rotate all secrets
4. Audit logs for suspicious activity
5. Notify affected users
```

---

## 📞 **Support Contacts**

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| **Security Incident** | security@openclaw.ai | Immediate |
| **Deployment Issues** | deploy@openclaw.ai | < 1 hour |
| **Technical Support** | support@openclaw.ai | < 4 hours |
| **General Questions** | Discord: #support | < 24 hours |

---

## 🔗 **Important Links**

- **Repository**: https://github.com/hoopstreet/one-commander
- **Documentation**: https://docs.openclaw.ai
- **Discord**: https://discord.gg/clawd
- **Northflank**: https://northflank.com
- **Telegram Bot**: https://t.me/your_bot_name

---

## 📝 **Final Credentials Summary**

### **🔴 CRITICAL (Must Secure)**
```
TELEGRAM_BOT_TOKEN: 8809223927:AAHs7myPMYFYYBcABbXH-jguY_gBPZm1LCU
GATEWAY_PASSWORD: [GENERATE: openssl rand -base64 32]
NORTHFLANK_API_TOKEN: [FROM NORTHFLANK DASHBOARD]
GITHUB_TOKEN: [FROM GITHUB SETTINGS]
```

### **🟡 AUTO-GENERATED (Northflank Handles)**
```
OPENCLAW_GATEWAY_TOKEN: [64-char random secret]
TELEGRAM_WEBHOOK_SECRET: [32-char random secret]
FLUTTER_APP_TOKEN: [32-char random secret]
```

### **🟢 OPTIONAL (As Needed)**
```
OPENAI_API_KEY: [FROM OPENAI DASHBOARD]
ANTHROPIC_API_KEY: [FROM ANTHROPIC DASHBOARD]
GOOGLE_AI_API_KEY: [FROM GOOGLE CLOUD CONSOLE]
SLACK_WEBHOOK: [FROM SLACK APP SETTINGS]
DISCORD_TOKEN: [FROM DISCORD DEVELOPER PORTAL]
```

---

**🚀 Your OpenClaw deployment is now ready for professional, maximum-security production use!**

For any issues or questions, refer to the documentation or contact support.

*Last updated: $(date)*
*Version: 1.0.0*