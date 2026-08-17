# Live Lecture Runbook

30-minute run-of-show for "Federated Learning in Medical AI: When Data Cannot
Move," including the live "You Already Trained Different Models" federation
activity and the closing Node vs Center playground. This is
an operating document, not a script — the actual words to say are in
`speaker-notes.md` (bilingual) / `speaker-notes-en.md`, or live in
`index.html?practice=1`. For how the live activity works under the hood, see
`LIVE_INTERACTION_ARCHITECTURE.md`.

Planned spoken content: **27:00**. Buffer: **3:00**. Course slot: **30:00**.

## Before class (allow 15 minutes)

1. **Open the deck**: `index.html` on the projector, fullscreen (`F`).
2. **Open the dashboard in a second tab**: `live/admin/index.html`. Do not
   project this tab yet — keep it ready to switch to.
3. **Test the connection.** Look at the connection pill, top-right of the
   dashboard:
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
4. **Confirm Demo Mode works regardless**: on the dashboard, click "Populate
   60 demo clients," then "Simulate responses." You should see the Federation
   map fill with dots and the weights/evaluation panels populate with
   numbers within a couple of seconds. Click "Reset simulation" afterward so
   the room starts from zero.
5. **Projector check**: confirm the dashboard is legible from the back of the
   room — big numbers (joined count, aggregation label, largest client
   weight) should be readable; the federation map dots and vector arrows
   should be visually distinct.
6. **Mobile check**: scan the join QR yourself once with your own phone to
   confirm it resolves to `live/index.html?code=...` and the welcome screen
   loads within a couple of seconds.
7. Have the short manual URL (`live/index.html`) and the session code visible
   somewhere you can read aloud, in case a student's scanner fails.
8. **If you changed `live/firebase-config.js`, the Realtime Database security
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

Each step names the slide, the dashboard action (if any), and the target
time from `speaker-notes.md`. Full talking points live in the speaker notes —
this is the control sequence only.

| # | Slide | Dashboard / control action | Target |
|---:|---|---|---:|
| 1 | Title | — | 0:40 |
| 2 | You Already Trained Different Models | Switch to dashboard tab → **Create / reset session** → **Show JOIN QR** (full screen); poll chart fills live | 2:30 |
| 3 | Why Not Simply Pool the Data? | Read the leading poll option aloud, then click **Reveal federation map** | 1:50 |
| 4 | One Federated-Learning Round | Click through the 7 fragments | 1:30 |
| 5 | Reveal Your Simulated Hospital | Prompt "tap Reveal my site" — no new scan needed | 1:20 |
| 6 | Meet Our Federation | **Freeze enrollment** | 2:10 |
| 7 | Round 1: Federated Averaging | Confirm aggregation = **FedAvg**; talk through weights panel; callback to the poll | 2:20 |
| 8 | The Data Are Not IID | (dashboard stays as-is; talk over it) | 2:10 |
| 9 | FL Classics and the 2026 Frontier | — | 1:40 |
| 10 | Round 2: Federation Under Stress | Ask room to predict → click **B · Rare hospital** (default) → compare with **Clipped FedAvg** or **Coordinate median** | 2:00 |
| 11 | Did It Help Every Hospital? | Point at evaluation panel (mean / worst site) | 1:30 |
| 12 | Security: What Moves, What Stays | Switch back to slide deck | 1:30 |
| 13 | Medical FL in the Real World | — | 1:30 |
| 14 | Four Lenses to Borrow | — | 2:00 |
| 15 | Explore the Node vs Center Playground | Show the playground QR (distinct from join and resources) | 1:20 |
| 16 | Course Resources | Show the resources QR (third and final distinct QR) | 1:00 |

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
- Only run **one** of Event B (rare hospital) or Event C (suspicious update)
  live unless you are ahead of schedule. Section "Running late" below tells
  you which to keep.
- When comparing aggregation strategies, change **one variable at a time**:
  same event, different policy button. Narrate what changed and why.

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
