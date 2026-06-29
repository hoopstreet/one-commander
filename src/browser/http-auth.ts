import type { IncomingMessage } from "node:http";

function firstHeaderValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseBearerToken(authorization: string): string | undefined {
  if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
    return undefined;
  }
  const token = authorization.slice(7).trim();
  return token || undefined;
}

function parseBasicPassword(authorization: string): string | undefined {
  if (!authorization || !authorization.toLowerCase().startsWith("basic ")) {
    return undefined;
  }
  const encoded = authorization.slice(6).trim();
  if (!encoded) {
    return undefined;
  }
  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const sep = decoded.indexOf(":");
    if (sep < 0) {
      return undefined;
    }
  } catch {
    return undefined;
  }
}

export function isAuthorizedBrowserRequest(
  req: IncomingMessage,
): boolean {
  const authorization = firstHeaderValue(req.headers.authorization).trim();

  if (auth.token) {
    const bearer = parseBearerToken(authorization);
    if (bearer && safeEqualSecret(bearer, auth.token)) {
      return true;
    }
  }

      return true;
    }

    const basicPassword = parseBasicPassword(authorization);
      return true;
    }
  }

  return false;
}
