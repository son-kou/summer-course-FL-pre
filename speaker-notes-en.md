# Speaker Notes For Mentor Review

This English-only file is generated from `assets/practice/slide-scripts.json`. It mirrors the bilingual rehearsal notes but omits the Chinese script so it can be sent for supervisor review.

## Thirty-Minute Run

| Slide | Topic | Target |
|---:|---|---:|
| 0 | Federated Learning in Medical AI: When Data Cannot Move | 0:40 |
| 1 | You Already Trained Different Models | 2:30 |
| 2 | Why Not Simply Pool the Data? | 1:50 |
| 3 | One Federated-Learning Round | 1:30 |
| 4 | Reveal Your Simulated Hospital | 1:20 |
| 5 | Meet Our Federation | 2:10 |
| 6 | Round 1: Federated Averaging | 2:20 |
| 7 | The Data Are Not IID | 2:10 |
| 8 | FL Classics and the 2026 Frontier | 1:40 |
| 9 | Round 2: Federation Under Stress | 2:00 |
| 10 | Did It Help Every Hospital? | 1:30 |
| 11 | Security: What Moves, What Stays | 1:30 |
| 12 | Medical FL in the Real World | 1:30 |
| 13 | Four Lenses to Borrow, With or Without FL | 2:00 |
| 14 | Explore the Node vs Center Playground | 1:20 |
| 15 | Course Resources | 1:00 |
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
- This is the closing lecture of the two-day course, and it starts from yesterday's exercise.
- The goal is careful clinical AI reasoning that survives even without ever running FL.

### English Script

Today I will talk about federated learning in medical AI from a clinical research perspective. The title is deliberately about data that cannot move, because that is where the method becomes interesting. This is also the closing lecture of the whole two-day course: yesterday you trained agentic MRI segmentation models on a shared dataset, and today asks what happens when the data genuinely cannot be pooled at all. Federation does not replace multicentre science; it is one way to make multicentre science possible under legal, technical, and institutional constraints.

### Transition

Move straight into the callback to yesterday's exercise.

### Delivery And Timing

Target time: **0:40**.

Keep this short and warm. Name the two-day-course callback explicitly so the room connects the dots.

### Skip If Late

Cut the presenter/date line and the image attribution; keep the title and the course-callback sentence.

## Slide 1: You Already Trained Different Models

### Key Points

- Everyone in the room trained a segmentation model on the same dataset yesterday, with different results.
- The opening question is a cold-take prediction poll, asked before any FL vocabulary is introduced.
- One QR scan covers the whole activity — no second scan needed later.

### English Script

Show of hands first — who got a Dice score they were happy with yesterday, and who didn't? Good. Different data exposure, different runs, different models. Now: if I wanted to combine all sixty of your models into one best model, and nobody is allowed to send me their training data, how would you do it? Scan the code and answer honestly — there is no wrong answer yet. This is a genuine cold-take prediction: we ask before naming any mechanism, so your real intuition is on the record.

### Transition

Let's look at what you actually voted for — and then ask why pooling the data, which some of you picked, usually isn't on the table in medicine.

### Delivery And Timing

Target time: **2:30**.

Click "Open Federation Dashboard" ONCE — this creates the session and auto-shows the QR. If Wi-Fi is unreliable, click Populate 60 demo clients instead. Then switch back to this slide: the right-hand panel mirrors the live session automatically and keeps updating in real time, so the dashboard tab does not need to stay in front.

### Skip If Late

Do not wait for 60/60 votes. Proceed once roughly 70-80% have answered, or after about 45-60 seconds.

## Slide 2: Why Not Simply Pool the Data?

### Key Points

- Centralized, local-only, and federated are three points on a design spectrum, not a ranked list.
- Federated learning shares model updates, not raw records, in exchange for new complexity.
- The complete five-design taxonomy (including federated evaluation and analytics) is in backup.

### English Script

A few of you picked 'send everyone's data to one place and retrain' — that's centralized pooling, and it's a completely reasonable answer in a classroom. In medicine, it's usually the option that's off the table first. Pooling gives the strongest statistical control but the highest legal and logistical burden. Staying local is easiest to govern but generalizes worst. Federated learning keeps data local and exchanges model updates instead — which trades data movement for new statistical and systems complexity, not a free lunch.

### Transition

