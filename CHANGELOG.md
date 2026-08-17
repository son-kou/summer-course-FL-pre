# Changelog

## 2026-08-17

- Redesigned the 30-minute lecture around one live activity: "You Are Now a Federated Client." Roughly 60 students scan a QR code, each becomes one deterministic synthetic FL client, and the instructor runs real aggregation rounds live against the room's own data.
- Added `live/`: a framework-free student app and instructor dashboard, a pure/unit-tested deterministic simulation engine (8 hospital archetypes, FedAvg/equal-client/clipped/coordinate-median aggregation, a synthetic 4-environment evaluation panel, and 3 injectable teaching events), and a backend provider abstraction (optional Firebase Realtime Database, same-machine rehearsal via BroadcastChannel, and a fully offline Demo Mode that is the mandatory fallback).
- Restructured `index.qmd` from 17 to 14 main slides around the live activity's narrative: four hospitals → one FL round → join → meet the federation → Round 1 (FedAvg, derived live) → non-IID reveal → Round 2 (stress event) → worst-site vs. mean → privacy → real-world evidence → takeaways → resources. Target spoken content is 27:00 of 30:00, leaving an explicit 3-minute operational buffer.
- Moved the full MRI domain-shift lab, personalization slider, missing-modality matrix, privacy threat-surface explorer, five-collaboration-designs taxonomy, research frontier map, and real-world federation stack into backup slides / `resources.qmd` — kept fully working, none deleted.
- Rewrote `assets/practice/slide-scripts.json` (bilingual EN/ZH) for the new 14-slide flow and regenerated `speaker-notes.md`, `speaker-notes-en.md`, and `rehearsal-notes.qmd` from it.
- Added `LIVE_LECTURE_RUNBOOK.md` (run-of-show, emergency fallback playbook) and `LIVE_INTERACTION_ARCHITECTURE.md` (frontend/backend design, security model, data schema, deterministic simulation, deployment).
- Added `live/tests/simulation.test.mjs` (`npm test`) and `scripts/live_browser_qa.mjs` (`npm run qa:live`); updated `scripts/check_links.py` and `scripts/browser_qa.mjs` for the new slide count and ids.

## 2026-08-04

- Rebuilt the course as a 16-slide research-level edition: "Federated Learning in Medical AI: When Data Cannot Move."
- Refined the Reveal.js visual system with editorial typography, safer slide padding variables, stronger grid composition, and quieter captions.
- Added optional bilingual English-Chinese rehearsal mode behind `?practice=1`, including drawer tabs, keyboard handling, focus management, and generated printable notes.
- Simplified the public navbar and resources page into Course Materials, Interactive Labs, Further Reading, Full References, and GitHub.
- Added slide-friendly `?embed=1` lab skins so embedded labs fit the deck while standalone lab pages remain fully usable.
- Added a three-act narrative covering FL basics, medical FL evidence, and transferable clinical-research lessons.
- Added standalone interactive labs for aggregation, MRI domain shift, personalization, missing modality, privacy threat-surface exploration, and hospital-level evaluation.
- Added official AU branding from the AU logo package and a conservative Cercare Medical text wordmark.
- Added a public Wikimedia glioma MRI image with explicit provenance and usage limitations.
- Expanded the bibliography to 79 entries with verified 2024-2026 sources and preprint labels.
- Added the "What Clinical Researchers Can Borrow from Federated Learning" HTML/PDF handout.
- Added a 2026 research frontier map page.
- Strengthened validation for links, labs, iframes, rehearsal scripts, QR source, raw Reveal attribute leaks, local path leaks, PDF generation, asset provenance, and bibliography count.
