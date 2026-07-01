# 🚀 Flutter App Integration with OpenClaw Gateway

Complete guide for integrating Flutter mobile apps with OpenClaw Gateway deployed on Northflank.

---

## 📋 **Integration Overview**

This guide provides everything needed to connect Flutter applications to your OpenClaw Gateway instance running on Northflank, enabling real-time AI chat functionality alongside your Telegram bot.

### **Architecture**
```
Flutter App → WebSocket (wss://) → Northflank OpenClaw Gateway → AI Models
                              ↓
                       Telegram Bot Integration
```

---

## 🔧 **Prerequisites**

### **1. Deployed OpenClaw Gateway**
- ✅ Northflank deployment completed
- ✅ Telegram bot configured with token: `8809223927:AAHs7myPMYFYYBcABbXH-jguY_gBPZm1LCU`
- ✅ Health endpoint working: `https://your-service.nf.sh/healthz`
- ✅ WebSocket endpoint available: `wss://your-service.nf.sh:18789`

### **2. Flutter Development Environment**
- Flutter SDK ≥ 3.19.0
- Dart ≥ 3.3.0
- Android Studio / Xcode
- WebSocket testing tools (optional)

---

## 📦 **Step 1: Add Dependencies**

### **pubspec.yaml**

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # WebSocket communication
  web_socket_channel: ^2.4.0
  
  # HTTP requests
  http: ^1.1.0
  
  # Secure storage for tokens
  flutter_secure_storage: ^8.0.0
  
  # Shared preferences for settings
  shared_preferences: ^2.2.2
  
  # JSON serialization
  json_annotation: ^4.8.1
  
  # State management (optional)
  provider: ^6.1.1
  
  # Logging
  logger: ^2.0.2+1
  
  # Network connectivity
  connectivity_plus: ^5.0.2
  
  # Encryption
  cryptography: ^2.5.0
  
  # UUID generation
  uuid: ^4.2.1

dev_dependencies:
  build_runner: ^2.4.6
  json_serializable: ^6.7.1
  flutter_lints: ^3.0.1
```

Run:
```bash
flutter pub get
```

---

## 🗃️ **Step 2: Configuration Files**

### **1. Environment Configuration**

#### **lib/config/environment.dart**

```dart
import 'package:flutter/foundation.dart';

class Environment {
  static const String openclawGatewayUrl = 
      kDebugMode 
          ? 'ws://localhost:18789' 
          : 'wss://your-service.nf.sh:18789';
  
  static const String openclawHttpUrl = 
      kDebugMode 
          ? 'http://localhost:18789' 
          : 'https://your-service.nf.sh';
  
  static const String gatewayToken = String.fromEnvironment(
    'OPENCLAW_GATEWAY_TOKEN',
    defaultValue: 'your_gateway_token_here',
  );
  
  static const String appToken = String.fromEnvironment(
    'FLUTTER_APP_TOKEN',
    defaultValue: 'your_flutter_app_token_here',
  );
  
  static const bool enableLogging = kDebugMode;
  static const int reconnectIntervalMs = 5000;
  static const int pingIntervalMs = 30000;
  static const Duration connectionTimeout = Duration(seconds: 10);
  static const int maxRetries = 3;
}
```

#### **Android Configuration**

**android/app/src/main/AndroidManifest.xml**
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yourcompany.openclaw">
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    
    <application
        android:label="OpenClaw Chat"
        android:icon="@mipmap/ic_launcher"
        android:usesCleartextTraffic="false"
        android:requestLegacyExternalStorage="true">
        
        <activity
            android:name=".MainActivity"
            android:launchMode="singleTop"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
    </application>
    
</manifest>
```

#### **iOS Configuration**

**ios/Runner/Info.plist**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>OpenClaw Chat</string>
    
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
    
    <key>UIBackgroundModes</key>
    <array>
        <string>fetch</string>
        <string>remote-notification</string>
    </array>
    
</dict>
</plist>
```

---

## 🔌 **Step 3: WebSocket Service Implementation**

### **1. Message Models**

#### **lib/models/openclaw_message.dart**

```dart
import 'package:json_annotation/json_annotation.dart';

part 'openclaw_message.g.dart';

@JsonSerializable()
class OpenClawMessage {
  final String type;
  final String? content;
  final String? sessionId;
  final String? messageId;
  final DateTime timestamp;
  final Map<String, dynamic>? metadata;
  final bool? isStreaming;
  final int? streamIndex;
  final int? totalStreams;

  const OpenClawMessage({
    required this.type,
    this.content,
    this.sessionId,
    this.messageId,
    required this.timestamp,
    this.metadata,
    this.isStreaming,
    this.streamIndex,
    this.totalStreams,
  });

