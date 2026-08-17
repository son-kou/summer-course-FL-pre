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

/** A short, friendly, non-unique display number derived from the client id. */
export function clientDisplayNumber(clientId) {
  let hash = 0;
  for (let i = 0; i < clientId.length; i += 1) {
    hash = (hash * 31 + clientId.charCodeAt(i)) >>> 0;
  }
  return (hash % 89) + 10;
}
