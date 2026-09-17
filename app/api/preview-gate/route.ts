/* Elite Solutions — private preview gate page.
   Served by rewrite so the visitor's URL never changes and marketing HTML never leaks. */

const esc = (s: string) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string),
  );

function gateHtml(bad: boolean) {
  const client = esc(process.env.PREVIEW_CLIENT || "FINISHLINE Towing");
  const agency = esc(process.env.PREVIEW_AGENCY || "Elite Solutions");

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${agency} — Preview Access</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box}
  :root{
    --ink:#0B0D12; --panel:#12151C; --line:#252A36;
    --text:#EDEFF4; --muted:#98A0B2; --accent:#C9A227; --bad:#E4574C;
  }
  html,body{height:100%}
  body{
    margin:0; background:var(--ink); color:var(--text);
    font-family:Archivo,"Helvetica Neue",Arial,sans-serif; font-size:16px; line-height:1.6;
    display:grid; place-items:center; padding:24px;
    background-image:
      radial-gradient(1100px 520px at 50% -10%, rgba(201,162,39,.10), transparent 62%),
      linear-gradient(180deg, #0B0D12 0%, #090B10 100%);
  }
  .card{width:100%; max-width:412px}
  .mark{
    display:flex; align-items:center; gap:11px; justify-content:center;
    margin-bottom:30px; letter-spacing:.26em; font-size:11px; font-weight:800;
    text-transform:uppercase; color:var(--accent);
  }
  .mark i{display:block; width:20px; height:20px; border:2px solid var(--accent); transform:rotate(45deg)}
  .panel{background:var(--panel); border:1px solid var(--line); padding:32px 30px 30px}
  h1{
    margin:0 0 6px; font-size:25px; font-weight:900; font-stretch:84%;
    letter-spacing:-.01em; line-height:1.15;
  }
  .who{margin:0 0 22px; color:var(--muted); font-size:14.5px}
  .who b{color:var(--text); font-weight:700}
  label{
    display:block; margin-bottom:8px; font-size:10.5px; font-weight:800;
    letter-spacing:.2em; text-transform:uppercase; color:var(--muted);
  }
  input{
    width:100%; font:inherit; font-size:16px; color:var(--text);
    background:#0B0D12; border:1px solid var(--line); border-radius:0;
    padding:13px 14px; letter-spacing:.02em;
  }
  input:focus{outline:2px solid var(--accent); outline-offset:1px; border-color:transparent}
  button{
    width:100%; margin-top:14px; cursor:pointer; font:inherit; font-size:12.5px;
    font-weight:800; letter-spacing:.16em; text-transform:uppercase;
    color:#0B0D12; background:var(--accent); border:1px solid var(--accent);
    border-radius:0; padding:14px; transition:background .18s ease, color .18s ease;
  }
  button:hover{background:transparent; color:var(--accent)}
  .err{
    display:flex; gap:9px; align-items:flex-start; margin:0 0 18px; padding:11px 13px;
    border:1px solid rgba(228,87,76,.45); background:rgba(228,87,76,.09);
    color:#F3B0AA; font-size:13.5px; line-height:1.45;
  }
  .err svg{width:16px; height:16px; margin-top:2px; flex:none}
  .foot{margin-top:22px; padding-top:18px; border-top:1px solid var(--line); color:var(--muted); font-size:12.5px}
  .note{margin-top:20px; text-align:center; color:#6B7385; font-size:11.5px; letter-spacing:.04em}
  @media (prefers-reduced-motion: reduce){*{transition:none !important}}
</style>
</head><body>
  <main class="card">
    <div class="mark"><i></i>${agency}</div>
    <div class="panel">
      <h1>Preview access</h1>
      <p class="who">You're opening the private preview for <b>${client}</b>.</p>
      ${
        bad
          ? `<p class="err" role="alert">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 8v5M12 17h.01M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20.4h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>
        <span>That password didn't match. Check with whoever sent you the link.</span></p>`
          : ""
      }
      <form method="POST" action="/api/preview-unlock">
        <input type="hidden" name="handoff" id="handoff" value="">
        <label for="pw">Access password</label>
        <input id="pw" name="password" type="password" autocomplete="current-password"
               autofocus required spellcheck="false" placeholder="••••••••••••">
        <button type="submit">View the preview</button>
      </form>
      <p class="foot">This preview is unlisted and not indexed by search engines. It's a work in progress shared for review, not a live site.</p>
    </div>
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
  return new Response(gateHtml(bad), {
    status: 401,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, must-revalidate",
      "x-robots-tag": "noindex, nofollow",
    },
  });
}

export const POST = GET;
