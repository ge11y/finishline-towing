/* Elite Solutions — preview gateway helpers.
   HMAC-signed HttpOnly cookie. Edge-safe (Web Crypto only). */

export const PREVIEW_COOKIE = "es_preview";
export const PREVIEW_COOKIE_DAYS = 14;

const enc = (s: string) => new TextEncoder().encode(s);

function same(a: string, b: string) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmac(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Gate is on unless explicitly set to off. */
export function isPreviewGateEnabled() {
  return (process.env.PREVIEW_GATE || "on").toLowerCase() !== "off";
}

export async function validPreviewToken(token: string | undefined | null, secret: string) {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const [expStr] = body.split("|");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return same(sig, await hmac(body, secret));
}

export async function mintPreviewToken(secret: string) {
  const exp = Date.now() + PREVIEW_COOKIE_DAYS * 86400000;
  const body = `${exp}|preview`;
  return `${body}.${await hmac(body, secret)}`;
}

export function passwordsMatch(supplied: string, expected: string | undefined) {
  if (!expected) return false;
  return same(supplied, expected);
}
