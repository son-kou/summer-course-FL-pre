# Live Lecture Runbook

30-minute run-of-show for "Federated Learning in Medical AI: When Data Cannot
Move," including the live "You Already Trained Different Models" federation
activity and the closing Node vs Center playground. This is
an operating document, not a script — the actual words to say are in
`speaker-notes.md` (bilingual) / `speaker-notes-en.md`, or live in
`index.html?practice=1`. For how the live activity works under the hood, see
`LIVE_INTERACTION_ARCHITECTURE.md`.

Planned spoken content: **27:00**. Buffer: **3:00**. Course slot: **30:00**.

## The one rule that matters most

**There is exactly ONE dashboard tab, opened exactly ONCE, for the entire
lecture.** Every "Open Federation Dashboard →" button anywhere in the deck
points to the identical URL (`live/admin/index.html?autoqr=1`) and opens into
a named window (`fl-dashboard`), so clicking any of them after the first
just brings that same tab to the front — it does **not** create a new
session. The only action that creates a new session is clicking
**"Create / reset session"** on the dashboard itself, or opening the URL
fresh in a context with no window named `fl-dashboard` yet (e.g. the very
first click of the day, or a previous `fl-dashboard` tab you manually
closed).

**Never click "Create / reset session" once real students have joined.**
Doing so wipes every joined client and hands out a brand-new session code —
which is exactly the bug this runbook exists to prevent: a QR code that
students scanned pointing at a session the dashboard has already abandoned.

## Before class (allow 15 minutes)

1. **Open the deck**: `index.html` on the projector, fullscreen (`F`).
2. **Test the dashboard using a throwaway session**, then close it: open
   `live/admin/index.html` directly (not via the deck), click "Populate 60
   demo clients," then "Simulate responses," then "Start Round 1." You
   should see the Federation map fill with dots and the vectors/weights/
   evaluation panels populate with numbers within a couple of seconds.
   **Close this tab when done** — it is disposable practice, not the session
   you will actually teach with.
3. **Check the connection pill**, top-right of the dashboard, while doing the
   above:
   - "● live backend connected" → real Firebase session, works over the
     room's Wi-Fi. Proceed normally.
   - "● local rehearsal mode" → no Firebase configured; only devices on the
     *same machine* would sync. This is fine for rehearsing alone, but **not**
     for a real class of 60 phones — if you see this on the day of the
     lecture and expected Firebase to be configured, treat it as a backend
     failure (see Emergency Fallback below) and plan to use Demo Mode.
   - "● live backend unavailable — demo mode" → Firebase was configured but
     failed to connect (e.g. no internet). Demo Mode will be used
     automatically; no action needed beyond knowing this going in.
4. **Projector check**: confirm the dashboard is legible from the back of the
   room — big numbers (joined count, aggregation label, largest client
   weight) should be readable; the federation map dots and vector arrows
   should be visually distinct.
5. **Mobile check**: from the throwaway session in step 2, scan the join QR
   yourself once with your own phone to confirm it resolves to
   `live/index.html?code=...` and the opening poll loads within a couple of
   seconds. Then close that throwaway tab per step 2 — do **not** carry it
   into class.
6. Have the short manual URL (`live/index.html`) visible somewhere you can
   read aloud, in case a student's scanner fails. You will read the real
   session code aloud once class actually starts (step 2 of "During class").
7. **If you changed `live/firebase-config.js`, the Realtime Database security
   rules, or any file under `live/`** since the last time you taught, run the
   automated end-to-end check first instead of trusting a manual
   click-through: `python3 -m http.server 8931 &` then
   `node scripts/live_firebase_smoke_test.mjs http://127.0.0.1:8931`. It
   drives a real admin + student pair through join, decide, aggregate, and
   reset against whatever backend is configured, and fails loudly on any
   error instead of the silent-failure mode a manual walkthrough can miss.
   (`npm run qa:live` separately covers demo mode, cross-tab rehearsal, and
   fallback with no backend at all — run both after any `live/` change.)

## During class: exact sequence

The dashboard is used at exactly **four visits** (bolded below), always the
same tab. Between visits you are on the slide deck and the dashboard needs
no attention. Full talking points live in `speaker-notes.md` /
`index.html?practice=1` — this is the control sequence only.

