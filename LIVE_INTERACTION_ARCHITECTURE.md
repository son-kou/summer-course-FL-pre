# Live Interaction Architecture

This document describes `live/` — the "You Are Now a Federated Client" activity —
for whoever next has to configure, extend, or debug it. It assumes the reader
has read `README.md` but not necessarily this repository's history.

## 1. What this is, in one paragraph

Roughly sixty students scan a QR code and each becomes one simulated
federated-learning client. Their "local training result" is not computed by
their phone — it is a deterministic function of `(session code, client id)`
evaluated identically on every device, so the whole exercise needs no real
computation, no ML runtime, and no server-side simulation. The phone's only
job is to display that precomputed profile, collect a participation decision,
and relay both to whatever real-time channel is configured. The instructor's
dashboard aggregates whatever it receives and visualizes it. If no real-time
channel is configured, or Wi-Fi fails, the whole thing still works because the
instructor can generate all sixty "responses" locally with one click.

## 2. Frontend architecture

`live/` is a static, framework-free app, matching the rest of this repository
(see `labs/*/app.js`) — no build step, no bundler, no npm runtime dependency.
It ships as plain ES modules loaded directly by the browser.

```
live/
  index.html          student entry point            → /live/
  student.js           student screen state machine
  admin/
    index.html         instructor dashboard           → /live/admin/
    admin.js            dashboard controller + visualizations
    admin.css
  lib/
    simulation.js       pure math: archetypes, aggregation, evaluation (unit tested)
    backend.js           provider abstraction: Demo / Local / Firebase
    identity.js           anonymous per-session client id (localStorage)
    dom.js                 tiny DOM-building helper shared by student.js/admin.js
  vendor/
    qrcode.js            vendored MIT-licensed QR encoder (kazuhikoarase/qrcode-generator)
  firebase-config.js    public Firebase Web config (placeholder by default)
  tests/
    simulation.test.mjs  node --test unit tests for lib/simulation.js
  style.css             shared visual language (reuses the deck's brand tokens)
  package.json         {"type":"module"} — scopes ES-module resolution for `node --test`
```

`lib/simulation.js` has **zero DOM or network dependencies** — it is pure
functions over plain objects/arrays, which is what makes it unit-testable
and auditable independent of the UI. Everything else (`student.js`,
`admin.js`) is glue: DOM rendering + calling into `simulation.js` and
`backend.js`.

The QR code is generated **client-side, offline**, by a vendored encoder
(`vendor/qrcode.js`, MIT licence, ~2300 lines, no dependencies) rather than a
hosted QR API. A classroom must not depend on an internet call succeeding
just to display a join code.

### Routes on GitHub Pages

The site is served from a repository subpath
(`https://son-kou.github.io/summer-course-FL-pre/`), not a domain root. All
internal references in `live/` use **relative paths** (`./style.css`,
`../style.css`, `./lib/simulation.js`), never absolute `/…` paths, so the app
works identically under the Pages subpath and under `quarto preview`'s
root-relative local server. `_quarto.yml` lists `live/**` under
`project.resources` so Quarto copies the directory into `_site/` verbatim
(it contains no `.qmd`/`.py`/executable-notebook files for Quarto to render).

The main slide deck embeds small **read-only previews** of the dashboard via
`<iframe src="../live/admin/index.html?embed=1&demo=1">`, following the exact
pattern already used for `labs/*/index.html?embed=1`. `?embed=1` adds a
`.embed` class to `<html>` that hides admin controls and compacts spacing —
the embedded preview is for rehearsal/visual continuity only. **The activity
is always operated from the full-size page**, opened in a new tab via the
"Open Federation Dashboard →" buttons on the relevant slides.

## 3. Backend choice and the provider abstraction

`live/lib/backend.js` exports one interface, three implementations, and a
factory that picks between them:

```js
createSession(code, meta)             // instructor: start a session
watchMeta(code, cb)   → unsubscribe   // meta = {phase, joinOpen, aggregation, event, eventClientId}
watchClients(code, cb) → unsubscribe  // cb receives {clientId: record, ...}
setMeta(code, patch)
upsertClient(code, clientId, patch)
resetSession(code)
```

