# Speaker Notes And Timing

This file is a printable companion to the embedded Reveal.js speaker notes. The live deck also includes detailed notes for every main slide; open presenter view with `S`.

## Twenty-Six-Minute Run

| Slide | Topic | Target time | Purpose |
|---|---:|---:|---|
| 1 | Title: When Data Cannot Move | 1.1 min | Set up FL as a clinical collaboration problem. |
| 2 | Four hospitals, one question | 1.4 min | Make the data-movement dilemma concrete. |
| 3 | Five collaboration designs | 1.5 min | Show that FL is one option among several. |
| 4 | One FL round + aggregation sandbox | 2.0 min | Explain what moves and why aggregation is a policy assumption. |
| 5 | Achievement versus evidence gap | 1.8 min | Separate research volume from clinically mature evidence. |
| 6 | Brain cancer: scale, benchmarking, evaluation | 2.1 min | Use Pati 2022 and FeTS 2025 as the main research-level example. |
| 7 | Lesson 1: heterogeneity as signal | 1.5 min | Translate non-IID into clinical and workflow language. |
| 8 | MRI domain-shift lab | 1.9 min | Make apparent domain shift visible on one public image. |
| 9 | Shared and local models | 1.8 min | Introduce partial pooling, personalization, and local calibration. |
| 10 | Missing modalities | 1.8 min | Treat modality availability as a design input. |
| 11 | Privacy as a systems property | 1.7 min | Replace "data stay local" with information-flow thinking. |
| 12 | Evaluate the hospital | 1.8 min | Prioritize per-site, worst-site, calibration, UQ, and abstention. |
| 13 | Real-world federation stack | 1.5 min | Show governance, data, clinical, and infrastructure work below the algorithm. |
| 14 | Research frontier map, 2026 | 2.0 min | Map six active research areas with maturity labels. |
| 15 | What clinical PhDs can borrow tomorrow | 1.4 min | Give a practical research lens and handout. |
| 16 | Final synthesis and resources | 0.9 min | Close with the QR code and references. |
| Buffer | Questions and transitions | 1.8 min | Absorb interruptions and local examples. |

Planned spoken content: 26.2 minutes before buffer.

## Core Through-Line

1. The real problem is multicentre medical collaboration under constraints.
2. FL is one design option, not a default.
3. Strong examples show scale and distributed evaluation, especially brain cancer.
4. Heterogeneity, missing modalities, privacy leakage, site-level failure, and governance can still break the project.
5. The most portable lesson is a sharper way to design multicentre clinical AI research.

## Late-Running Version

Keep slides 1, 2, 3, 4, 5, 6, 7, 11, 12, 15, and 16. Skip optional vertical backup slides and run only one interaction: aggregation or MRI domain shift.

## Audience Prompts

- Opening: "Who has worked with data that could not leave its institution?"
- Aggregation sandbox: "Should the hospital with the most patients always have the most influence?"
- Heterogeneity: "Which of these site differences could change the clinical meaning of the same variable?"
- MRI lab: "What changed: anatomy, measurement, or decision threshold?"
- Shared/local: "Which site would you protect if the global model and worst-site model disagree?"
- Privacy: "Who can see what, and what could they infer?"
- Evaluation: "Would you deploy a model with a good global score if one hospital is unsafe?"

## Claims To Keep Precise

- Say "model updates, metrics, logs, and released models can still carry information" rather than "nothing leaves the hospital."
- Say "can reduce some data-movement risks" rather than "guarantees privacy."
- Label all lab values as illustrative and educational.
- Identify the MRI visual as public Wikimedia material, not local clinical data or FeTS/Pati data.
- Label FHBench and Med-MMFL as preprints.