  factory OpenClawMessage.fromJson(Map<String, dynamic> json) =>
      _$OpenClawMessageFromJson(json);

  Map<String, dynamic> toJson() => _$OpenClawMessageToJson(this);

  // Message types
  static const String typeMessage = 'message';
  static const String typePing = 'ping';
  static const String typePong = 'pong';
  static const String typeError = 'error';
  static const String typeAuthRequired = 'auth_required';
  static const String typeAuthSuccess = 'auth_success';
  static const String typeAuthFailed = 'auth_failed';
  static const String typeStreamStart = 'stream_start';
  static const String typeStreamChunk = 'stream_chunk';
  static const String typeStreamEnd = 'stream_end';
}
```

Run to generate serialization code:
```bash
flutter pub run build_runner build
```

### **2. WebSocket Service**

#### **lib/services/openclaw_websocket_service.dart**

```dart
import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:logger/logger.dart';
import 'package:uuid/uuid.dart';
import '../models/openclaw_message.dart';
import '../config/environment.dart';

class OpenClawWebSocketService {
  static final Logger _logger = Logger();
  static final Uuid _uuid = const Uuid();
  
  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  Completer<void>? _connectionCompleter;
  
  final StreamController<OpenClawMessage> _messageController = 
      StreamController.broadcast();
  final StreamController<bool> _connectionController = 
      StreamController.broadcast();
  
  String? _currentSessionId;
  int _reconnectAttempts = 0;
  Timer? _reconnectTimer;
  Timer? _pingTimer;
  
  // Connection state
  bool _isConnected = false;
  bool _isAuthenticating = false;
  bool _isDisposed = false;
  
  // Stream getters
  Stream<OpenClawMessage> get messages => _messageController.stream;
  Stream<bool> get connectionChanges => _connectionController.stream;
  bool get isConnected => _isConnected;
  String? get currentSessionId => _currentSessionId;
  
  // Singleton
  static final OpenClawWebSocketService _instance = 
      OpenClawWebSocketService._internal();
  
  factory OpenClawWebSocketService() => _instance;
  
  OpenClawWebSocketService._internal();
  
  /// Connect to OpenClaw Gateway
  Future<void> connect({String? customToken}) async {
    if (_isConnected || _isDisposed) return;
    
    _logger.i('Connecting to OpenClaw Gateway...');
    _connectionCompleter = Completer();
    
    try {
      final token = customToken ?? Environment.gatewayToken;
      final url = Uri.parse(
        '${Environment.openclawGatewayUrl}?token=$token&appToken=${Environment.appToken}'
      );
      
      _logger.d('Connecting to: $url');
      
      _channel = WebSocketChannel.connect(url);
      
      _subscription = _channel?.stream.listen(
        _handleMessage,
        onError: _handleError,
        onDone: _handleDisconnect,
        cancelOnError: false,
      );
      
      // Start ping timer
      _startPingTimer();
      
      // Wait for connection
      await _connectionCompleter?.future.timeout(
        Environment.connectionTimeout,
      );
      
      _logger.i('Connected to OpenClaw Gateway');
      _connectionController.add(true);
      
    } catch (e, stackTrace) {
      _logger.e('Connection failed', error: e, stackTrace: stackTrace);
      _cleanup();
      _scheduleReconnect();
      rethrow;
    }
  }
  
  /// Disconnect from OpenClaw Gateway
  Future<void> disconnect() async {
    _logger.i('Disconnecting from OpenClaw Gateway');
    _cleanup();
    _connectionController.add(false);
  }
  
  /// Send message to OpenClaw
  Future<void> sendMessage(String content, {Map<String, dynamic>? metadata}) async {
    if (!_isConnected) {
      throw Exception('Not connected to OpenClaw Gateway');
    }
    
    final message = OpenClawMessage(
      type: OpenClawMessage.typeMessage,
      content: content,
      sessionId: _currentSessionId ?? _uuid.v4(),
      messageId: _uuid.v4(),
      timestamp: DateTime.now(),
      metadata: {
        'app': 'flutter',
        'platform': 'mobile',
        ...?metadata,
      },
    );
    
    _logger.d('Sending message: ${message.toJson()}');
    _channel?.sink.add(jsonEncode(message.toJson()));
  }
  
  /// Start a new session
  Future<String> startSession({Map<String, dynamic>? context}) async {
    final sessionId = _uuid.v4();
    _currentSessionId = sessionId;
    
    final message = OpenClawMessage(
      type: 'session_start',
      content: jsonEncode(context ?? {}),
      sessionId: sessionId,
      messageId: _uuid.v4(),
      timestamp: DateTime.now(),
      metadata: {
        'app': 'flutter',
        'action': 'session_start',
      },
    );
    
    _channel?.sink.add(jsonEncode(message.toJson()));
    return sessionId;
  }
  