| Provider | Transport | When used |
|---|---|---|
| `DemoProvider` | In-memory (this tab only) | `?demo=1`, or automatic fallback if Firebase fails |
| `LocalProvider` | `BroadcastChannel` + `localStorage` | Default when no Firebase config is set, or `?local=1`. Syncs across tabs/windows **on the same machine** — enough to rehearse the instructor+student flow alone on a laptop |
| `FirebaseProvider` | Firebase Realtime Database, anonymous auth | Only when `live/firebase-config.js` has real (non-placeholder) values |

`createBackend()` in `backend.js` resolves which provider to use, in this
order: `?demo=1` forces Demo; `?local=1` forces Local; a configured
`firebase-config.js` tries Firebase and **falls back to Demo automatically**
if initialization throws; otherwise it defaults to Local so the app is
useful with zero configuration.

This means: **Firebase is optional.** The repository ships fully functional
without it. Wiring up Firebase upgrades the ~60-phone real classroom
experience from "same machine only" to "real Wi-Fi, real phones," and that is
the *only* thing it changes.

### Why Firebase (if you do configure it)

- Realtime Database push updates work from a static site with no server code.
- Anonymous auth needs no student-facing login UI.
- The free tier comfortably covers one session of ~60 clients sending a
  handful of small writes each.
- No secrets are needed in the frontend: a Firebase web config is a public
  project identifier, not a credential (see Firebase's own documentation on
  this point) — the security boundary is the Realtime Database **rules**,
  not hiding the config object.

## 4. Configuring the real backend (Firebase), step by step

Skip this section entirely to keep using the zero-config `LocalProvider` /
`?demo=1` path — it is a complete teaching tool on its own.

