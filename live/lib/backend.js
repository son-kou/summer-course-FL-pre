// Real-time backend provider abstraction for the live federation activity.
//
// The slide deck is a static GitHub Pages site, so "real-time" here means a
// small, swappable provider behind one interface. Three providers exist:
//
//   - DemoProvider    in-memory only, auto-generates a full synthetic
//                      classroom. No network. This is the mandatory fallback
//                      and must work identically to a live session.
//   - LocalProvider   BroadcastChannel + localStorage, for rehearsing the
//                      student/admin flow across browser tabs on one machine
//                      with no backend at all.
//   - FirebaseProvider Firebase Realtime Database, for an actual classroom
//                      of ~60 phones. Loaded only if configured; any failure
//                      falls back to DemoProvider automatically (see
//                      createBackend below and LIVE_INTERACTION_ARCHITECTURE.md).
//
// Every provider implements the same small interface:
//   createSession(code, meta)            -> Promise<void>
//   watchMeta(code, cb)                  -> unsubscribe()
//   watchClients(code, cb)               -> unsubscribe()   cb(clientsById)
//   setMeta(code, patch)                 -> Promise<void>
//   upsertClient(code, clientId, patch)  -> Promise<void>
//   resetSession(code)                   -> Promise<void>
//
// No provider ever stores names, emails, or any personal data. A client
// record is a session-scoped synthetic profile plus a participation
// decision.

function nowIso() {
  return new Date().toISOString();
}

// --- Demo provider ---------------------------------------------------------
// Fully local, deterministic, no network. Used by "?demo=1" and by the
// admin "Populate demo clients" button so the whole 30-minute lecture can be
// taught without any student phones.

export class DemoProvider {
  constructor() {
    this.sessions = new Map();
    this.metaListeners = new Map();
    this.clientListeners = new Map();
  }

  _ensure(code) {
    if (!this.sessions.has(code)) {
      this.sessions.set(code, { meta: null, clients: new Map() });
    }
    return this.sessions.get(code);
  }

  async createSession(code, meta) {
    const session = this._ensure(code);
    session.meta = { ...meta, createdAt: nowIso() };
    this._emitMeta(code);
  }

  watchMeta(code, cb) {
    if (!this.metaListeners.has(code)) this.metaListeners.set(code, new Set());
    this.metaListeners.get(code).add(cb);
    const session = this._ensure(code);
    if (session.meta) cb(session.meta);
    return () => this.metaListeners.get(code)?.delete(cb);
  }

  watchClients(code, cb) {
    if (!this.clientListeners.has(code)) this.clientListeners.set(code, new Set());
    this.clientListeners.get(code).add(cb);
    const session = this._ensure(code);
    cb(Object.fromEntries(session.clients));
    return () => this.clientListeners.get(code)?.delete(cb);
  }

  async setMeta(code, patch) {
    const session = this._ensure(code);
    session.meta = { ...(session.meta || {}), ...patch };
    this._emitMeta(code);
  }

  async upsertClient(code, clientId, patch) {
    const session = this._ensure(code);
    const existing = session.clients.get(clientId) || {};
    session.clients.set(clientId, { ...existing, ...patch, updatedAt: nowIso() });
    this._emitClients(code);
  }

  async resetSession(code) {
    this.sessions.set(code, { meta: null, clients: new Map() });
    this._emitMeta(code);
    this._emitClients(code);
  }

  _emitMeta(code) {
    const session = this._ensure(code);
    (this.metaListeners.get(code) || []).forEach((cb) => cb(session.meta));
  }

  _emitClients(code) {
    const session = this._ensure(code);
    const snapshot = Object.fromEntries(session.clients);
    (this.clientListeners.get(code) || []).forEach((cb) => cb(snapshot));
  }
}

// --- Local (cross-tab) provider --------------------------------------------
// Uses BroadcastChannel to sync state between browser tabs/windows on the
// same machine (e.g. a laptop admin tab + a phone-simulator tab), and
// localStorage so a late-opening tab can catch up. No server involved.

const LOCAL_PREFIX = "fl-live::";

export class LocalProvider {
  constructor() {
    this.channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("fl-live") : null;
    this.metaListeners = new Map();
    this.clientListeners = new Map();
    if (this.channel) {
      this.channel.addEventListener("message", (event) => this._onMessage(event.data));
    }
  }

  _metaKey(code) {
    return `${LOCAL_PREFIX}${code}::meta`;
  }

  _clientsKey(code) {
    return `${LOCAL_PREFIX}${code}::clients`;
  }

