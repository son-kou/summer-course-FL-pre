// Browser-only helpers for anonymous, session-scoped student identity.
// No name, email, or personal data is ever stored — only a random token
// scoped to one session code, kept in localStorage so a page refresh
// resumes the same client instead of minting a new one.

const STORAGE_PREFIX = "fl-live-client::";

export function getSessionCodeFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
}

export function getOrCreateClientId(sessionCode) {
  const key = STORAGE_PREFIX + sessionCode;
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = `client-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
    window.localStorage.setItem(key, id);
  }
  return id;
}

export function forgetClientId(sessionCode) {
  window.localStorage.removeItem(STORAGE_PREFIX + sessionCode);
}

const PROGRESS_PREFIX = "fl-live-progress::";

/**
 * Remember which screen a student last reached, so a reload (a real
 * refresh, or a mobile browser silently discarding and reloading a
 * backgrounded tab) resumes where they left off instead of restarting the
 * whole flow from the opening poll. "concern" is a transient sub-step of
 * "decide" and is deliberately not worth persisting on its own.
 */
export function saveProgress(sessionCode, screen) {
  if (screen === "concern") return;
  try {
    window.localStorage.setItem(PROGRESS_PREFIX + sessionCode, screen);
  } catch {
    // Storage can be unavailable (private browsing, some in-app browsers);
    // resuming from the start is a safe fallback, not a hard failure.
  }
}

export function loadProgress(sessionCode) {
  try {
    return window.localStorage.getItem(PROGRESS_PREFIX + sessionCode);
  } catch {
    return null;
  }
}

const ACTIVE_SESSION_KEY = "fl-live-active-session";

/** Lets the admin dashboard tell same-origin tabs/iframes which session is
 * currently live, so the slide deck can mirror it without ever creating a
 * session of its own (see live/deck-sync.js). */
export function publishActiveSession(sessionCode) {
  try {
    window.localStorage.setItem(ACTIVE_SESSION_KEY, sessionCode);
  } catch {
    // Non-fatal: the deck simply won't auto-mirror the session.
  }
}

/** A short, friendly, non-unique display number derived from the client id. */
export function clientDisplayNumber(clientId) {
  let hash = 0;
  for (let i = 0; i < clientId.length; i += 1) {
    hash = (hash * 31 + clientId.charCodeAt(i)) >>> 0;
  }
  return (hash % 89) + 10;
}
