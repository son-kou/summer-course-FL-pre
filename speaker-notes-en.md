# Speaker Notes For Mentor Review

This English-only file is generated from `assets/practice/slide-scripts.json`. It mirrors the bilingual rehearsal notes but omits the Chinese script so it can be sent for supervisor review.

## Thirty-Minute Run

| Slide | Topic | Target |
|---:|---|---:|
| 0 | Federated Learning in Medical AI: When Data Cannot Move | 0:40 |
| 1 | Four Hospitals, One Question | 1:30 |
| 2 | Why Not Simply Pool the Data? | 2:10 |
| 3 | One Federated-Learning Round | 1:40 |
| 4 | You Are Now a Federated Client | 2:20 |
| 5 | Meet Our Federation | 2:30 |
| 6 | Round 1: Federated Averaging | 2:40 |
| 7 | The Data Are Not IID | 2:30 |
| 8 | Round 2: Federation Under Stress | 2:50 |
| 9 | Did It Help Every Hospital? | 1:50 |
| 10 | Privacy: What Moves, What Stays | 1:40 |
| 11 | Medical FL in the Real World | 1:50 |
| 12 | What Should You Remember? | 1:50 |
| 13 | Course Resources | 1:00 |
|  | **Planned spoken content** | **27:00** |
|  | Buffer for questions and transitions | 3:00 |
|  | **Course slot** | **30:00** |

## Rehearsal Through-Line

1. Start from multicentre clinical collaboration under constraints.
2. Treat FL as one design option among several, then show one full round.
3. Turn the room into the federation: join, inspect a synthetic site, decide.
4. Run FedAvg live, then stress it with one heterogeneity or robustness event.
5. Show that a global average can hide local failure, then connect to privacy and real-world evidence.
6. End with four habits clinical PhD students can borrow even without deploying FL.

## Slide-By-Slide English Script

## Slide 0: Federated Learning in Medical AI: When Data Cannot Move

### Key Points

- Federated learning is framed as a multicentre collaboration design, not an algorithm to sell.
- For about twenty minutes in the middle of this lecture, the audience becomes the federation.
- The goal is careful clinical AI reasoning that survives even without ever running FL.

### English Script

Today I will talk about federated learning in medical AI from a clinical research perspective. The title is deliberately about data that cannot move, because that is where the method becomes interesting. Federation does not replace multicentre science; it is one way to make multicentre science possible under legal, technical, and institutional constraints. This time the lecture is different: for about twenty minutes you will not just watch a federation, you will be one client inside it, on your own phone.

### Transition

We will turn that framing into a concrete four-hospital dilemma.

### Delivery And Timing

Target time: **0:40**.

Keep this short and warm. State the interactive twist explicitly so the room is primed to have phones ready later.

### Skip If Late

Cut the presenter/date line and the image attribution; keep the title and the one interactive-twist sentence.

## Slide 1: Four Hospitals, One Question

### Key Points

- Four fictional hospitals agree on the clinical question but differ in what can leave the building.
- The hard part is choosing the collaboration design before choosing the algorithm.
- In a few minutes, everyone gets their own version of one of these hospitals.

### English Script

Imagine four hospitals that agree on the clinical question but disagree, for legitimate reasons, on what can leave the building. Aarhus has a rare outcome and a small cohort; Copenhagen has a large cohort on different scanners; Odense changed its outcome definition mid-study; Aalborg has a rural referral mix and missing modalities. None of this is about real AU or Cercare projects — it is a teaching scenario. The question that matters is which part should move: patients, data, models, metrics, or only conclusions. Hold that question, because in a few minutes you will each be assigned a hospital like one of these.

### Transition

So let's name the menu of collaboration designs before picking one.

### Delivery And Timing

Target time: **1:30**.

Ask for a show of hands on who has worked with data that could not leave its institution before reading the cards.

### Skip If Late

Read only the question band; skip narrating all four site cards individually.

## Slide 2: Why Not Simply Pool the Data?

### Key Points

- Centralized, local-only, and federated are three points on a design spectrum, not a ranked list.
- Federated learning shares model updates, not raw records, in exchange for new complexity.
- The complete five-design taxonomy (including federated evaluation and analytics) is in backup.

### English Script

Before touching any algorithm, a study has to decide what actually moves. Pooling all data centrally gives the strongest statistical control but the highest legal and logistical burden. Staying local is the easiest to govern but generalizes worst. Federated learning keeps data local and exchanges model updates instead — which sounds like a free lunch, but is not: it trades data movement for new statistical and systems complexity. Federated learning is one collaboration design among several, chosen for a reason, not by default.