  _readMeta(code) {
    try {
      const raw = localStorage.getItem(this._metaKey(code));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  _readClients(code) {
    try {
      const raw = localStorage.getItem(this._clientsKey(code));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  _onMessage(message) {
    if (!message || !message.code) return;
    if (message.type === "meta") {
      (this.metaListeners.get(message.code) || []).forEach((cb) => cb(message.meta));
    } else if (message.type === "clients") {
      (this.clientListeners.get(message.code) || []).forEach((cb) => cb(message.clients));
    }
  }

  async createSession(code, meta) {
    const full = { ...meta, createdAt: nowIso() };
    localStorage.setItem(this._metaKey(code), JSON.stringify(full));
    localStorage.setItem(this._clientsKey(code), JSON.stringify({}));
    this.channel?.postMessage({ type: "meta", code, meta: full });
    this.channel?.postMessage({ type: "clients", code, clients: {} });
  }

  watchMeta(code, cb) {
    if (!this.metaListeners.has(code)) this.metaListeners.set(code, new Set());
    this.metaListeners.get(code).add(cb);
    const existing = this._readMeta(code);
    if (existing) cb(existing);
    const storageHandler = (event) => {
      if (event.key === this._metaKey(code)) cb(this._readMeta(code));
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      this.metaListeners.get(code)?.delete(cb);
      window.removeEventListener("storage", storageHandler);
    };
  }

  watchClients(code, cb) {
    if (!this.clientListeners.has(code)) this.clientListeners.set(code, new Set());
    this.clientListeners.get(code).add(cb);
    cb(this._readClients(code));
    const storageHandler = (event) => {
      if (event.key === this._clientsKey(code)) cb(this._readClients(code));
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      this.clientListeners.get(code)?.delete(cb);
      window.removeEventListener("storage", storageHandler);
    };
  }

  async setMeta(code, patch) {
    const merged = { ...(this._readMeta(code) || {}), ...patch };
    localStorage.setItem(this._metaKey(code), JSON.stringify(merged));
    this.channel?.postMessage({ type: "meta", code, meta: merged });
    (this.metaListeners.get(code) || []).forEach((cb) => cb(merged));
  }

  async upsertClient(code, clientId, patch) {
    const clients = this._readClients(code);
    clients[clientId] = { ...(clients[clientId] || {}), ...patch, updatedAt: nowIso() };
    localStorage.setItem(this._clientsKey(code), JSON.stringify(clients));
    this.channel?.postMessage({ type: "clients", code, clients });
    (this.clientListeners.get(code) || []).forEach((cb) => cb(clients));
  }

  async resetSession(code) {
    localStorage.removeItem(this._metaKey(code));
    localStorage.setItem(this._clientsKey(code), JSON.stringify({}));
    this.channel?.postMessage({ type: "meta", code, meta: null });
    this.channel?.postMessage({ type: "clients", code, clients: {} });
  }
}

// --- Firebase Realtime Database provider -----------------------------------
// Loaded only when a real firebase-config.js is present and reachable. See
// LIVE_INTERACTION_ARCHITECTURE.md for exact setup and security-rule steps.
// The Firebase config object is not a secret — it identifies the project,
// not a credential — so it is safe to ship in the static bundle as long as
// Realtime Database security rules are configured as documented.

export class FirebaseProvider {
  constructor(config) {
    this.config = config;
    this.appReady = this._init();
  }

  async _init() {
    const appModule = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js");
    const dbModule = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js");
    const authModule = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js");
    const app = appModule.initializeApp(this.config);
    const db = dbModule.getDatabase(app);
    const auth = authModule.getAuth(app);
    const credential = await authModule.signInAnonymously(auth);
    this._mod = { ...dbModule };
    this._db = db;
    this._uid = credential.user.uid;
    return true;
  }

  async createSession(code, meta) {
    await this.appReady;
    const { ref, set } = this._mod;
    await set(ref(this._db, `sessions/${code}/meta`), { ...meta, createdAt: nowIso() });
  }

  watchMeta(code, cb) {
    let unsub = () => {};
    this.appReady.then(() => {
      const { ref, onValue } = this._mod;
      unsub = onValue(ref(this._db, `sessions/${code}/meta`), (snapshot) => cb(snapshot.val()));
    });
    return () => unsub();
  }

  watchClients(code, cb) {
    let unsub = () => {};
    this.appReady.then(() => {
      const { ref, onValue } = this._mod;
      unsub = onValue(ref(this._db, `sessions/${code}/clients`), (snapshot) => cb(snapshot.val() || {}));
    });
    return () => unsub();
  }

  async setMeta(code, patch) {
    await this.appReady;
    const { ref, update } = this._mod;
    await update(ref(this._db, `sessions/${code}/meta`), patch);
  }

  async upsertClient(code, clientId, patch) {
    await this.appReady;
    const { ref, update } = this._mod;
    // Stamping uid lets the security rule enforce "a client may only write
    // its own record" — see LIVE_INTERACTION_ARCHITECTURE.md.
    await update(ref(this._db, `sessions/${code}/clients/${clientId}`), { ...patch, uid: this._uid, updatedAt: nowIso() });
  }

  async resetSession(code) {
    await this.appReady;
    const { ref, remove, set } = this._mod;
    await remove(ref(this._db, `sessions/${code}/clients`));
    await set(ref(this._db, `sessions/${code}/meta`), null);
  }
}

// --- Factory with graceful fallback ----------------------------------------

function isConfigured(config) {
  return Boolean(config && config.databaseURL && !String(config.databaseURL).includes("YOUR-PROJECT"));
}

/**
 * Resolve the backend to use. Order of preference:
 *   1. Explicit ?demo=1 -> DemoProvider, always.
 *   2. Explicit ?local=1 -> LocalProvider (cross-tab, no server).
 *   3. A configured firebase-config.js -> FirebaseProvider, with automatic
 *      fallback to DemoProvider if it throws on first use.
 *   4. Otherwise -> LocalProvider so the same-machine rehearsal flow works
 *      out of the box with zero configuration.
 *
 * `onFallback(reason)` is called if a Firebase provider is requested but
 * unavailable, so the UI can show the graceful-failure message instead of a
 * stack trace (see section on graceful live failure in the runbook).
 */
export async function createBackend({ params, firebaseConfig, onFallback } = {}) {
  const search = params || new URLSearchParams(typeof location !== "undefined" ? location.search : "");

  if (search.get("demo") === "1") return { provider: new DemoProvider(), kind: "demo" };
  if (search.get("local") === "1") return { provider: new LocalProvider(), kind: "local" };

  if (isConfigured(firebaseConfig)) {
    try {
      const provider = new FirebaseProvider(firebaseConfig);
      await provider.appReady;
      return { provider, kind: "firebase" };
    } catch (error) {
      onFallback?.(error);
      return { provider: new DemoProvider(), kind: "demo-fallback" };
    }
  }

  return { provider: new LocalProvider(), kind: "local" };
}
