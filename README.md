# Federated Learning in Medical AI

Research-level Quarto Reveal.js course website for a 30-minute session by **Geng Sun**, Industrial PhD at Cercare Medical / Aarhus University, for clinically oriented PhD students on **18 August 2026**.

The central question is:

> When clinical data cannot move, what are our options, what does federated learning actually solve, what does it not solve, and how can a medical researcher decide whether to use it?

## Learning Objectives

Participants should leave able to:

- explain the basic federated-learning workflow and aggregation assumptions;
- distinguish centralized learning, local-only learning, federated learning, federated evaluation, and federated analytics;
- summarize the current medical FL evidence gap without overstating clinical maturity;
- ask better questions about heterogeneity, missing modalities, personalization, privacy, governance, validation, uncertainty, and infrastructure;
- borrow FL research habits for multicentre clinical AI projects even when FL is not the final design.

## Local Preview

```bash
npm install
quarto preview
```

Open the local URL shown by Quarto. The main deck is `index.html`.

## Build

```bash
quarto render
```

The rendered website is written to `_site/`.

For the full reproducible local check used during development:

```bash
./scripts/validate_project.sh
```

That helper regenerates the QR code and PDFs, renders the Quarto site, and checks required internal files, links, labs, iframes, citation count, malformed Reveal attributes, local path leaks, and asset provenance. The small npm dev dependency pins a Sass CLI for local Quarto environments that do not expose their bundled Sass binary correctly; the GitHub Pages workflow uses the official Quarto setup action.

## Presenter View And Navigation

- `Right` / `Left`: move through the main story.
- `Up` / `Down`: optional vertical detail slides.
- `S`: presenter view with notes.
- `O`: overview mode.
- `F`: fullscreen.
- `E`: export/print view where supported by Reveal.js.

## Export PDF

For the slide deck, open `index.html?print-pdf` in a browser and print to PDF. The readiness checklist and multicentre clinical AI research lens also have pre-rendered printable PDFs at:

```text
downloads/federated-study-readiness-checklist.pdf
downloads/multicentre-clinical-ai-research-lens.pdf
```

## Deployment

This repository is configured for GitHub Pages with a Quarto workflow:

```text
https://son-kou.github.io/summer-course-FL-pre/
```

The workflow renders the Quarto project, uploads the `_site` artifact, and deploys with GitHub Pages.

## Repository Structure

- `index.qmd`: Reveal.js presentation.
- `decision-guide.qmd`: interactive method-selection guide.
- `checklist.qmd`: web checklist.
- `references.qmd`: searchable annotated bibliography.
- `resources.qmd`: curated learning resources and full lab links.
- `multicentre-research-lens.qmd`: HTML version of the clinical AI research lens handout.
- `frontier.qmd`: research frontier map.
- `demo/`: standalone heterogeneity teaching simulation.
- `labs/`: standalone interactive labs embedded in the deck and linked from resources.
- `assets/diagrams/`: original SVG diagrams.
- `assets/mri/`: public MRI asset and provenance README.
- `assets/brand/`: official AU logo PNG and conservative Cercare Medical text wordmark.
- `styles/`: CSS for the website and Reveal.js presentation.
- `research/`: source inventory, course design notes, and image licence log.
- `scripts/`: lightweight validation helpers.
- `.github/workflows/publish.yml`: GitHub Pages deployment workflow.

## Citation And Image Policy

Main-slide citations are intentionally concise. Full references are available in `references.bib`, `references.html`, and `research/source-inventory.md`.

Most committed teaching diagrams are original SVGs created for this course. No patient data, confidential Cercare data, proprietary figures, or copied publisher figures are used. The AU logo comes from the official AU logo package and is used unchanged. The MRI visual is a public Wikimedia Commons asset with attribution recorded in `assets/mri/README.md` and `research/image-licence-log.md`. The Cercare Medical asset is a text wordmark, not an official logo, because no redistributable official logo was available during implementation.

## Acknowledgements

The course draws on peer-reviewed federated learning, medical AI, governance, privacy, and benchmarking literature, plus official documentation from Quarto, Flower, TensorFlow Federated, NVIDIA FLARE, OpenFL, MLCommons MedPerf, and educational tutorial teams.

## Licence

Code and original diagrams in this repository are released under the MIT License unless otherwise noted. Bibliographic metadata and third-party links retain their respective source terms.