### Transition

So what does federation actually look like as a mechanism? One round, start to finish.

### Delivery And Timing

Target time: **2:10**.

Keep the three-way comparison crisp; do not read the backup five-design diagram unless directly asked.

### Skip If Late

Show only the three kickers and skip the center statement entirely.

## Slide 3: One Federated-Learning Round

### Key Points

- One round: broadcast, local training with data staying put, updates return, server aggregates.
- Raw patient data never leave the hospital; model information still moves.
- Step 6, aggregation, is where today's live activity and the rest of the lecture both live.

### English Script

Train locally, send an update, aggregate, repeat. Watch step six closely, because that is exactly where today's activity lives. The global model starts at the server, gets broadcast to hospitals, each hospital trains without its data ever leaving, only the update travels back, the server aggregates those updates, and a new shared model goes out again. The mechanics here trace back to McMahan and colleagues' original FedAvg paper. Notice that the sentence sounds simple, but the word aggregate is hiding a lot of decisions — decisions you are about to make yourselves.

### Transition

So let's stop watching a diagram of a federation and become one. Everyone, phones out.

### Delivery And Timing

Target time: **1:40**.

Click through the seven fragments one at a time, pointing at the diagram for each step. Do not rush step 6.

### Interaction Notes

- Fragments 1-7 correspond exactly to the diagram: initialize, distribute, local training (data stays), update returns, aggregate, new global model.
- The FedAvg formula is available as a backup slide if a student asks for the exact equation before Round 1.

### Skip If Late

Narrate steps 1, 4, 5, 6, 7 only; click through 2-3 in silence.

## Slide 4: You Are Now a Federated Client

### Key Points

- No login, no name, no email — a session code is enough to join as one simulated hospital.
- The simulation is precomputed and deterministic; it does not pretend 60 phones train a real network.
- Do not wait for 100% joined — proceed at roughly 70-80% or after about 90 seconds.

### English Script

You are now a federated client. Scan the code on the main screen — no login, no name, about thirty seconds. For teaching, your phone represents a federated client; the local training outcome has been simulated so we can inspect a full federation in a few minutes. Be explicit here: this is not sixty phones secretly training a neural network. A real model update has thousands to millions of numbers; what you will see is a two-number, two-dimensional projection built for visualization. Do not wait for everyone — once most of the room has joined, we move on.

### Transition

While you're scanning, here is exactly what your phone is about to show you.

### Delivery And Timing

Target time: **2:20**.

Switch the projector to the Federation Dashboard, create/reset a session, click Show JOIN QR. If Wi-Fi is unreliable, click Populate 60 demo clients immediately instead and keep teaching — the resulting federation looks identical either way.

### Skip If Late

Do not wait for 60/60. Proceed once roughly 70-80% have joined, or after about 90 seconds, whichever comes first.

## Slide 5: Meet Our Federation

### Key Points

- Node size on the map encodes local sample size; shape and glyphs encode status, never colour alone.
- Trust and influence are deliberately different questions, and the room usually conflates them.
- Freezing enrollment before answering keeps the two questions honest.

### English Script

Freeze enrollment. Look at the map — every dot is one of you, sized by how many patients your hospital has. Would you trust all these hospitals equally? Would you weight all these hospitals equally? These are deliberately different questions. A hospital being small does not make it untrustworthy; it changes how much statistical weight its evidence should carry, which is a separate judgement entirely. Let the second question hang unanswered — Round 1 will answer it for us, whether we like the answer or not.

### Transition

Let's answer the weighting question for real. Round 1.

### Delivery And Timing

Target time: **2:30**.

Click Freeze enrollment on the dashboard. Point at 2-3 clearly different node sizes on the projector before asking either question.

### Skip If Late

Ask only the trust question aloud; skip straight to Round 1 for the weight question.

## Slide 6: Round 1: Federated Averaging

### Key Points

- F(w) = sum of p_k F_k(w): each hospital's local objective, weighted by its influence p_k.
- Classical FedAvg sets p_k = n_k / sum(n_j) — equal influence per patient, not per hospital.
- The weight bar chart and the vector field must correspond exactly to the formula.

### English Script

