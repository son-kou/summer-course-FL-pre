# Course Design Notes

## Audience

Clinically oriented PhD students who may collaborate with machine-learning groups but are not assumed to be FL specialists.

## Design Principle

The course starts from a medical collaboration dilemma rather than an algorithm taxonomy. The goal is to help participants recognize when FL is useful, when it is excessive, and which questions must be asked before a federation is built.

## Narrative Architecture

The 2026 research edition is structured as three acts:

1. What FL is: constrained data movement, collaboration designs, one FL round, and aggregation assumptions.
2. Where medical FL research stands: evidence-gap metrics, brain-cancer federation, FeTS benchmarking, and current implementation limits.
3. What every clinical PhD can learn: heterogeneity, domain shift, personalization, missing modalities, privacy, hospital-level evaluation, governance, frontier map, and transferable research habits.

## Timing

The live run is designed for 26.2 minutes of spoken content plus a 1.8-minute buffer. There are 16 horizontal main slides and optional vertical backups for the FedAvg formula, evidence details, and frontier reading map.

## Evidence Policy

Main slides use short visible citations and links. Supporting pages include the full BibTeX file, an annotated reference browser, and a source inventory with verification dates. Preprints are labelled as preprints in the bibliography and notes. Public clinical studies are described as educational examples only.

## Visual Policy

Most diagrams are original SVG assets created for this course. The 2026 edition adds an official AU logo asset, a conservative Cercare Medical text wordmark, and a public Wikimedia glioma MRI image. The MRI is used only as a teaching visual and domain-shift lab input; it is not from Pati et al., FeTS, Aarhus University, Cercare Medical, or the presenter.

## Accessibility And Delivery

The primary course artifact is a Quarto Reveal.js deck with keyboard navigation, speaker notes, and a static GitHub Pages deployment path. Supporting labs are static HTML and JavaScript so they can run offline after render and without a backend.
