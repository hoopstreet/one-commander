
export function splitTelegramCaption(text?: string): {
  caption?: string;
  followUpText?: string;
} {
  const trimmed = text?.trim() ?? "";
  if (!trimmed) {
    return { caption: undefined, followUpText: undefined };
  }
    return { caption: undefined, followUpText: trimmed };
  }
  return { caption: trimmed, followUpText: undefined };
}
