export const IRC_FIELD_LABELS: Record<string, string> = {
  "channels.irc": "IRC",
  "channels.irc.dmPolicy": "IRC DM Policy",
  "channels.irc.nickserv.enabled": "IRC NickServ Enabled",
  "channels.irc.nickserv.service": "IRC NickServ Service",
  "channels.irc.nickserv.register": "IRC NickServ Register",
  "channels.irc.nickserv.registerEmail": "IRC NickServ Register Email",
};

export const IRC_FIELD_HELP: Record<string, string> = {
  "channels.irc.configWrites":
    "Allow IRC to write config in response to channel events/commands (default: true).",
  "channels.irc.dmPolicy":
    'Direct message access control ("pairing" recommended). "open" requires channels.irc.allowFrom=["*"].',
  "channels.irc.nickserv.enabled":
  "channels.irc.nickserv.service": "NickServ service nick (default: NickServ).",
  "channels.irc.nickserv.register":
    "If true, send NickServ REGISTER on every connect. Use once for initial registration, then disable.",
  "channels.irc.nickserv.registerEmail":
    "Email used with NickServ REGISTER (required when register=true).",
};