| # | Slide | Where | Action | Target |
|---:|---|---|---|---:|
| 1 | Title | Deck | — | 0:40 |
| 2 | You Already Trained Different Models | Deck → **Dashboard visit 1** | Click **"Open Federation Dashboard →"** ONCE (creates the session, auto-shows the QR). Read the leading poll option aloud once ~70-80% have voted (or ~45-60s) | 2:30 |
| 3 | Why Not Simply Pool the Data? | **Dashboard visit 1 continues**, then Deck | Point at the "What this means" panel that appeared under the poll bars; discuss pool vs. federated vs. ensemble using the *real counts*. Before leaving, click **"Reveal federation map →"** | 1:50 |
| 4 | One Federated-Learning Round | Deck | Click through the 7 fragments. Dashboard needs no attention | 1:30 |
| 5 | Reveal Your Simulated Hospital | Deck | Prompt "tap Reveal my site" — no new scan needed. Nothing to click | 1:20 |
| 6 | Meet Our Federation | **Dashboard visit 2** | Click the same "Open Federation Dashboard" button (same tab reopens). Click **"Freeze enrollment"**. Ask the trust/weight questions over the now-populated map | 2:10 |
| 7 | Round 1: Federated Averaging | **Dashboard visit 2 continues** | Click **"Start Round 1"** — arrows and weight bars were deliberately empty until now; this click reveals them for the first time. Callback to the poll | 2:20 |
| 8 | The Data Are Not IID | Deck | Dashboard stays open in the background; no attention needed | 2:10 |
| 9 | FL Classics and the 2026 Frontier | Deck | — | 1:40 |
| 10 | Round 2: Federation Under Stress | **Dashboard visit 3** | Same tab. Ask room to predict → click **"B · Rare hospital"** (default) → compare with **"Clipped FedAvg"** or **"Coordinate median"** | 2:00 |
| 11 | Did It Help Every Hospital? | **Dashboard visit 3 continues** | Point at the evaluation panel (mean / worst site), still on screen from Round 2 | 1:30 |
| 12 | Security: What Moves, What Stays | Deck | Switch back to slide deck; dashboard no longer needed for the rest of class | 1:30 |
| 13 | Medical FL in the Real World | Deck | — | 1:30 |
| 14 | Four Lenses to Borrow | Deck | — | 2:00 |
| 15 | Explore the Node vs Center Playground | Deck | Show the (static) playground QR — distinct from the join code and the resources QR | 1:20 |
| 16 | Course Resources | Deck | Show the (static) resources QR — the third and final distinct QR | 1:00 |

Q&A and any overrun live inside the 3-minute buffer, seeded by the "Backup:
Q&A Prompts" slide (`Down` arrow from Slide 14) if discussion is slow.

### Notes on the live segment (slides 2-11)

- **One QR scan covers the whole activity.** Students join and answer the
  opening prediction poll on Slide 2; they are not asked to scan again on
  Slide 5 — just to tap "Reveal my site" on the session they already joined.
- **Do not wait for 60/60 votes or joins.** Proceed once roughly 70-80% have
  responded, or after about 45-60 seconds on the poll (Slide 2) / 90 seconds
  total by Slide 5, whichever comes first. Scanning always takes longer than
  it feels like it should.
- If joining is slow, narrate the poll options and site card fields out loud
  while people finish scanning — it is not dead air, it is pre-briefing.
- **Every "Open Federation Dashboard" click reopens the same tab and session**
  — you never need to re-create anything between visits 1, 2, and 3. If the
  dashboard tab was accidentally closed, clicking the button again from any
  slide reopens a fresh tab, but since no `?code=` is in that URL it would
  start a **new** session — see "The dashboard tab was accidentally closed
  mid-class" below for the recovery move if this happens.
- Only run **one** of Event B (rare hospital) or Event C (suspicious update)
  live unless you are ahead of schedule. Section "Running late" below tells
  you which to keep.
- When comparing aggregation strategies, change **one variable at a time**:
  same event, different policy button. Narrate what changed and why.
- **Clicking an event button (B/C) pops up a before → after banner** on the
  dashboard summarizing the numeric effect (e.g. target's FedAvg weight,
  global mean, worst-site score). It auto-dismisses after a few seconds, or
  click the **×** to close it early. Use it as your talking points for
  Slide 11 — the numbers it shows are exactly what changed.

## Rehearsal mode (practice alone, no class needed)

On the dashboard, click **"Rehearsal mode."** It overlays a 16-step strip at
the bottom with a suggested spoken line per step and a "Next step ▶"
button you advance manually at your own pace. Combine it with **"Populate 60
demo clients"** and **"Simulate responses"** to get a fully populated
federation to rehearse against, and **"Reset simulation"** to start over.
Rehearsal mode never touches real student data — it is available in Demo
Mode, Local Mode, and against a real Firebase backend equally.