Run FedAvg. Watch the arrows on the right: each one is somebody's simulated update. The white arrow is what the server actually keeps. F sub k of w is what hospital k wants the model to optimize locally; p sub k is how much influence that hospital receives. For classical sample-weighted FedAvg, p_k equals n_k over the sum of n_j — so every training example counts roughly equally, which means hospitals do not count equally. That is not purely a fairness decision; it is also a statistical and optimization choice. Watch the largest bar in the weights panel: that is the largest hospital in this room.

### Transition

Notice something — not everyone's arrow points the same way. Why not?

### Delivery And Timing

Target time: **2:40**.

On the dashboard, Start Round 1, confirm aggregation policy is FedAvg. Point at one large node's thick opaque arrow and one small node's thin faint arrow.

### Interaction Notes

- The formula panel and the weights bar chart on the dashboard update together — the largest bar is exactly p_k for the largest n_k in the room.
- Arrow opacity is scaled by weight, so a large hospital's arrow is visibly bolder than a small hospital's.

### Skip If Late

Show the resultant white arrow and the largest-weight number only; skip deriving the formula symbol-by-symbol.

## Slide 7: The Data Are Not IID

### Key Points

- Some client arrows agreed with their neighbours; some clearly did not — that disagreement is non-IID.
- Feature, label, concept, and workflow shift are four concrete ways institutions differ.
- See the arrows disagree first, then attach the vocabulary — not the other way around.

### English Script

Go back to your own site card. Some of your arrows agreed with your neighbours'; some clearly did not. That disagreement has a name: non-IID. Feature shift comes from scanners and protocols; label shift from different prevalence; concept shift when the outcome means something different at another site; workflow shift from referral and annotation practice. Zech and colleagues showed exactly this kind of site-level generalization failure in chest radiograph models. Institution is a latent variable, and federation makes that fact much harder to ignore.

### Transition

Now let's stress the federation on purpose and see what happens to these disagreements.

### Delivery And Timing

Target time: **2:30**.

Ask 2-3 students with visibly different archetypes to read one line from their own site card aloud before naming the four shift types.

### Interaction Notes

- Optional: show ONE short element from the MRI domain-shift lab (e.g. one contrast slider move) if time allows — do not run the entire lab live; the full lab is in resources.

### Skip If Late

Skip the four shift-type cards entirely; keep only the two arrow figures and the center statement.

## Slide 8: Round 2: Federation Under Stress

### Key Points

- Predict before revealing: what happens to the aggregate when one hospital looks very different?
- Robust aggregation (clipping, coordinate median) bounds an outlier's influence but cannot explain it.
- Label error, preprocessing error, domain shift, corrupted training, and a malicious client all look alike from the server's side.

### English Script

Predict before I click: if I make one hospital's population rare and clinically important, what happens to its voice under FedAvg? Under FedAvg, a small hospital's contribution shrinks toward its sample-size weight regardless of clinical importance. Now the second event: one extreme, unexplained update appears. It could be a label error, a preprocessing error, domain shift, corrupted training, or a malicious client — from the server's side these look observationally similar. Clipping and coordinate-median bound the update's magnitude, but they do not tell us which of those five stories is true.

### Transition

So a global number just changed. Did it change for everyone the same way?

### Delivery And Timing

Target time: **2:50**.

Ask the room to predict out loud, THEN click the event button. Show FedAvg's result, then click one alternative aggregation policy to compare. Do not reveal which real cause the suspicious update represents.

### Interaction Notes

- Event B (rare hospital) and Event C (suspicious update) are independent — running both is the full version; running one is the skip-if-late version.
- When comparing strategies, only change one variable at a time: same event, different aggregation policy.

### Skip If Late

Trigger only ONE event (prefer the rare hospital) and skip the strategy comparison entirely.

## Slide 9: Did It Help Every Hospital?

### Key Points

- The global mean can rise while the rarest or most-shifted hospital falls, at the same time.
- This mirrors what FeTS reports in real distributed multi-site evaluation, not just a classroom effect.
- "The average is not the deployment site."

### English Script

Look back at the evaluation panel: the mean can go up while the rarest or most shifted hospital goes down at the same time. This mirrors what FeTS reports in real distributed multi-site evaluation — average performance can hide institutional outlier weaknesses; our synthetic panel is a teaching projection of that same finding, not a claim about a specific method. A study should predefine minimum acceptable performance at the site and subgroup level, not only global AUROC. The average model does not treat the average hospital.

### Transition

So the model changed. What actually moved to make that happen — and what didn't?

### Delivery And Timing