  /// End current session
  Future<void> endSession() async {
    if (_currentSessionId == null) return;
    
    final message = OpenClawMessage(
      type: 'session_end',
      sessionId: _currentSessionId,
      messageId: _uuid.v4(),
      timestamp: DateTime.now(),
      metadata: {
        'app': 'flutter',
        'action': 'session_end',
      },
    );
    
    _channel?.sink.add(jsonEncode(message.toJson()));
    _currentSessionId = null;
  }
  
  /// Handle incoming messages
  void _handleMessage(dynamic data) {
    try {
      if (data is! String) {
        _logger.w('Received non-string message: $data');
        return;
      }
      
      final jsonData = jsonDecode(data) as Map<String, dynamic>;
      final message = OpenClawMessage.fromJson(jsonData);
      
      _logger.d('Received message: ${message.type}');
      
      switch (message.type) {
        case OpenClawMessage.typePing:
          _handlePing();
          break;
        case OpenClawMessage.typeAuthRequired:
          _handleAuthRequired();
          break;
        case OpenClawMessage.typeAuthSuccess:
          _handleAuthSuccess(message);
          break;
        case OpenClawMessage.typeAuthFailed:
          _handleAuthFailed(message);
          break;
        case OpenClawMessage.typeError:
          _handleErrorMessage(message);
          break;
        default:
          _messageController.add(message);
      }
      
      // Update session ID if present
      if (message.sessionId != null) {
        _currentSessionId = message.sessionId;
      }
      
      // Mark as connected if we receive any message
      if (!_isConnected) {
        _isConnected = true;
        _reconnectAttempts = 0;
        _connectionCompleter?.complete();
        _connectionController.add(true);
      }
      
    } catch (e, stackTrace) {
      _logger.e('Error handling message', error: e, stackTrace: stackTrace);
    }
  }
  
  /// Handle ping messages
  void _handlePing() {
    _logger.d('Received ping, sending pong');
    final pongMessage = OpenClawMessage(
      type: OpenClawMessage.typePong,
      timestamp: DateTime.now(),
    );
    _channel?.sink.add(jsonEncode(pongMessage.toJson()));
  }
  
  /// Handle authentication required
  void _handleAuthRequired() {
    _logger.w('Authentication required');
    _isAuthenticating = true;
    // Re-authenticate
    disconnect();
    connect();
  }
  
  /// Handle authentication success
  void _handleAuthSuccess(OpenClawMessage message) {
    _logger.i('Authentication successful');
    _isAuthenticating = false;
    _currentSessionId = message.sessionId;
  }
  
  /// Handle authentication failed
  void _handleAuthFailed(OpenClawMessage message) {
    _logger.e('Authentication failed: ${message.content}');
    _isAuthenticating = false;
    _connectionCompleter?.completeError(
      Exception('Authentication failed: ${message.content}')
    );
  }
  
  /// Handle error messages
  void _handleErrorMessage(OpenClawMessage message) {
    _logger.e('Error message: ${message.content}');
    _messageController.addError(Exception(message.content));
  }
  
  /// Handle connection errors
  void _handleError(dynamic error, [StackTrace? stackTrace]) {
    _logger.e('WebSocket error', error: error, stackTrace: stackTrace);
    _cleanup();
    _scheduleReconnect();
  }
  
  /// Handle disconnection
  void _handleDisconnect() {
    _logger.i('WebSocket disconnected');
    _cleanup();
    _scheduleReconnect();
  }
  
  /// Start ping timer
  void _startPingTimer() {
    _pingTimer?.cancel();
    _pingTimer = Timer.periodic(
      Duration(milliseconds: Environment.pingIntervalMs),
      (timer) {
        if (_isConnected && !_isAuthenticating) {
          final pingMessage = OpenClawMessage(
            type: OpenClawMessage.typePing,
            timestamp: DateTime.now(),
          );
          _channel?.sink.add(jsonEncode(pingMessage.toJson()));
        }
      },
    );
  }
  
  /// Schedule reconnection
  void _scheduleReconnect() {
    if (_isDisposed) return;
    
    _reconnectTimer?.cancel();
    
    if (_reconnectAttempts >= Environment.maxRetries) {
      _logger.e('Max reconnection attempts reached');
      _connectionCompleter?.completeError(
        Exception('Failed to connect after ${Environment.maxRetries} attempts')
      );
      return;
    }
    
    _reconnectAttempts++;
    final delay = Duration(
      milliseconds: Environment.reconnectIntervalMs * _reconnectAttempts,
    );
    
    _logger.i('Scheduling reconnect in ${delay.inSeconds} seconds (attempt $_reconnectAttempts)');
    
    _reconnectTimer = Timer(delay, () {
      if (!_isDisposed) {
        connect();
      }
    });
  }
  
