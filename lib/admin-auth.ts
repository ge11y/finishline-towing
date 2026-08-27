// Admin session auth.
//
// The admin cookie holds an HMAC-SHA256 signed, expiring token — NOT a static
// value — so it cannot be forged or replayed past expiry. All crypto uses the
// Web Crypto API (globalThis.crypto.subtle) so this module is edge-compatible
// and can be imported by the middleware/proxy without pulling in Node APIs.
//
// This module must stay free of top-level `next/headers` (server-only) imports
// so the edge middleware can import the token verifier. `hasAdminSession`
// therefore imports `next/headers` dynamically, on demand.

export const ADMIN_AUTH_COOKIE = "storefront_factory_admin_auth_v1"

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "FactoryAdmin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET

// Legacy default that shipped in source. Treated as "not configured".
const DEFAULT_ADMIN_PASSWORD = "ChangeMe-Factory2026"

// Sessions last 30 days. Callers may request a shorter lifetime, but never a
// longer one — the token creator clamps to this ceiling.
//
// This was 12 hours, which is right for a shared back office and wrong here.
// The owner keeps this on his phone's home screen and opens it a few times a
// day between jobs; at 12 hours he would be typing a password every morning
// and again most evenings, and the honest outcome of that is he stops opening
// it and goes back to paper. One user, his own phone, no payment details
// behind it — the risk of a longer session is smaller than the risk of the
// tool going unused.
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

const TOKEN_VERSION = 1

const textEncoder = new TextEncoder()

function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

/**
 * Returns a human-readable error when admin auth is not safely configured, or
 * `null` when it is. Used by the login route to fail closed with a clear 503
 * instead of minting sessions against a default/absent password or secret.
 */
export function getAdminAuthConfigError(): string | null {
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD) {
    return "Admin login is not configured: set a non-default ADMIN_PASSWORD environment variable."
  }
  if (!ADMIN_SESSION_SECRET) {
    return "Admin login is not configured: set the ADMIN_SESSION_SECRET environment variable."
  }
  return null
}

export function isValidAdminCredentials(username: string, password: string) {
  // Never authenticate against a missing or default password.
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD === DEFAULT_ADMIN_PASSWORD) return false
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  )
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await importHmacKey(secret)
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payload))
  return base64UrlEncode(new Uint8Array(signature))
}

/**
 * Mints a signed session token. `ttlSeconds` defaults to the 12h ceiling and is
 * clamped so a token can never outlive that ceiling. A non-positive ttl yields
 * an already-expired token (used by tests to exercise the expiry path).
 * Throws if ADMIN_SESSION_SECRET is not set — callers must gate on
 * `getAdminAuthConfigError()` first.
 */
export async function createAdminSessionToken(
  ttlSeconds: number = ADMIN_SESSION_MAX_AGE_SECONDS,
): Promise<string> {
  if (!ADMIN_SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET is not configured.")
  }
  const ttl = Math.min(ttlSeconds, ADMIN_SESSION_MAX_AGE_SECONDS)
  const exp = nowSeconds() + ttl
  const payload = base64UrlEncode(
    textEncoder.encode(JSON.stringify({ v: TOKEN_VERSION, exp })),
  )
  const signature = await signPayload(payload, ADMIN_SESSION_SECRET)
  return `${payload}.${signature}`
}

/**
 * Verifies a session token. Returns `false` for anything that is not a
 * well-formed, correctly-signed, unexpired v1 token — this is the single
 * gate that rejects tampered, malformed, expired, and unsigned values.
 */
export async function verifyAdminSessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token || !ADMIN_SESSION_SECRET) return false

  const dot = token.indexOf(".")
  if (dot <= 0 || dot === token.length - 1) return false
  const payloadPart = token.slice(0, dot)
  const signaturePart = token.slice(dot + 1)
  if (token.indexOf(".", dot + 1) !== -1) return false

  try {
    const signatureBytes = base64UrlDecode(signaturePart)
    const key = await importHmacKey(ADMIN_SESSION_SECRET)
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      textEncoder.encode(payloadPart),
    )
    if (!valid) return false

    const decoded = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadPart))) as {
      v?: unknown
      exp?: unknown
    }
    if (decoded.v !== TOKEN_VERSION || typeof decoded.exp !== "number") return false
    if (decoded.exp <= nowSeconds()) return false
    return true
  } catch {
    return false
  }
}

export async function hasAdminSession(): Promise<boolean> {
  const { cookies } = await import("next/headers")
  const token = (await cookies()).get(ADMIN_AUTH_COOKIE)?.value
  return verifyAdminSessionToken(token)
}