So what does federation actually look like as a mechanism? One round, start to finish.

### Delivery And Timing

Target time: **1:50**.

The right-hand panel is the same live mirror as Slide 1. Ask who voted to pool the data, and what would have to be true institutionally for that to actually work. Before Slide 3, switch to the real dashboard tab once and click Reveal federation map.

### Skip If Late

Show only the three kickers and skip the center statement entirely.

## Slide 3: One Federated-Learning Round

### Key Points

- One round: broadcast, local training with data staying put, updates return, server aggregates.
- Raw patient data never leave the hospital; model information still moves.
- Step 6, aggregation, is where today's live activity and the rest of the lecture both live.

### English Script

This is the mechanism behind the question I just asked you. Train locally, send an update, aggregate, repeat. Watch step six closely — that is exactly where today's activity lives. The global model starts at the server, gets broadcast to hospitals, each hospital trains without its data ever leaving, only the update travels back, the server aggregates, and a new shared model goes out again. The word aggregate is hiding a lot of decisions — decisions you are about to make.

### Transition

Check your phone — still on the welcome screen? Good, hold there one more slide.

### Delivery And Timing

Target time: **1:30**.

Click through the seven fragments one at a time, pointing at the diagram for each step. Do not rush step 6.

### Interaction Notes

- Fragments 1-7 correspond exactly to the diagram: initialize, distribute, local training (data stays), update returns, aggregate, new global model.
- The FedAvg formula is available as a backup slide if a student asks for the exact equation before Round 1.

### Skip If Late

Narrate steps 1, 4, 5, 6, 7 only; click through 2-3 in silence.

## Slide 4: Reveal Your Simulated Hospital

### Key Points

- No new scan needed — everyone already joined during the opening prediction poll.
- The simulation is precomputed and deterministic; it does not pretend a phone trains a real network.
- This slide is mechanical: reveal the card, state the caveat, move on.

### English Script

You are now a federated client. Tap 'Reveal my site.' No new scan needed — you already joined during the prediction question. For teaching, your phone represents a federated client; the local training outcome has been simulated so we can inspect a full federation in a few minutes. Be explicit: this is not sixty phones secretly training a neural network. A real model update has thousands to millions of numbers; what you see is a two-number projection built for visualization.

### Transition

Look at your card for a second, then look up — let's meet the federation as a whole.

### Delivery And Timing

Target time: **1:20**.

Ask one or two students to read their hospital name and one stat aloud. Do not wait for every phone.

### Skip If Late

Skip straight to reading one site card aloud.

## Slide 5: Meet Our Federation

### Key Points

- Node size on the map encodes local sample size; shape and glyphs encode status, never colour alone.
- Trust and influence are deliberately different questions, and the room usually conflates them.
- Freezing enrollment before answering keeps the two questions honest.

### English Script

Freeze enrollment. Look at the map — every dot is one of you, sized by how many patients your hospital has. Would you trust all these hospitals equally? Would you weight all these hospitals equally? These are deliberately different questions. A hospital being small does not make it untrustworthy; it changes how much statistical weight its evidence should carry. Let the second question hang unanswered — Round 1 will answer it for us.

### Transition

Let's answer the weighting question for real. Round 1.

### Delivery And Timing

Target time: **2:10**.

Click Freeze enrollment on the dashboard. Point at 2-3 clearly different node sizes before asking either question.

### Skip If Late

Ask only the trust question aloud; skip straight to Round 1 for the weight question.

## Slide 6: Round 1: Federated Averaging

### Key Points

- F(w) = sum of p_k F_k(w): each hospital's local objective, weighted by its influence p_k.
- Classical FedAvg sets p_k = n_k / sum(n_j) — equal influence per patient, not per hospital.
- The weight bar chart and the vector field must correspond exactly to the formula.

### English Script

Remember your prediction earlier? Run FedAvg now and let's see how close 'weight by how much data it was trained on' actually gets. Watch the arrows on the right: each one is somebody's simulated update. The white arrow is what the server actually keeps. For classical sample-weighted FedAvg, p_k equals n_k over the sum of n_j — every training example counts roughly equally, which means hospitals do not count equally. Watch the largest bar in the weights panel: the largest hospital in this room.

### Transition

Notice something — not everyone's arrow points the same way. Why not?

### Delivery And Timing

Target time: **2:20**.