  /// Cleanup resources
  void _cleanup() {
    _isConnected = false;
    _isAuthenticating = false;
    _connectionCompleter?.completeError(Exception('Disconnected'));
    
    _subscription?.cancel();
    _subscription = null;
    
    _channel?.sink.close();
    _channel = null;
    
    _pingTimer?.cancel();
    _pingTimer = null;
    
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    
    _connectionCompleter = null;
  }
  
  /// Dispose service
  void dispose() {
    _isDisposed = true;
    _cleanup();
    _messageController.close();
    _connectionController.close();
  }
}
```

---

## 🎨 **Step 4: UI Implementation**

### **1. Chat Screen**

#### **lib/screens/chat_screen.dart**

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/openclaw_websocket_service.dart';
import '../models/openclaw_message.dart';
import '../widgets/message_bubble.dart';
import '../widgets/typing_indicator.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();
  
  late final OpenClawWebSocketService _websocketService;
  
  final List<OpenClawMessage> _messages = [];
  bool _isSending = false;
  bool _isConnected = false;
  bool _isStreaming = false;
  String _streamingContent = '';
  
  @override
  void initState() {
    super.initState();
    _websocketService = OpenClawWebSocketService();
    _initWebSocket();
  }
  
  Future<void> _initWebSocket() async {
    try {
      await _websocketService.connect();
      setState(() {
        _isConnected = _websocketService.isConnected;
      });
      
      _websocketService.connectionChanges.listen((isConnected) {
        setState(() {
          _isConnected = isConnected;
        });
      });
      
      _websocketService.messages.listen(_handleMessage);
      
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Connection failed: $e')),
      );
    }
  }
  
  void _handleMessage(OpenClawMessage message) {
    setState(() {
      if (message.type == OpenClawMessage.typeStreamStart) {
        _isStreaming = true;
        _streamingContent = message.content ?? '';
      } else if (message.type == OpenClawMessage.typeStreamChunk) {
        _streamingContent += message.content ?? '';
      } else if (message.type == OpenClawMessage.typeStreamEnd) {
        _isStreaming = false;
        _messages.add(message.copyWith(
          content: _streamingContent + (message.content ?? ''),
          isStreaming: false,
        ));
        _streamingContent = '';
      } else {
        _messages.add(message);
      }
    });
    
    // Auto-scroll to bottom
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
  }
  
  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }
  
  Future<void> _sendMessage() async {
    if (_messageController.text.isEmpty || _isSending) return;
    
    final text = _messageController.text;
    _messageController.clear();
    
    setState(() {
      _isSending = true;
      // Add user message immediately
      _messages.add(OpenClawMessage(
        type: OpenClawMessage.typeMessage,
        content: text,
        sessionId: _websocketService.currentSessionId,
        messageId: const Uuid().v4(),
        timestamp: DateTime.now(),
        metadata: {'sender': 'user'},
      ));
    });
    
    try {
      await _websocketService.sendMessage(text, metadata: {
        'app': 'flutter',
        'platform': 'mobile',
      });
      
      _scrollToBottom();
      
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to send message: $e')),
      );
      
      // Remove the user message if sending failed
      setState(() {
        if (_messages.isNotEmpty && _messages.last.metadata?['sender'] == 'user') {
          _messages.removeLast();
        }
      });
    } finally {
      setState(() {
        _isSending = false;
      });
    }
    
    _focusNode.requestFocus();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OpenClaw Chat'),
        actions: [
          IconButton(
            icon: Icon(
              _isConnected ? Icons.check_circle : Icons.error,
              color: _isConnected ? Colors.green : Colors.red,
            ),
            onPressed: () {
              if (!_isConnected) {
                _initWebSocket();
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              _websocketService.disconnect();
              _initWebSocket();
            },
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'new_session':
                  _websocketService.startSession();
                  break;
                case 'end_session':
                  _websocketService.endSession();
                  break;
                case 'clear_chat':
                  setState(() {
                    _messages.clear();
                  });
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'new_session',
                child: Text('New Session'),
              ),
              const PopupMenuItem(
                value: 'end_session',
                child: Text('End Session'),
              ),
              const PopupMenuItem(
                value: 'clear_chat',
                child: Text('Clear Chat'),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _messages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.chat_bubble_outline,
                          size: 64,
                          color: Colors.grey[400],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Start a conversation',
                          style: TextStyle(
                            fontSize: 18,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _isConnected
                              ? 'Connected to OpenClaw Gateway'
                              : 'Connecting...',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.all(8),
                    itemCount: _messages.length + (_isStreaming ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index < _messages.length) {
                        final message = _messages[index];
                        return MessageBubble(
                          message: message,
                          isUser: message.metadata?['sender'] == 'user',
                        );
                      } else {
                        // Streaming message
                        return TypingIndicator(
                          text: _streamingContent,
                        );
                      }
                    },
                  ),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }
  
  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.all(8),
      color: Theme.of(context).cardColor,
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _messageController,
              focusNode: _focusNode,
              decoration: InputDecoration(
                hintText: 'Type a message...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Theme.of(context).colorScheme.surface,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                suffixIcon: _isSending
                    ? const Padding(
                        padding: EdgeInsets.all(8),
                        child: SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      )
                    : null,
              ),
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _sendMessage(),
              enabled: _isConnected,
            ),
          ),
          const SizedBox(width: 8),
          FloatingActionButton(
            onPressed: _isConnected ? _sendMessage : null,
            backgroundColor: _isConnected 
                ? Theme.of(context).colorScheme.primary 
                : Colors.grey,
            elevation: 0,
            child: const Icon(Icons.send, color: Colors.white),
          ),
        ],
      ),
    );
  }
  
  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    _websocketService.dispose();
    super.dispose();
  }
}
```

