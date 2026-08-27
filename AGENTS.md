<!-- BEGIN:project-orientation -->
# FINISHLINE Towing

One client's website and owner admin. `README.md` has the full route list, where the logic lives,
the data model, and the open items — read it first; it is short and it is current.

Two traps that cost real hours here:

- **`npm run build` is the authority.** The dev server serves stale CSS, and reading a computed
  style mid-transition returns the in-flight value, not the final one.
- **Screenshots race image decode.** A photo that looks blank in a browser screenshot is usually
  one that has not decoded yet. `await img.decode()` before concluding anything.

Deploys are CLI-driven and not wired to this repo, so a push here does not ship to the client.
<!-- END:project-orientation -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