1. Go to the [Firebase console](https://console.firebase.google.com/) →
   **Add project** (any name, Google Analytics not needed).
2. In the project, open **Build → Realtime Database → Create Database**.
   Choose a region close to the venue; start in **locked mode**.
3. Open **Build → Authentication → Sign-in method** and enable
   **Anonymous**.
4. Open **Project settings → General → Your apps → Add app → Web**, register
   an app (no hosting needed), and copy the `firebaseConfig` object shown.
5. Paste those values into `live/firebase-config.js` in this repository,
   replacing every `YOUR-PROJECT`/`YOUR-API-KEY` placeholder. Commit the
   file — it is safe to commit (see above).
6. In **Realtime Database → Rules**, paste:

   ```json
   {
     "rules": {
       ".read": false,
       ".write": false,
       "sessions": {
         "$code": {
           ".read": "auth != null",
           "meta": {
             ".write": "auth != null"
           },
           "clients": {
             "$clientId": {
               ".write": "auth != null && newData.child('uid').val() === auth.uid && (!data.exists() || data.child('uid').val() === auth.uid)"
             }
           }
         }
       }
     }
   }
   ```

   This denies everything by default, then allows any anonymously
   authenticated device to read a session, and restricts each client record
   to being written only by the device that created it (`backend.js` stamps
   every client write with the signed-in anonymous `uid` for exactly this
   check).

7. Redeploy the site (or just test locally — Firebase works the same from
   `quarto preview`, since only the config object matters, not the origin).

**Known limitation, stated plainly:** the `meta` node (session phase,
aggregation policy, teaching events) is writable by *any* anonymously
authenticated device, including a student's, because there is no
student-vs-instructor role in anonymous auth. In practice this is mitigated
by the admin URL/session code never being shown to students and by resetting
between classes — it is *not* cryptographically enforced. Hardening this
further (custom claims, a Cloud Function gatekeeper) is a reasonable next
step but is deliberately out of scope here: this is a 30-minute classroom
tool, not a production system (see the "do not over-engineer" note in the
project's design brief).

## 5. Session and data schema

Realtime Database layout (identical shape is used in-memory by
`DemoProvider`/`LocalProvider`):

```
sessions/
  FL-4821/
    meta/
      phase: "lobby" | "joining" | "round1" | "stress" | "closed"
      joinOpen: boolean
      aggregation: "fedavg" | "equal" | "clipped" | "median"
      event: null | "giant" | "rare" | "suspicious"
      eventClientId: string | null
      createdAt: ISO timestamp
    clients/
      client-a1b2c3/
        archetype: "raresubgroup"
        archetypeLabel: "Rare subgroup centre"
        archetypeNote: string
        nTrain, nVal: number
        prevalence, dataQuality, labelNoise, domainShift, missingness: number 0-1
        localMetricBefore, localMetricAfter: number   // context only — never aggregated
        delta: [dx, dy]                                // the 2D projected model update
        updateNorm: number
        rarePopulation, suspicious, straggler: boolean
        decision: null | "participate" | "hold" | "flag"
        concern: null | "small-sample" | "unusual-population" | "label-quality" |
                 "distribution-shift" | "unusual-update" | "worse-performance" | "other"
        uid: string        // Firebase only — the writer's own anonymous auth uid
        joinedAt, decidedAt, updatedAt: timestamps
```

No name, email, or any personal identifier is ever collected. `clientId` is a
random token minted in `localStorage` (`live/lib/identity.js`), scoped per
session code, so refreshing the page resumes the same client instead of
minting a new one (the read-me-first fix for "a student refreshing should
not create endless duplicate clients").

## 6. Deterministic simulation

`live/lib/simulation.js` is the single source of truth for all synthetic
numbers, and it is deliberately **pure** — same inputs, same outputs, forever,
independent of any UI or backend state. This is what "deterministic" means in
practice here: `generateClient("FL-4821", "client-37")` returns byte-identical
output on the instructor's laptop, a student's phone, and a re-run three
weeks later.

- **PRNG**: `mulberry32(seed)`, a small well-known deterministic generator.
- **Seeding**: `clientRng(sessionSeed, clientId)` hashes
  `` `${sessionSeed}::${clientId}` `` (`hashString`, djb2 variant) into a
  32-bit seed. This is the literal implementation of "session seed + client
  id" as the profile's source of randomness.
- **Archetypes**: `ARCHETYPES` defines 8 underlying hospital profiles (large
  academic centre, small rural centre, different scanner/protocol,
  label-definition mismatch, high-quality specialist centre, noisy/problematic
  site, slow/resource-limited site, rare-subgroup centre), each with ranges
  for sample size, prevalence, data quality, label noise, domain shift,
  missingness, an update-direction angle ± spread, a magnitude range, and a
  local-metric-before/after range. `generateClient` samples one archetype
  (weighted) and then samples every field from that archetype's ranges using
  the seeded RNG — never `Math.random()`.
- **The 2D projection**: every client's "model update" is `delta = [dx, dy]`,
  derived from a per-archetype angle (in the 2D plane) plus per-client noise,
  and a magnitude. This is explicitly a **pedagogical projection** — a real
  update has thousands to millions of parameters. The UI never lets students
  or the instructor forget this (see the caveat text baked into
  `student.js` and the deck's Slide 4 speaker notes).
- **Local metric vs. update — kept structurally separate.** `localMetricBefore`/
  `localMetricAfter` are sampled independently of `delta` and are *never* read
  by any aggregation function. `evaluateGlobalUpdate()` takes only the
  aggregated `globalDelta` as input — it has no parameter through which a list
  of local metrics could enter. This is a deliberate structural guard against
  ever accidentally computing `global_metric = average(local_metric)`, which
  would be conceptually wrong (see `live/tests/simulation.test.mjs`, test:
  *"evaluateGlobalUpdate never treats mean as an average of local metrics"*).

## 7. Aggregation formulas

All four strategies live in `AGGREGATION_STRATEGIES` in `simulation.js` and
share one contract: given a list of clients (each with `decision`, `nTrain`,
`delta`), return `{weights: Map<id, number>, included: string[], globalDelta: [dx, dy]}`.
Only clients with `decision === "participate"` or `"flag"` are ever included
(`hold` and not-yet-responded clients contribute nothing — see `eligible()`).

- **FedAvg** (`fedavg`): `p_k = n_k / Σ_j n_j`; `globalDelta = Σ_k p_k · delta_k`.
  This is the literal `w_{t+1} = Σ (n_k/Σn_j) w_{t+1}^{(k)}` from McMahan et
  al., applied to the 2D projection.
- **Equal-client** (`equal`): `p_k = 1/K` for the `K` participating clients.
  Shown as an explicit *teaching contrast*, never labelled "the fair one."
- **Clipped FedAvg** (`clipped`): each client's `delta` is clipped to a
  maximum norm (default 1.6) *before* the same sample-size-weighted average
  is applied. `clipDelta()` preserves direction, only shrinks magnitude.
- **Coordinate median** (`median`): the coordinate-wise median of `dx` and
  `dy` across participating clients — a robust-aggregation illustration, with
  an explicit UI label that it is simplified and not a default recommendation.

`evaluateGlobalUpdate(globalDelta)` scores the aggregated update against four
fixed synthetic evaluation environments (common academic / rural / shifted
scanner / rare subgroup), each with an "ideal" direction and baseline. Alignment
between the global update's direction and an environment's ideal direction
raises that environment's score; overshoot (too large a norm) penalizes it.
This is what lets "global mean improves while the rare-subgroup hospital gets
worse" happen honestly, from one coherent formula, rather than from
hand-tuned UI numbers.

## 8. Demo mode (the mandatory fallback)

`?demo=1` on either `live/index.html` or `live/admin/index.html` forces
`DemoProvider` — fully in-memory, no network calls at all. On the dashboard,
**"Populate 60 demo clients"** calls `generateRoster(seed, 60)` and writes
every client's join payload; **"Simulate responses"** then assigns each
client a deterministic decision (`decideForClient`, seeded by
`` `${seed}::decision` `` — deterministic outcome, only the *stagger timing*
between writes uses `Math.random()`, purely for a "students trickling in"
visual effect, never for the data itself). The resulting federation is
pixel-for-pixel the same shape as a real session with the same seed and the
same decisions — this is what "looks exactly like the live version" means in
practice.

**Rehearsal mode** (the "Rehearsal mode" button on the dashboard) does not
change any data path — it overlays a fixed 13-step script (matching the
deck's slide order) with a suggested spoken line per step and a manual
"Next step" advance, so the instructor can rehearse the full 30-minute
sequence alone by combining it with "Populate 60 demo clients."

## 9. Deployment

No separate deployment step exists for `live/` — it is published by the same
`quarto render` + GitHub Pages workflow as the rest of the site
(`.github/workflows/publish.yml`), because `live/**` is declared as a Quarto
project resource (`_quarto.yml`). There is nothing to build, transpile, or
bundle.

If a Firebase backend is configured, there is also nothing to deploy on the
Firebase side beyond the one-time console setup in §4 — Realtime Database and
Anonymous Auth are managed services with no server code to ship.

## 10. Cleanup and session lifetime

Firebase Realtime Database has no built-in per-key TTL. This project
deliberately does **not** add a Cloud Function or scheduled job to expire old
sessions — that would be exactly the kind of infrastructure this activity is
supposed to avoid (see "do not over-engineer" in the design brief). Instead:

- Click **"Reset simulation"** on the dashboard between rehearsals or
  sections/lecture repeats — it clears `clients/` and `meta` for that session
  code, so no history keeps accumulating.
- A stale session left in the database costs nothing but a few KB and is
  invisible to anyone who does not know its code.
- If the same Firebase project is reused across many terms, periodically
  delete old `sessions/<code>` nodes by hand from the console (Realtime
  Database → data browser). This is a manual, occasional chore, not an
  operational requirement.

## 11. How to test locally

```bash
# Pure simulation math — deterministic, no browser needed
npm test                       # node --test live/tests/

# Whole main deck, including the embedded dashboard previews
quarto preview                 # or: quarto render && python3 -m http.server -d _site
npm run qa:browser              # scripts/browser_qa.mjs — Playwright smoke test of all 14 slides

# The live activity specifically: student flow, admin dashboard, cross-tab
# rehearsal sync with no backend, graceful fallback, mobile viewports
npm run qa:live                 # scripts/live_browser_qa.mjs
```

To rehearse the student experience without a second device, open
`live/index.html?demo=1` directly — it behaves like a real join with a fully
self-contained in-memory session.

To rehearse instructor + student together on one laptop with **no backend at
all**, open `live/admin/index.html?local=1` in one tab to get a session code,
then `live/index.html?code=<that code>&local=1` in a second tab — they sync
live via `BroadcastChannel`.

To test the Firebase path without a real classroom, configure
`firebase-config.js` as in §4 and open the same two pages without `?local=1`
or `?demo=1` — the app should automatically pick up the Firebase provider
(check the connection pill in the top-right of the dashboard: "● live backend
connected").