### **2. Message Bubble Widget**

#### **lib/widgets/message_bubble.dart**

```dart
import 'package:flutter/material.dart';
import '../models/openclaw_message.dart';

class MessageBubble extends StatelessWidget {
  final OpenClawMessage message;
  final bool isUser;

  const MessageBubble({
    super.key,
    required this.message,
    required this.isUser,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Align(
        alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.85,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: isUser 
                  ? colorScheme.primaryContainer 
                  : colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(16),
                topRight: const Radius.circular(16),
                bottomLeft: isUser 
                    ? const Radius.circular(16) 
                    : const Radius.circular(0),
                bottomRight: isUser 
                    ? const Radius.circular(0) 
                    : const Radius.circular(16),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                SelectableText(
                  message.content ?? '',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: isUser 
                        ? colorScheme.onPrimaryContainer 
                        : colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _formatTime(message.timestamp),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: isUser 
                        ? colorScheme.onPrimaryContainer.withOpacity(0.6) 
                        : colorScheme.onSurface.withOpacity(0.6),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _formatTime(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);
    
    if (difference.inDays > 0) {
      return '${timestamp.day}/${timestamp.month}/${timestamp.year}';
    } else if (difference.inHours > 0) {
      return '${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
    } else {
      return '${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}';
    }
  }
}
```

### **3. Typing Indicator Widget**

#### **lib/widgets/typing_indicator.dart**

```dart
import 'package:flutter/material.dart';

class TypingIndicator extends StatelessWidget {
  final String text;

  const TypingIndicator({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Align(
        alignment: Alignment.centerLeft,
        child: ConstrainedBox(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.85,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
                bottomLeft: Radius.circular(0),
                bottomRight: Radius.circular(16),
              ),
            ),
            padding: const EdgeInsets.all(12),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    text.isNotEmpty ? text : 'Thinking...',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.onSurface,
                    ),
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

---

## 🌐 **Step 5: Main App Setup**

### **lib/main.dart**

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/chat_screen.dart';
import 'services/openclaw_websocket_service.dart';
import 'config/environment.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<OpenClawWebSocketService>(
          create: (_) => OpenClawWebSocketService(),
          dispose: (_, service) => service.dispose(),
        ),
      ],
      child: MaterialApp(
        title: 'OpenClaw Chat',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.blue,
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          fontFamily: 'Inter',
        ),
        darkTheme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: Colors.blue,
            brightness: Brightness.dark,
          ),
          useMaterial3: true,
          fontFamily: 'Inter',
        ),
        themeMode: ThemeMode.system,
        home: const ChatScreen(),
      ),
    );
  }
}
```

---

## 🔐 **Step 6: Security Implementation**

### **1. Secure Token Storage**

#### **lib/services/secure_storage_service.dart**

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:logger/logger.dart';

