# Speaker Notes And Timing

This file is a printable companion to the embedded Reveal.js speaker notes. The live deck also includes notes that open with `S` in presenter view.

## Thirty-Minute Run

| Slide | Topic | Target time | Purpose |
|---|---:|---:|---|
| 1 | Title and frame | 1.0 min | Set up FL as a clinical collaboration problem. |
| 2 | Opening dilemma | 1.8 min | Ask the audience what to do when data cannot move. |
| 3 | Five designs | 2.2 min | Establish the design menu before naming FL as the answer. |
| 4 | One FL round | 2.2 min | Explain send, train, update, aggregate without equations. |
| 5 | Rare brain cancer | 2.3 min | Show why federation can unlock multicentre evidence. |
| 6 | Imaging + clinical records | 1.8 min | Connect FL to multimodal clinical prediction. |
| 7 | Hospital A is not Hospital B | 2.3 min | Translate non-IID into clinical language. |
| 8 | Global-average trap | 1.8 min | Make per-site and worst-site reporting memorable. |
| 9 | FL is not automatic privacy | 2.2 min | Separate data locality from privacy guarantees. |
| 10 | Algorithm is the tip | 2.1 min | Move from algorithms to governance and operations. |
| 11 | Should this project use FL? | 2.0 min | Turn caveats into a decision tree. |
| 12 | Audience exercise | 3.0 min | Make participants classify scenarios. |
| 13 | Five questions | 1.8 min | Give the take-home checklist. |
| 14 | Final takeaways | 1.5 min | Repeat the three core messages. |
| 15 | Resources | 0.8 min | Point to the guide, checklist, demo, and references. |
| Buffer | Questions and transitions | 1.2 min | Absorb interruptions and local examples. |

## Core Through-Line

The lecture should feel like one argument:

1. The real problem is multicentre medical collaboration under constraints.
2. FL is one design option, not a default.
3. FL can enable rare-disease and multimodal studies when data cannot move.
4. Heterogeneity, privacy leakage, and governance can still break the project.
5. The best first question is: what collaboration problem are we solving?

## Late-Running Version

Keep slides 1, 2, 3, 4, 5, 7, 9, 11, 13, and 14. Skip optional vertical backup slides. Replace the audience exercise with two quick scenarios: a new multicentre model where data cannot move, and an existing model that only needs external validation.

## Audience Prompts

- Opening: "Which option would you choose first, before we use the word federated?"
- FedAvg slide: "Should the hospital with the most patients always have the most influence?"
- Heterogeneity slide: "Which of these differences could change the clinical meaning of the same variable?"
- Evaluation slide: "Would you deploy a model with a good global AUROC if one hospital is unsafe?"
- Decision slide: "Which branch would your own project fall into today?"

## Claims To Keep Precise

- Say "model updates, not raw records" rather than "nothing leaves the hospital."
- Say "can reduce some data-movement risks" rather than "guarantees privacy."
- Label simulated metrics as illustrative.
- Identify public examples as public educational examples, not local unpublished work.