To rehearse the two-device feel (instructor laptop + a "student" phone) with
**zero backend**, open `live/admin/index.html?local=1` in one browser tab and
`live/index.html?code=<the code shown>&local=1` in another — they sync live
on one machine via `BroadcastChannel`, no Wi-Fi or Firebase required.

## Emergency fallback

### Wi-Fi failure (before or during the join step)

Use Demo Mode. On the dashboard, click **"Populate 60 demo clients"** then
**"Simulate responses."** Tell the room: *"We'll simulate the federation
instead of waiting on the room's Wi-Fi — the result is exactly what your
phones would have produced."* Continue the run-of-show unchanged from Slide
6 onward.

### Backend failure (Firebase configured but unreachable)

Same as Wi-Fi failure: Demo Mode. The dashboard falls back to Demo Mode
automatically and shows "● live backend unavailable — demo mode" — no action
required beyond narrating the switch to the room.

### A student's screen shows a connection error

By design this is non-fatal: the student's site card is computed locally on
their device the moment they scan, independent of whether their decision
successfully reaches the dashboard. Their screen will say *"Live connection
unavailable. You can still explore your simulated site locally."* — tell them
to keep exploring their card; their individual data point may not appear on
the map, but this does not block the class.

### Students take too long to join or decide

Proceed at roughly 70% response. The pedagogical point (heterogeneous
weighting, non-IID disagreement, worst-site failure) holds at 40 responses as
well as it does at 60.

### Running 3 minutes late

Skip the four-shift-type card grid on Slide 8 ("The Data Are Not IID") —
keep only the two arrow figures and the center statement. On Slide 9 ("FL
Classics and the 2026 Frontier"), name FedProx, FedBN, and SCAFFOLD only —
skip FedOpt and the frontier grid. Run only **one** teaching event on Slide
10 (prefer **B · Rare hospital** — it connects most directly to Slide 11's
worst-site statement).

### Running 5 minutes late

Additionally: on Slide 13 ("Medical FL in the Real World"), drop the Teo et
al. evidence-gap statistic and keep only the scale (Pati et al.) and FeTS
stats. On Slide 14 ("Four Lenses to Borrow"), read cards 1 and 4 only
("Bias..." and "Fairness...") — they are the pair most often conflated. On
Slide 15 ("Explore the Node vs Center Playground"), show the QR and name the
three tabs without a live demonstration. Skip straight to the resources QR.

### The dashboard tab was accidentally closed mid-class

Click any "Open Federation Dashboard" button in the deck again. Because that
tab no longer exists, the browser opens a **fresh** one — and since its URL
has no `?code=`, it will mint a **brand-new session**, orphaning everyone
who already joined the old one. Recognize this immediately from the topbar:
`JOINED 0` and a session code you don't recognize from Slide 2 means this
just happened, not that everyone's connection dropped. Recovery depends on
timing:

- **Before or during the opening poll (Slides 2-3):** cheap to recover —
  just say "let's do that again" and re-show the QR; nobody has invested
  more than one tap yet.
- **After Round 1 has already run (Slides 6 onward):** do not try to recreate
  the old session. Say "let's fast-forward the federation" and click
  "Populate 60 demo clients" + "Simulate responses" on the new session to
  get back to an equivalent state in seconds, then continue narrating as
  normal — the pedagogical point survives even though the specific numbers
  changed.

### A red error / stack trace appears anywhere

This should not happen — every network call in `live/` is wrapped so
failures degrade to a plain-language banner, never an uncaught error (see
`LIVE_INTERACTION_ARCHITECTURE.md` §8). If it somehow does, refresh the
dashboard tab; the session data is not lost (it lives in the backend, not the
tab), except in pure Demo Mode where a refresh does reset the in-memory
session — in that case, click "Populate 60 demo clients" again and keep
going.

## After class

- Click **"Reset simulation"** so the next section/rehearsal starts clean.
- Leave `firebase-config.js` and the session code as-is between back-to-back
  sections of the same course — each **"Create / reset session"** click mints
  a fresh code, so sections do not collide.
- No manual cleanup is required in Firebase after a single day of teaching;
  see `LIVE_INTERACTION_ARCHITECTURE.md` §10 if the same project accumulates
  sessions across many terms.