class SecureStorageService {
  static final Logger _logger = Logger();
  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );

  // Keys
  static const String _gatewayTokenKey = 'openclaw_gateway_token';
  static const String _appTokenKey = 'openclaw_app_token';
  static const String _sessionIdKey = 'openclaw_session_id';
  static const String _userIdKey = 'openclaw_user_id';

  // Singleton
  static final SecureStorageService _instance = SecureStorageService._internal();
  factory SecureStorageService() => _instance;
  SecureStorageService._internal();

  /// Save gateway token
  Future<void> saveGatewayToken(String token) async {
    try {
      await _storage.write(key: _gatewayTokenKey, value: token);
      _logger.i('Gateway token saved securely');
    } catch (e) {
      _logger.e('Failed to save gateway token', error: e);
      rethrow;
    }
  }

  /// Get gateway token
  Future<String?> getGatewayToken() async {
    try {
      return await _storage.read(key: _gatewayTokenKey);
    } catch (e) {
      _logger.e('Failed to read gateway token', error: e);
      return null;
    }
  }

  /// Delete gateway token
  Future<void> deleteGatewayToken() async {
    try {
      await _storage.delete(key: _gatewayTokenKey);
      _logger.i('Gateway token deleted');
    } catch (e) {
      _logger.e('Failed to delete gateway token', error: e);
      rethrow;
    }
  }

  /// Save app token
  Future<void> saveAppToken(String token) async {
    try {
      await _storage.write(key: _appTokenKey, value: token);
      _logger.i('App token saved securely');
    } catch (e) {
      _logger.e('Failed to save app token', error: e);
      rethrow;
    }
  }

  /// Get app token
  Future<String?> getAppToken() async {
    try {
      return await _storage.read(key: _appTokenKey);
    } catch (e) {
      _logger.e('Failed to read app token', error: e);
      return null;
    }
  }

  /// Save session ID
  Future<void> saveSessionId(String sessionId) async {
    try {
      await _storage.write(key: _sessionIdKey, value: sessionId);
    } catch (e) {
      _logger.e('Failed to save session ID', error: e);
      rethrow;
    }
  }

  /// Get session ID
  Future<String?> getSessionId() async {
    try {
      return await _storage.read(key: _sessionIdKey);
    } catch (e) {
      _logger.e('Failed to read session ID', error: e);
      return null;
    }
  }

  /// Save user ID
  Future<void> saveUserId(String userId) async {
    try {
      await _storage.write(key: _userIdKey, value: userId);
    } catch (e) {
      _logger.e('Failed to save user ID', error: e);
      rethrow;
    }
  }

  /// Get user ID
  Future<String?> getUserId() async {
    try {
      return await _storage.read(key: _userIdKey);
    } catch (e) {
      _logger.e('Failed to read user ID', error: e);
      return null;
    }
  }

  /// Clear all data
  Future<void> clearAll() async {
    try {
      await _storage.deleteAll();
      _logger.i('All secure storage data cleared');
    } catch (e) {
      _logger.e('Failed to clear storage', error: e);
      rethrow;
    }
  }

  /// Check if tokens exist
  Future<bool> hasTokens() async {
    try {
      final gatewayToken = await getGatewayToken();
      final appToken = await getAppToken();
      return gatewayToken != null && appToken != null;
    } catch (e) {
      _logger.e('Failed to check tokens', error: e);
      return false;
    }
  }
}
```

### **2. Authentication Service**

#### **lib/services/auth_service.dart**

```dart
import 'package:flutter/foundation.dart';
import 'secure_storage_service.dart';
import 'openclaw_websocket_service.dart';
import '../config/environment.dart';

class AuthService {
  final SecureStorageService _storage = SecureStorageService();
  final OpenClawWebSocketService _websocketService = OpenClawWebSocketService();

  // Singleton
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  /// Initialize authentication
  Future<bool> initialize() async {
    try {
      // Check if we have saved tokens
      final hasTokens = await _storage.hasTokens();
      
      if (hasTokens) {
        // Use saved tokens
        final gatewayToken = await _storage.getGatewayToken();
        final appToken = await _storage.getAppToken();
        
        if (gatewayToken != null && appToken != null) {
          // Override environment tokens with saved ones
          // Note: In production, you might want to use the saved tokens
          // directly instead of overriding environment
          return true;
        }
      }
      
      // Use environment tokens for initial connection
      return true;
      
    } catch (e) {
      debugPrint('Auth initialization failed: $e');
      return false;
    }
  }

  /// Authenticate with OpenClaw Gateway
  Future<bool> authenticate({String? customToken}) async {
    try {
      // Connect to WebSocket
      await _websocketService.connect(customToken: customToken);
      
      // Save tokens if using environment
      if (customToken == null) {
        await _storage.saveGatewayToken(Environment.gatewayToken);
        await _storage.saveAppToken(Environment.appToken);
      }
      
      return _websocketService.isConnected;
      
    } catch (e) {
      debugPrint('Authentication failed: $e');
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      // Disconnect WebSocket
      await _websocketService.disconnect();
      
      // Clear tokens
      await _storage.clearAll();
      
    } catch (e) {
      debugPrint('Logout failed: $e');
      rethrow;
    }
  }