On the dashboard, Start Round 1, confirm aggregation policy is FedAvg. Point at one large node's thick opaque arrow and one small node's thin faint arrow. Connect back to the opening poll explicitly.

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

Go back to your own site card. Some of your arrows agreed with your neighbours'; some clearly did not. That disagreement has a name: non-IID. Feature shift comes from scanners and protocols; label shift from different prevalence; concept shift when the outcome means something different at another site; workflow shift from referral and annotation practice. Institution is a latent variable, and federation makes that fact much harder to ignore.

### Transition

Before we stress-test the federation, a quick map of where these methods sit — the classics and the frontier.

### Delivery And Timing

Target time: **2:10**.

Ask 2-3 students with visibly different archetypes to read one line from their own site card aloud.

### Skip If Late

Skip the four shift-type cards entirely; keep only the two arrow figures and the center statement.

## Slide 8: FL Classics and the 2026 Frontier

### Key Points

- FedProx, FedBN, SCAFFOLD, and FedOpt are not interchangeable "averaging options".
- FedProx changes the local objective; FedBN and SCAFFOLD target feature shift and client drift differently.
- The full six-area frontier map is in backup; naming mechanisms correctly matters more than naming many.

### English Script

You've now run the one method almost everyone starts with. Two sentences on where the rest of the field sits, because these get misclassified constantly. FedProx changes local optimization, not the aggregation weighting; FedBN and SCAFFOLD address feature shift and client drift through different mechanisms; FedOpt generalizes the server update rule. None of these is simply 'another averaging formula.'

### Transition

Let's put one of these ideas under real pressure. Round 2.

### Delivery And Timing

Target time: **1:40**.

Name the classics list quickly; point to backup for the full frontier grid if asked.

### Skip If Late

Name FedProx, FedBN, and SCAFFOLD only, skip FedOpt and the frontier grid.

## Slide 9: Round 2: Federation Under Stress

### Key Points

- Predict before revealing: what happens to the aggregate when one hospital looks very different?
- Robust aggregation (clipping, coordinate median) bounds an outlier's influence but cannot explain it.
- Pick ONE event as the default live path — running both is a backup option, not the plan.

### English Script

Predict before I click: if I make one hospital's population rare and clinically important, what happens to its voice under FedAvg? Under FedAvg, a small hospital's contribution shrinks toward its sample-size weight regardless of clinical importance. Clipping and coordinate-median bound an extreme update's magnitude, but they do not tell us why it was extreme in the first place.

### Transition

So a global number just changed. Did it change for everyone the same way?

### Delivery And Timing

Target time: **2:00**.

Ask the room to predict out loud, THEN click 'B · Rare hospital' — the stronger default because it connects to the next two slides. Show FedAvg's result, then click one alternative policy to compare in under 30 seconds.

### Interaction Notes

- Event C (suspicious update) is available as an alternative if the room specifically wants a data-integrity discussion instead.

### Skip If Late

Trigger only Event B (rare hospital) and skip the strategy comparison entirely.

## Slide 10: Did It Help Every Hospital?

### Key Points

- The global mean can rise while the rarest or most-shifted hospital falls, at the same time.
- This mirrors what FeTS reports in real distributed multi-site evaluation, not just a classroom effect.
- "The average is not the deployment site."

### English Script

Look back at the evaluation panel: the mean can go up while the rarest or most shifted hospital goes down at the same time. This mirrors what FeTS reports in real distributed multi-site evaluation. A study should predefine minimum acceptable performance at the site and subgroup level, not only global AUROC. The average model does not treat the average hospital.

### Transition

So the model changed. What actually moved to make that happen — and what didn't?

### Delivery And Timing

Target time: **1:30**.

Point at the dashboard's evaluation panel, still visible from the previous slide, and read the numbers aloud.

### Skip If Late

Read only the two boxed statements; skip re-opening the dashboard.

## Slide 11: Security: What Moves, What Stays

### Key Points

- Raw records, identifiers, and local preprocessing stay local; updates, metrics, counts, and logs still move.
- Federated learning changes the privacy problem. It does not delete it.
- The full threat-surface explorer is a resource, not live content.

### English Script

Your phone never sent us a single patient record. It sent a two-number summary of an update — and in a real system, that update itself is an information channel. Gradient leakage, membership inference, poisoning, secure aggregation, and differential privacy each address a different part of the threat surface; none of them is solved simply because raw data stayed put.

