export const APPROVED_NASA_DOMAINS = [
  'ntrs.nasa.gov',
  'psi.nasa.gov',
  'www.nasa.gov',
  'nasa.gov',
  'spaceappschallenge.org',
  'www.spaceappschallenge.org',
] as const;

const PRIVATE_IP_OR_HOST_RE =
  /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|0\.0\.0\.0|\[::1\]|::1|169\.254\.\d+\.\d+)$/i;

export interface UrlCheckResult {
  valid: boolean;
  approvedDomain: boolean;
  normalizedUrl: string | null;
  hostname: string | null;
  reason: string;
}

/**
 * Validates external URLs for strict HTTPS syntax, SSRF protection,
 * and NASA/SpaceApps approved domain allowlisting.
 */
export function validateSourceUrl(rawUrl: string): UrlCheckResult {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return {
      valid: false,
      approvedDomain: false,
      normalizedUrl: null,
      hostname: null,
      reason: 'URL is empty.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      approvedDomain: false,
      normalizedUrl: null,
      hostname: null,
      reason: 'Malformed URL syntax.',
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      valid: false,
      approvedDomain: false,
      normalizedUrl: null,
      hostname: parsed.hostname,
      reason: 'Only HTTPS URLs are permitted for external scientific sources.',
    };
  }

  if (parsed.username || parsed.password) {
    return {
      valid: false,
      approvedDomain: false,
      normalizedUrl: null,
      hostname: parsed.hostname,
      reason: 'Credentials in URLs are prohibited.',
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (PRIVATE_IP_OR_HOST_RE.test(host) || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return {
      valid: false,
      approvedDomain: false,
      normalizedUrl: null,
      hostname: host,
      reason: 'Direct IP addresses and internal network hosts are blocked (SSRF protection).',
    };
  }

  const approvedDomain = APPROVED_NASA_DOMAINS.some(
    (domain) => host === domain || host.endsWith(`.${domain}`)
  );

  return {
    valid: true,
    approvedDomain,
    normalizedUrl: parsed.toString(),
    hostname: host,
    reason: approvedDomain
      ? `Approved NASA/SpaceApps domain (${host}).`
      : `Valid HTTPS URL (${host}), but outside the primary NASA domain allowlist (requires manual review).`,
  };
}

/**
 * Sanitizes imported user text to neutralize HTML/script payloads,
 * CSV spreadsheet formula injection, and common prompt-injection wrappers.
 */
export function sanitizeImportedText(input: unknown, maxLength = 1200): string {
  if (input === null || input === undefined) return '';
  let str = String(input)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '') // strip control chars
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '[script-removed]')
    .replace(/<[^>]+>/g, '') // strip HTML tags
    .trim();

  // Neutralize CSV formula injection prefixes
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }
  return str;
}

/**
 * Neutralizes prompt-injection directives inside scientific text before
 * passing untrusted metadata to an LLM context.
 */
export function sanitizeForLlmContext(text: string | null | undefined): string {
  if (!text) return 'Not reported / Not verified';
  return text
    .replace(/(ignore\s+(all\s+)?previous\s+instructions|system\s*:|assistant\s*:|<\|.*?\|>)/gi, '[redacted-directive]')
    .slice(0, 600);
}

/**
 * Computes SHA-256 hex digest using Web Crypto API (browser) or Node crypto.
 */
export async function computeSha256Hex(data: ArrayBuffer | Uint8Array | string): Promise<string> {
  const bytes =
    typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data instanceof Uint8Array
        ? data
        : new Uint8Array(data);

  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const bufferCopy = new Uint8Array(bytes).buffer;
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', bufferCopy);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  const nodeCrypto = await import('node:crypto');
  return nodeCrypto.createHash('sha256').update(bytes).digest('hex');
}