  /// Get current authentication state
  Future<Map<String, dynamic>> getAuthState() async {
    try {
      final gatewayToken = await _storage.getGatewayToken();
      final appToken = await _storage.getAppToken();
      final sessionId = await _storage.getSessionId();
      final userId = await _storage.getUserId();
      
      return {
        'isAuthenticated': gatewayToken != null && appToken != null,
        'gatewayToken': gatewayToken != null,
        'appToken': appToken != null,
        'sessionId': sessionId,
        'userId': userId,
        'isConnected': _websocketService.isConnected,
      };
      
    } catch (e) {
      debugPrint('Failed to get auth state: $e');
      return {
        'isAuthenticated': false,
        'error': e.toString(),
      };
    }
  }
}
```

---

## 📊 **Step 7: Connection Status Widget**

### **lib/widgets/connection_status.dart**

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/openclaw_websocket_service.dart';

class ConnectionStatusWidget extends StatelessWidget {
  const ConnectionStatusWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final websocketService = Provider.of<OpenClawWebSocketService>(context);
    
    return StreamBuilder<bool>(
      stream: websocketService.connectionChanges,
      initialData: websocketService.isConnected,
      builder: (context, snapshot) {
        final isConnected = snapshot.data ?? false;
        
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isConnected ? Icons.check_circle : Icons.error,
              color: isConnected ? Colors.green : Colors.red,
              size: 16,
            ),
            const SizedBox(width: 4),
            Text(
              isConnected ? 'Connected' : 'Disconnected',
              style: TextStyle(
                fontSize: 12,
                color: isConnected ? Colors.green : Colors.red,
              ),
            ),
          ],
        );
      },
    );
  }
}
```

---

## 🧪 **Step 8: Testing & Debugging**

### **1. WebSocket Test Page**

#### **lib/screens/test_screen.dart**

```dart
import 'package:flutter/material.dart';
import '../services/openclaw_websocket_service.dart';
import '../models/openclaw_message.dart';

class TestScreen extends StatefulWidget {
  const TestScreen({super.key});

  @override
  State<TestScreen> createState() => _TestScreenState();
}

class _TestScreenState extends State<TestScreen> {
  final OpenClawWebSocketService _websocketService = OpenClawWebSocketService();
  final TextEditingController _messageController = TextEditingController();
  
  final List<String> _logs = [];
  bool _isConnected = false;
  
  @override
  void initState() {
    super.initState();
    _initWebSocket();
  }
  
  Future<void> _initWebSocket() async {
    try {
      await _websocketService.connect();
      setState(() {
        _isConnected = true;
        _addLog('Connected to OpenClaw Gateway');
      });
      
      _websocketService.connectionChanges.listen((isConnected) {
        setState(() {
          _isConnected = isConnected;
          _addLog('Connection state: ${isConnected ? 'Connected' : 'Disconnected'}');
        });
      });
      
      _websocketService.messages.listen((message) {
        _addLog('Received: ${message.type} - ${message.content}');
      });
      
    } catch (e) {
      _addLog('Connection error: $e');
    }
  }
  
  void _addLog(String message) {
    setState(() {
      _logs.add('[${DateTime.now().toLocal().toString().split('.').first}] $message');
    });
  }
  
  Future<void> _sendTestMessage() async {
    if (!_isConnected) {
      _addLog('Not connected');
      return;
    }
    
    final text = _messageController.text;
    if (text.isEmpty) return;
    
    try {
      await _websocketService.sendMessage(text);
      _addLog('Sent: $text');
      _messageController.clear();
    } catch (e) {
      _addLog('Send error: $e');
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('WebSocket Test'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Text(
                  'Status: ${_isConnected ? 'Connected' : 'Disconnected'}',
                  style: TextStyle(
                    color: _isConnected ? Colors.green : Colors.red,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                ElevatedButton(
                  onPressed: () {
                    _websocketService.disconnect();
                    _initWebSocket();
                  },
                  child: const Text('Reconnect'),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _logs.length,
              itemBuilder: (context, index) {
                return Text(
                  _logs[_logs.length - 1 - index],
                  style: const TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 12,
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: const InputDecoration(
                      hintText: 'Enter test message',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (_) => _sendTestMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _sendTestMessage,
                  child: const Text('Send'),
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
    _messageController.dispose();
    _websocketService.dispose();
    super.dispose();
  }
}
```

---

## 🚀 **Step 9: Deployment & Configuration**

### **1. Android Configuration**

#### **android/app/build.gradle**

```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.yourcompany.openclaw"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode flutterVersionCode.toInteger()
        versionName flutterVersionName
        
        // Enable multidex
        multiDexEnabled true
    }
    
    buildTypes {
        release {
            // Enable ProGuard
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

#### **android/app/proguard-rules.pro**

```pro
# Flutter WebSocket
-keep class io.github.weirtz.websocket.* { *; }

# Secure Storage
-keep class com.linusu.flutter_web3auth.** { *; }
-keep class com.auth0.android.** { *; }

