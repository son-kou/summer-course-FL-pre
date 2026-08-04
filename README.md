# Federated Learning in Medical AI

Course presentation for a 30-minute session by **Geng Sun**, Industrial PhD at Cercare Medical / Aarhus University, for clinically oriented PhD students on **18 August 2026**.

The central question is:

> When clinical data cannot move, what are our options, what does federated learning actually solve, what does it not solve, and how can a medical researcher decide whether to use it?

## Learning Objectives

Participants should leave able to:

- explain the basic federated-learning workflow without equations;
- distinguish centralized learning, local-only learning, federated learning, federated evaluation, and federated analytics;
- recognize when FL may be useful in multicentre medical research;
- recognize when a centralized or simpler design may be preferable;
- ask better questions about heterogeneity, governance, validation, privacy, and infrastructure.

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

That helper regenerates the QR code and checklist PDF, renders the Quarto site, and checks required internal files and links. The small npm dev dependency pins a Sass CLI for local Quarto environments that do not expose their bundled Sass binary correctly; the GitHub Pages workflow uses the official Quarto setup action.

## Presenter View And Navigation

- `Right` / `Left`: move through the main story.
- `Up` / `Down`: optional vertical detail slides.
- `S`: presenter view with notes.
- `O`: overview mode.
- `F`: fullscreen.
- `E`: export/print view where supported by Reveal.js.

## Export PDF

For the slide deck, open `index.html?print-pdf` in a browser and print to PDF. The readiness checklist also has a pre-rendered printable PDF at:

```text
downloads/federated-study-readiness-checklist.pdf
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
- `resources.qmd`: curated learning resources.
- `demo/`: standalone heterogeneity teaching simulation.
- `assets/diagrams/`: original SVG diagrams.
- `styles/`: CSS for the website and Reveal.js presentation.
- `research/`: source inventory, course design notes, and image licence log.
- `scripts/`: lightweight validation helpers.
- `.github/workflows/publish.yml`: GitHub Pages deployment workflow.

## Citation And Image Policy

Main-slide citations are intentionally concise. Full references are available in `references.bib`, `references.html`, and `research/source-inventory.md`.

All committed teaching diagrams are original SVGs created for this course. No patient data, confidential Cercare data, proprietary figures, or copied publisher figures are used. Externally informed concepts are cited in the relevant slides and image licence log.

## Acknowledgements

The course draws on peer-reviewed federated learning, medical AI, governance, privacy, and benchmarking literature, plus official documentation from Quarto, Flower, TensorFlow Federated, NVIDIA FLARE, OpenFL, MLCommons MedPerf, and educational tutorial teams.

## Licence

Code and original diagrams in this repository are released under the MIT License unless otherwise noted. Bibliographic metadata and third-party links retain their respective source terms.
