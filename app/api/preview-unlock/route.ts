import {
  PREVIEW_COOKIE,
  PREVIEW_COOKIE_DAYS,
  mintPreviewToken,
  passwordsMatch,
} from "@/lib/preview-gate";

const seeOther = (location: string, cookie?: string) => {
  const headers: Record<string, string> = {
    location,
    "cache-control": "no-store",
    "x-robots-tag": "noindex, nofollow",
  };
  if (cookie) headers["set-cookie"] = cookie;
  return new Response(null, { status: 303, headers });
};

export function GET() {
  return seeOther("/");
}

export async function POST(request: Request) {
  const secret = process.env.PREVIEW_SECRET;
  const clientPw = process.env.PREVIEW_PASSWORD;
  const masterPw = process.env.PREVIEW_MASTER;

  if (!secret || (!clientPw && !masterPw)) {
    return new Response("Preview gateway is not configured.", {
      status: 503,
      headers: { "content-type": "text/plain", "x-robots-tag": "noindex" },
    });
  }

  let supplied = "";
  let handoff = "";
  try {
    const form = await request.formData();
    supplied = String(form.get("password") || "");
    handoff = String(form.get("handoff") || "");
  } catch {
    /* fall through */
  }

  const frag = /^s=[A-Za-z0-9_-]{1,2048}$/.test(handoff) ? "#" + handoff : "";
  const ok = passwordsMatch(supplied, clientPw) || passwordsMatch(supplied, masterPw);

  if (!ok) {
    await new Promise((r) => setTimeout(r, 600));
    return seeOther("/?bad=1" + frag);
  }

  const token = await mintPreviewToken(secret);
  const cookie = [
    `${PREVIEW_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${PREVIEW_COOKIE_DAYS * 86400}`,
  ].join("; ");

  return seeOther("/" + frag, cookie);
}