Target time: **1:50**.

Point at the dashboard's evaluation panel, still visible from the previous slide, and read the mean and worst-site numbers aloud.

### Skip If Late

Read only the two boxed statements; skip re-opening the dashboard.

## Slide 10: Privacy: What Moves, What Stays

### Key Points

- Raw records, identifiers, and local preprocessing stay local; updates, metrics, counts, and logs still move.
- Federated learning changes the privacy problem. It does not delete it.
- The full threat-surface explorer (leakage, inference, poisoning, secure aggregation, DP) is a resource, not live content.

### English Script

Your phone never sent us a single patient record. It sent a two-number summary of an update — and in a real system, that update itself is an information channel. Gradient leakage, membership inference, poisoning, secure aggregation, and differential privacy each address a different part of the threat surface; none of them is solved simply because raw data stayed put. Ask for a threat model in plain language: who can see what, what could they infer, and who responds if the assumption breaks.

### Transition

This is exactly the kind of problem real medical federations are already living with. Let's look at scale.

### Delivery And Timing

Target time: **1:40**.

State the caveat sentence exactly as written — it is the single most important sentence in this section. Do not open the full lab live.

### Skip If Late

Read only the callout line and the two-column list; skip pointing to the full explorer link.

## Slide 11: Medical FL in the Real World

### Key Points

- Pati et al.: 71 sites, six continents, 6,314 glioblastoma patients trained together at real scale.
- FeTS: 41 models across 32 institutions — average performance hid site-level failure, exactly like the live panel.
- Only 5.2% of 612 reviewed healthcare-FL articles were real-life clinical applications (Teo et al. 2024).

### English Script

Everything you just did with sixty phones has a real analogue at seventy-one hospitals across six continents. Pati and colleagues trained together at that scale on 6,314 glioblastoma patients. FeTS then evaluated 41 models across 32 institutions and found exactly what your dashboard just showed: average performance can hide site-level failure. And yet Teo and colleagues found that of 612 reviewed healthcare-FL articles, only 32 — 5.2 percent — were real-life clinical applications. Everything you just simulated becomes harder in real hospitals: more heterogeneity, more governance, less control.

### Transition

So what should actually stick with you from the last twenty minutes?

### Delivery And Timing

Target time: **1:50**.

Keep this tight — three stat cards and one closing line. The frontier map and governance stack are backup only.

### Skip If Late

Keep the scale and FeTS stats; drop the Teo et al. evidence-gap statistic first if very short on time.

## Slide 12: What Should You Remember?

### Key Points

- Data stay local, but information — updates, metrics, released models — still moves.
- Non-IID hospital data, aggregation-as-assumption, and worst-site failure are not edge cases; they are the norm.
- For medical AI specifically: heterogeneity, privacy, evaluation, governance.

### English Script

Four things to keep, and you have already seen every one of them happen on your own phone in the last twenty minutes. Data stay local; information does not. A federation optimizes across different local worlds — non-IID is not a bug in the room, it is the room. Aggregation embeds assumptions about influence; sample-size weighting is a choice, not a neutral default. And global performance can hide local failure — the average is not the deployment site. For medical AI specifically, add heterogeneity, privacy, evaluation, and governance as a second layer.

### Transition

One more thing before you go — how to keep exploring this after class.

### Delivery And Timing

Target time: **1:50**.

Ask the audience which of the four would change one of their current projects before moving to resources.

### Skip If Late

Read cards 3 and 4 only — they are the ones most often missed — and skip the second-layer line.

## Slide 13: Course Resources

### Key Points

- This QR is the permanent course-resources code — deliberately different from the federation join code.
- FL helps when the clinical question is shared but patient-level data cannot or should not be pooled.
- The transferable habit is to make the collaboration visible.

### English Script

One thing to remember: federation does not remove the multicentre problem; it gives you a way to do it explicitly. This QR is different from the one you scanned earlier — it goes to the permanent course site, labs, and references, not to a live session. FL helps when the clinical question is shared but patient-level data cannot or should not be pooled; it fails when heterogeneity, privacy, evaluation, and governance are treated as afterthoughts.

### Transition

End and invite questions; use the Q&A backup prompts if discussion needs a seed.

### Delivery And Timing

Target time: **1:00**.

Leave this QR slide up for the whole Q&A period. Explicitly say this is the resources QR, not the federation join code, once.

### Skip If Late

Show the QR and read only the first closing line; skip the second and third.
