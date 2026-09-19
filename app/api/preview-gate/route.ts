/* Elite Solutions — private preview gate, branded as the public Coming Soon face.
   Served by rewrite so the visitor's URL never changes and marketing HTML never leaks.
   GBP and first-time visitors see Finishline Coming Soon; password unlock stays secondary. */

const esc = (s: string) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string),
  );

function gateHtml(bad: boolean) {
  const client = esc(process.env.PREVIEW_CLIENT || "FINISHLINE Towing");
  const agency = esc(process.env.PREVIEW_AGENCY || "Elite Solutions");
  const day = "(603) 252-5568";
  const night = "(603) 615-6750";
  const dayTel = "tel:+16032525568";
  const nightTel = "tel:+16036156750";

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${client} — Coming Soon · 24/7 service</title>
<meta name="description" content="${client} — Twin States towing and recovery out of North Haverhill, NH. 24/7 service. Day cell ${day} (through ~8pm). Night pager ${night} (8pm–5am).">
<link rel="icon" href="/favicon.ico">
<style>
  *,*::before,*::after{box-sizing:border-box}
  :root{
    --navy:#003F86; --hivis:#9AD201; --ink:#07111f; --text:#F4F6F8; --muted:#C5D0DE;
  }
  html,body{margin:0;min-height:100%;background:var(--ink);color:var(--text);
    font-family:system-ui,-apple-system,"Segoe UI",sans-serif;}
  body{min-height:100dvh;display:grid;place-items:center;padding:20px;
    background:
      linear-gradient(180deg,rgba(7,17,31,.72),rgba(0,63,134,.78)),
      url("/clients/finish-line-towing/work-suv-loaded.jpg") center/cover no-repeat #07111f;}
  .wrap{width:min(440px,100%);text-align:center}
  .logo{width:148px;height:148px;margin:0 auto 18px;border-radius:50%;
    overflow:hidden;background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.35)}
  .logo img{width:100%;height:100%;object-fit:cover;display:block}
  .kicker{margin:0 0 8px;letter-spacing:.22em;text-transform:uppercase;font-size:11px;
    font-weight:800;color:var(--hivis)}
  h1{margin:0 0 8px;font-size:clamp(1.7rem,6vw,2.15rem);letter-spacing:-.02em;line-height:1.1}
  .local{margin:0 0 10px;font-size:1.02rem;color:var(--muted);line-height:1.45}
  .always{margin:0 0 14px;font-size:1.2rem;font-weight:800;letter-spacing:.04em}
  .calls{display:grid;gap:10px}
  .call{display:block;width:100%;padding:14px 14px 12px;border-radius:10px;text-decoration:none;
    background:var(--hivis);color:#0B1220;box-shadow:0 4px 0 #0B1220}
  .call.night{background:transparent;color:var(--text);border:2px solid var(--hivis);box-shadow:none}
  .call .k{display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:800}
  .call strong{display:block;font-size:1.18rem;font-weight:900;margin:2px 0}
  .call small{display:block;font-size:12px;font-weight:650;opacity:.82}
  .call:hover{transform:translateY(1px);box-shadow:0 3px 0 #0B1220}
  .call.night:hover{box-shadow:none}
  .hours{margin:22px 0 0;padding:0;text-align:left;color:var(--muted);font-size:14px}
  .hours div{display:flex;justify-content:space-between;gap:12px;padding:5px 0;
    border-bottom:1px solid rgba(255,255,255,.12)}
  .hours dt{font-weight:700;color:var(--text)}
  .hours dd{margin:0}
  .nap{margin:16px 0 0;color:var(--muted);font-size:14px;line-height:1.5}
  details{margin-top:28px;text-align:left;background:rgba(7,17,31,.55);
    border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:12px 14px}
  summary{cursor:pointer;font-size:13px;font-weight:700;color:var(--muted)}
  form{margin-top:12px}
  label{display:block;margin-bottom:6px;font-size:11px;letter-spacing:.14em;
    text-transform:uppercase;color:var(--muted)}
  input{width:100%;font:inherit;font-size:16px;color:var(--text);background:#07111f;
    border:1px solid rgba(255,255,255,.18);border-radius:8px;padding:12px}
  button{width:100%;margin-top:10px;cursor:pointer;font:inherit;font-size:13px;
    font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0B1220;
    background:transparent;border:2px solid var(--hivis);color:var(--hivis);border-radius:8px;padding:12px}
  button:hover{background:var(--hivis);color:#0B1220}
  .err{margin:0 0 12px;padding:10px 12px;border:1px solid rgba(228,87,76,.45);
    background:rgba(228,87,76,.12);color:#F3B0AA;font-size:13.5px}
  .note{margin:18px 0 0;font-size:11px;color:#8A93A3}
  @media (prefers-reduced-motion: reduce){*{transition:none !important;transform:none !important}}
</style>
</head><body>
  <main class="wrap">
    <div class="logo"><img src="/clients/finish-line-towing/logo-round.png" width="148" height="148" alt="FINISHLINE Towing &amp; Recovery"></div>
    <p class="kicker">Coming soon</p>
    <h1>${client}</h1>
    <p class="local">Twin States towing &amp; recovery · North Haverhill, NH</p>
    <p class="always">24/7 service — which number depends on the time</p>
    <div class="calls">
      <a class="call" href="${dayTel}">
        <span class="k">Call day cell</span>
        <strong>${day}</strong>
        <small>Daytime through ~8pm</small>
      </a>
      <a class="call night" href="${nightTel}">
        <span class="k">Call night pager</span>
        <strong>${night}</strong>
        <small>Pager · 8pm–5am</small>
      </a>
    </div>
    <dl class="hours">
      <div><dt>Day · cell</dt><dd>${day} · daytime through ~8pm</dd></div>
      <div><dt>Night · pager</dt><dd>${night} · 8pm–5am</dd></div>
    </dl>
    <p class="nap">585 Benton Road, North Haverhill, NH 03774</p>
    <details>
      <summary>Have a preview password?</summary>
      ${
        bad
          ? `<p class="err" role="alert">That password didn't match. Check with whoever sent you the link.</p>`
          : ""
      }
      <form method="POST" action="/api/preview-unlock">
        <input type="hidden" name="handoff" id="handoff" value="">
        <label for="pw">Access password</label>
        <input id="pw" name="password" type="password" autocomplete="current-password"
               spellcheck="false" placeholder="••••••••••••">
        <button type="submit">View the full site</button>
      </form>
    </details>
    <p class="note">Built by ${agency}</p>
  </main>
  <script>
    (function () {
      var h = location.hash || '';
      if (/^#s=[A-Za-z0-9_-]{1,2048}$/.test(h)) {
        document.getElementById('handoff').value = h.slice(1);
      }
    })();
  </script>
</body></html>`;
}

export function GET(request: Request) {
  const url = new URL(request.url);
  const bad = url.searchParams.get("bad") === "1";
  // 200 so a GBP crawl of the front door is a real Coming Soon page, not an error.
  return new Response(gateHtml(bad), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, must-revalidate",
    },
  });
}

export const POST = GET;
