// Lets slide-deck iframes mirror whatever session the instructor's real
// Federation Dashboard tab is currently running, without ever creating a
// session of their own. This is the fix for the "embedded preview shows a
// different, empty session than the one students actually joined" bug:
// the dashboard tab publishes its session code to a shared localStorage
// key on create/subscribe (see publishActiveSession in lib/identity.js);
// this script reads that key and points every `iframe.live-embed` at it.
//
// Plain script, not a module — it only needs localStorage and the DOM, and
// runs once from index.qmd's <head>/<body>, matching assets/practice/rehearsal.js.
(() => {
  const ACTIVE_SESSION_KEY = "fl-live-active-session";

  function currentCode() {
    try {
      return window.localStorage.getItem(ACTIVE_SESSION_KEY);
    } catch {
      return null;
    }
  }

  function sync() {
    const code = currentCode();
    if (!code) return;
    // Rehearsal mode (see LIVE_LECTURE_RUNBOOK.md) opens the dashboard and
    // student views with ?local=1 to force the zero-backend, same-machine
    // BroadcastChannel provider. If the deck itself was opened the same
    // way, keep every mirrored iframe on that same provider — otherwise it
    // would default to Firebase (if configured) and query a completely
    // unrelated backend for the same-looking code.
    const deckIsLocal = new URLSearchParams(window.location.search).get("local") === "1";
    document.querySelectorAll("iframe.live-embed").forEach((iframe) => {
      if (iframe.dataset.syncedCode === code) return;
      const base = iframe.dataset.baseSrc || iframe.getAttribute("src") || "live/admin/index.html?embed=1";
      const url = new URL(base, document.baseURI);
      url.searchParams.set("embed", "1");
      url.searchParams.set("code", code);
      url.searchParams.delete("demo");
      url.searchParams.delete("autoqr");
      if (deckIsLocal) url.searchParams.set("local", "1");
      iframe.dataset.syncedCode = code;
      iframe.src = url.toString();
    });
    syncJoinQr(code, deckIsLocal);
  }

  // Renders the actual JOIN QR straight into the slide (see .live-join-qr in
  // Slide 1), so the room never has to look at a second window to scan in —
  // same code, same qrcode.js the dashboard's own QR overlay uses.
  function syncJoinQr(code, deckIsLocal) {
    if (typeof window.qrcode !== "function") return;
    document.querySelectorAll(".live-join-qr").forEach((el) => {
      if (el.dataset.syncedCode === code) return;
      const url = new URL("live/index.html", document.baseURI);
      url.searchParams.set("code", code);
      if (deckIsLocal) url.searchParams.set("local", "1");
      try {
        const qr = window.qrcode(0, "M");
        qr.addData(url.toString());
        qr.make();
        el.innerHTML = qr.createSvgTag({ scalable: true, margin: 2 });
        el.dataset.syncedCode = code;
      } catch (error) {
        console.error(error);
      }
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key === ACTIVE_SESSION_KEY) sync();
  });

  // The dashboard tab and the deck tab are usually opened within moments of
  // each other, so a short poll (in addition to the "storage" event, which
  // only fires in tabs other than the one that made the change — exactly
  // this tab, so it is the primary mechanism) catches the case where the
  // deck loaded before localStorage had a value yet.
  const poll = setInterval(sync, 2000);
  window.addEventListener("beforeunload", () => clearInterval(poll));

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", sync);
  } else {
    sync();
  }
})();