### Transition

This is exactly the kind of problem real medical federations are already living with. Let's look at scale.

### Delivery And Timing

Target time: **1:30**.

State the caveat sentence exactly as written. Do not open the full lab live.

### Skip If Late

Read only the callout line and the two-column list.

## Slide 12: Medical FL in the Real World

### Key Points

- Pati et al.: 71 sites, six continents, 6,314 glioblastoma patients trained together at real scale.
- FeTS: 41 models across 32 institutions — average performance hid site-level failure, exactly like the live panel.
- Only 5.2% of 612 reviewed healthcare-FL articles were real-life clinical applications (Teo et al. 2024).

### English Script

Everything you just did with sixty phones has a real analogue at seventy-one hospitals across six continents. Pati and colleagues trained together at that scale on 6,314 glioblastoma patients. FeTS then found exactly what your dashboard just showed: average performance can hide site-level failure. Yet only 32 of 612 reviewed healthcare-FL articles — 5.2 percent — were real-life clinical applications.

### Transition

So what should actually stick with you — not just from FL, but from the whole course?

### Delivery And Timing

Target time: **1:30**.

Keep this tight — three stat cards and one closing line. The governance stack and case detail are backup only.

### Skip If Late

Keep the scale and FeTS stats; drop the Teo et al. evidence-gap statistic first if very short on time.

## Slide 13: Four Lenses to Borrow, With or Without FL

### Key Points

- Bias (who shapes the model) and fairness (who the result fails) are deliberately distinct lenses.
- Security and heterogeneity map directly onto what the room just watched happen live.
- None of the four require ever running federated learning to be useful.

### English Script

Four lenses. You have already watched every one of them happen on your own phone in the last twenty-some minutes — and every one applies even if you never touch FL again. Bias: sample-size weighting gives the biggest contributor the most influence by default; that is a policy choice, and it can silence small, clinically important populations. Security: data staying local is a start, not an ending. Heterogeneity: disagreement is signal, not noise. Fairness: a rising average can hide a falling site. Bias and fairness are deliberately distinct — bias is about who shapes the model, fairness is about who the result then fails.

### Transition

One more thing before questions — a small tool to keep exploring these four lenses on your own.

### Delivery And Timing

Target time: **2:00**.

Ask the audience which of the four would change one of their current projects, federated or not.

### Skip If Late

Read cards 1 and 4 only — they are the pair most often conflated.

## Slide 14: Explore the Node vs Center Playground

### Key Points

- A second, independent QR — not the join code, not the resources QR.
- Three tabs, one or two controls each: Security, Heterogeneity, Fairness.
- No session, no login — explore now or after class, at your own pace.

### English Script

This QR is new — it is not the code you scanned earlier, and it is not the resources QR coming up next. It opens a small playground: three tabs, one or two controls each. The heterogeneity tab reuses the same 2D update-vector idea from Round 1; the fairness tab reuses the same FedAvg weighting and evaluation math from the live activity. Try dragging one hospital's sample size up and watching the rare-population site's performance fall — the fastest way to re-experience today's core lesson alone.

### Transition

Bring your own project to questions, using the same four lenses.

### Delivery And Timing

Target time: **1:20**.

Optionally demonstrate the fairness slider once on the projector, then leave the QR up.

### Skip If Late

Show the QR and name the three tabs only, skip demonstrating a slider live.

## Slide 15: Course Resources

### Key Points

- This is a third, distinct QR — the room has now seen join/predict, playground, and resources.
- FL helps when the clinical question is shared but patient-level data cannot or should not be pooled.
- The transferable habit is to make the collaboration visible.

### English Script

One thing to remember: federation does not remove the multicentre problem; it gives you a way to do it explicitly. This is a third, different QR — the permanent course site, labs, and references. FL helps when the clinical question is shared but patient-level data cannot or should not be pooled; it fails when heterogeneity, privacy, evaluation, and governance are treated as afterthoughts.

### Transition

End and invite questions; use the Q&A backup prompts if discussion needs a seed.

### Delivery And Timing

Target time: **1:00**.

Leave this QR slide up for the whole Q&A period. Name all three QR codes the room has now seen.

### Skip If Late

Show the QR and read only the first closing line.