# General
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}
```

### **2. iOS Configuration**

#### **ios/Podfile**

```ruby
# Uncomment to enable multidex
# platform :ios, '12.0'

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Enable WebSocket support
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= [
        '$(inherited)',
        'WEBSOCKETS_ENABLED=1'
      ]
      
      # Enable background modes
      config.build_settings['UIBackgroundModes'] = ['fetch', 'remote-notification']
    end
  end
end
```

---

## 📋 **Final Checklist**

### **✅ Flutter App Setup**
- [ ] Add all dependencies to `pubspec.yaml`
- [ ] Configure AndroidManifest.xml
- [ ] Configure Info.plist
- [ ] Create configuration files
- [ ] Implement WebSocket service
- [ ] Create message models
- [ ] Build chat UI
- [ ] Implement security features
- [ ] Add connection status monitoring

### **✅ OpenClaw Gateway Configuration**
- [ ] Deploy to Northflank
- [ ] Configure Telegram bot token: `8809223927:AAHs7myPMYFYYBcABbXH-jguY_gBPZm1LCU`
- [ ] Set up Flutter app token
- [ ] Enable CORS for mobile apps
- [ ] Configure rate limiting
- [ ] Set up security audit

### **✅ Testing**
- [ ] Test WebSocket connection
- [ ] Test message sending/receiving
- [ ] Test session management
- [ ] Test authentication
- [ ] Test error handling
- [ ] Test reconnection logic

### **✅ Deployment**
- [ ] Build Android APK/AAB
- [ ] Build iOS IPA
- [ ] Test on real devices
- [ ] Submit to app stores
- [ ] Monitor production usage

---

## 🎯 **Connection Details Summary**

### **OpenClaw Gateway (Northflank)**
```
WebSocket URL: wss://your-service.nf.sh:18789
HTTP URL: https://your-service.nf.sh
Health Check: https://your-service.nf.sh/healthz
Telegram Webhook: https://your-service.nf.sh/telegram-webhook
```

### **Telegram Bot**
```
Bot Token: 8809223927:AAHs7myPMYFYYBcABbXH-jguY_gBPZm1LCU
Webhook Secret: [Auto-generated by Northflank]
```

### **Flutter App Tokens**
```
Gateway Token: [Auto-generated by Northflank]
App Token: [Auto-generated by Northflank]
```

---

## 🚨 **Troubleshooting**

### **1. Connection Issues**

**Problem**: WebSocket connection fails

**Solutions**:
- Check if Northflank service is running
- Verify WebSocket URL: `wss://your-service.nf.sh:18789`
- Check if port 18789 is exposed
- Verify authentication tokens
- Check Northflank logs for errors

**Test Connection**:
```bash
# Test WebSocket connection
websocat -t -1 wss://your-service.nf.sh:18789?token=YOUR_TOKEN

# Test HTTP health check
curl https://your-service.nf.sh/healthz
```

### **2. Authentication Issues**

**Problem**: Authentication fails

**Solutions**:
- Verify `GATEWAY_PASSWORD` is correct
- Check `OPENCLAW_GATEWAY_TOKEN`
- Verify `FLUTTER_APP_TOKEN`
- Check token permissions in OpenClaw config
- Enable debug logging

### **3. Message Not Received**

**Problem**: Messages sent but not received

**Solutions**:
- Check WebSocket connection state
- Verify message format
- Check OpenClaw logs for errors
- Test with simple messages first
- Verify session ID handling

### **4. Android Issues**

**Problem**: Android app crashes or connection fails

**Solutions**:
- Check INTERNET permission
- Verify `usesCleartextTraffic=false`
- Test on different Android versions
- Check ProGuard rules
- Enable multidex

### **5. iOS Issues**

**Problem**: iOS app connection fails

**Solutions**:
- Check ATS configuration in Info.plist
- Verify background modes
- Test on different iOS versions
- Check WebSocket permissions
- Enable transport security exceptions

---

## 📞 **Support & Resources**

### **Documentation**
- [OpenClaw Docs](https://docs.openclaw.ai)
- [Flutter WebSocket Docs](https://docs.flutter.dev/packages/web_socket_channel)
- [Northflank Docs](https://northflank.com/docs)

### **Community**
- [OpenClaw Discord](https://discord.gg/clawd)
- [Flutter Discord](https://discord.gg/flutter)
- [Stack Overflow](https://stackoverflow.com)

### **Professional Support**
- [OpenClaw Enterprise](https://openclaw.ai/enterprise)
- [Consulting Services](https://openclaw.ai/consulting)

---

**🚀 Your Flutter app is now ready to connect to OpenClaw Gateway on Northflank!**

This integration provides:
- ✅ Real-time WebSocket communication
- ✅ Secure token-based authentication
- ✅ Session management
- ✅ Error handling and reconnection
- ✅ Cross-platform support (Android & iOS)
- ✅ Production-ready security

For any issues, refer to the troubleshooting section or contact support.