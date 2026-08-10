# Speaker Notes For Mentor Review

This English-only file is generated from `assets/practice/slide-scripts.json`. It mirrors the bilingual rehearsal notes but omits the Chinese script so it can be sent for supervisor review.

## Thirty-Minute Run

| Slide | Topic | Target |
|---:|---|---:|
| 0 | Federated Learning in Medical AI: When Data Cannot Move | 1:06 |
| 1 | Four Hospitals, One Question | 1:24 |
| 2 | Five Collaboration Designs | 1:30 |
| 3 | One Federated-Learning Round | 2:00 |
| 4 | Achievement Versus Evidence Gap | 1:48 |
| 5 | Brain Cancer: Scale, Benchmarking, Evaluation | 2:06 |
| 6 | Lesson 1: Treat Heterogeneity as Signal | 1:30 |
| 7 | Interactive MRI Domain-Shift Lab | 1:54 |
| 8 | Shared and Local Models | 1:48 |
| 9 | Lesson 2: Missing Modalities Are Design Inputs | 1:48 |
| 10 | Lesson 3: Privacy is a Systems Property | 1:42 |
| 11 | Lesson 4: Evaluate the Hospital | 1:48 |
| 12 | The Real-World Federation Stack | 1:30 |
| 13 | Research Frontier Map, 2026 | 2:00 |
| 14 | Practical Takeaways for Clinical AI | 1:30 |
| 15 | Q&A | 2:18 |
| 16 | Final Synthesis and Resources | 0:54 |
|  | **Planned spoken content** | **28:36** |
|  | Buffer for questions and transitions | 1:24 |
|  | **Course slot** | **30:00** |

## Rehearsal Through-Line

1. Start from multicentre clinical collaboration under constraints.
2. Treat FL as one design option among several.
3. Use brain cancer to show both scale and the need for distributed evaluation.
4. Make heterogeneity, missing modalities, privacy, site-level evaluation, and governance visible.
5. End with habits clinical PhD students can borrow even without deploying FL.

## Slide-By-Slide English Script

## Slide 0: Federated Learning in Medical AI: When Data Cannot Move

### Key Points

- Federated learning is framed as a multicentre collaboration design.
- The lecture asks when data, models, metrics, or only conclusions should move.
- The goal is careful clinical AI, not algorithm enthusiasm.

### English Script

Today I will talk about federated learning in medical AI from a clinical research perspective. The title is deliberately about data that cannot move, because that is where the method becomes interesting. In many medical questions, the disease, the workflow, and the evidence are multicentre, but patient-level data cannot simply be pooled. Federation does not replace multicentre science. It is one possible way to make multicentre science possible under legal, technical, and institutional constraints. I will keep the algorithmic details light and focus on what clinical PhD students can borrow: how to reason about collaboration design, heterogeneity, privacy, evaluation, and governance.

### Transition

We will turn that framing into a concrete four-hospital dilemma.

### Delivery And Timing

Target time: **1:06**.

Pause after the title. The MRI is visual context, not evidence from a study.

### Skip If Late

Skip the image attribution aloud; keep the framing sentence.

## Slide 1: Four Hospitals, One Question

### Key Points

- The shared clinical question must come before the algorithm.
- Sites differ in population, measurements, labels, workflows, and governance.
- The first design choice is what information is allowed to move.

### English Script

Imagine four hospitals that agree on the clinical question: can we build a useful model for this patient group? But each hospital brings a different constraint. One has a rare outcome and a careful MRI protocol. Another has more data, but a different scanner fleet and workflow. A third has good labels, but the definition changed during the study period. The fourth has missing modalities and stricter governance. This is not yet a machine-learning problem. It is first a collaboration design problem. If we skip that step, we may build a technically impressive model that answers the wrong clinical question or represents only the easiest site.

### Transition

Once the dilemma is visible, the next step is to choose what kind of collaboration is actually being proposed.

### Delivery And Timing

Target time: **1:24**.

Walk through the site cards clockwise. Ask the audience which constraint they recognize from their own work.

### Skip If Late

Read only the central question and one example site.

## Slide 2: Five Collaboration Designs

### Key Points

- Federated learning is one design, not the default answer.
- Pooling, local-only models, federated training, federated evaluation, and federated analytics answer different questions.
- The design should match the clinical task and governance constraints.

### English Script

Before we say federated learning, we should compare the collaboration designs. Centralized pooling gives the strongest statistical control, but it also creates the highest data-movement burden. Local-only models are simple to govern, but they often generalize poorly. Federated learning moves model updates rather than raw patient records. Federated evaluation asks a different question: can a model be tested where the data live? Federated analytics may be enough when we need distributed estimation rather than training. The point is not that one design is morally superior. The point is that the design should match the clinical aim, the data rights, and the evidence we need.

### Transition

From that menu, let us zoom into federated training and ask what really moves in one round.

### Delivery And Timing

Target time: **1:30**.

Point to the diagram first, then use the short labels. Do not read every label twice.

### Interaction Notes

- The five diagrams are a decision vocabulary, not clickable controls. Read them from left to right by asking what unit moves: raw records, separate local models, model updates, finished model, or aggregate statistics.
- Changing the design changes the scientific claim. Pooling maximizes control but moves records; local-only minimizes movement but weakens generalization; FL trains together; federated evaluation tests a model where data live; federated analytics estimates counts or rates before modeling.
- Use this slide to stop premature method choice. The practical question is not “can we do FL?” but “which movement pattern answers the clinical question with the least unnecessary burden?”

### Skip If Late

Keep only centralized, FL, and federated evaluation.

## Slide 3: One Federated-Learning Round

### Key Points

- Raw patient records stay local, but information still moves.
- Aggregation embeds assumptions about site size, quality, and fairness.
- The sandbox is conceptual, not a clinical policy recommendation.

### English Script

A basic federated-learning round is easy to describe. Each hospital receives a model, trains locally, sends back an update, and the coordinator aggregates the updates into the next shared model. The sentence sounds simple, but notice the important qualification: raw patient records stay local, while model information still moves. The aggregation step is also not neutral. If we weight by sample size, the largest site has the loudest voice. If we weight sites equally, we protect smaller sites but may increase variance. If we include quality or fairness signals, we have entered a clinical governance question. Use the sandbox to feel that difference. The numbers are illustrative; this is not a recommended clinical aggregation policy.

### Transition

With the mechanism on the table, we can judge the evidence more carefully: what has been shown, and what is still thin?

### Delivery And Timing

Target time: **2:00**.

Toggle equal-site and fairness weighting. Say explicitly that the lab is conceptual.

### Interaction Notes

- Sample-size weighting: each site weight follows cohort size. The largest hospital becomes visually dominant in the left bars, and the aggregate update moves toward that site’s local update.
- Equal-site weighting: every hospital receives the same voice. Smaller sites become visible, but the aggregate can become noisier if a small site has unstable labels or measurement practice.
- Quality-aware weighting: the quality field can change the left weight bars. Turning on “include quality signal” rewards cleaner local data; turning on “upweight under-represented prevalence” gives more influence to a rare-prevalence site.
- Readouts: “aggregate update” is the weighted result; “largest site weight” shows how concentrated the federation is. If one site owns the aggregate, the federation may be technically distributed but scientifically centralized.
- Teaching point: aggregation is not neutral accounting. It encodes what the collaboration values: size, fairness, data quality, target population, or some negotiated compromise.

### Skip If Late

Skip quality-aware weighting and show only sample-size versus equal-site.

## Slide 4: Achievement Versus Evidence Gap

### Key Points

- Medical FL literature is large and technically active.
- Real-life clinical FL applications are a small fraction of the evidence base.
- This is a reason for rigorous evaluation, not dismissal.

### English Script

The evidence gap is important to state carefully. Federated learning in healthcare is not a tiny literature. Teo and colleagues included 612 healthcare FL articles, with work across 64 regions. But only 32 of those studies, about 5.2 percent, were real-life FL applications in that review. So the message is balanced. The field is large, creative, and moving quickly. At the same time, clinically mature deployment evidence is still limited. That should not make us dismiss FL. It should make us evaluate it like clinical infrastructure: what was simulated, what was implemented, what was externally evaluated, and what would justify local clinical use?

### Transition

The brain-cancer literature is a useful case because it shows both impressive scale and the remaining evaluation problem.

### Delivery And Timing

Target time: **1:48**.

Use the funnel, not the supporting text, as the spoken structure.

### Skip If Late

Omit the 64-region context.

## Slide 5: Brain Cancer: Scale, Benchmarking, Evaluation

### Key Points

- Brain tumor segmentation is a strong rare-disease example.
- The research progression runs from distributed training to benchmarking to external evaluation.
- Average performance can hide site-specific or outlier failures.

### English Script

Brain cancer is one of the strongest examples because the disease is relatively rare, imaging is central, and no single institution sees the whole clinical picture. Pati and colleagues showed large-scale distributed training across 71 sites, six continents, and 6,314 glioblastoma patients. That demonstrates why federation can matter. But the story does not stop at training. MedPerf helped formalize distributed benchmarking, where models can be evaluated without moving test data. The FeTS challenge then pushed the evaluation question further, with many models assessed across distributed institutions. The key clinical lesson is not just that federation can scale. It is that good average performance can coexist with weak performance at particular sites or in outlier cases.

### Transition

That example leads directly to the first lesson: differences between hospitals are not just noise.

### Delivery And Timing

Target time: **2:06**.

Do not imply the public MRI is study data. Point to the progression, not the image.

### Skip If Late

Keep Pati and FeTS; omit MedPerf detail.

## Slide 6: Lesson 1: Treat Heterogeneity as Signal

### Key Points

- Site differences can reflect real clinical and measurement differences.
- Feature, label, concept, and workflow shifts require different responses.
- Institution should be treated as a latent variable.

### English Script

When hospitals disagree statistically, the first question should not be how to average the disagreement away. The first question is what the disagreement means. Feature shift may come from scanners, assays, populations, or timing. Label shift may mean that prevalence or event frequency differs. Concept shift is more serious: the outcome may not mean exactly the same thing across sites or across time. Workflow shift reminds us that referral, annotation, treatment, and documentation practices are part of the data-generating process. This lesson is not specific to federated learning. Any multicentre clinical AI project should treat institution as a latent variable that may explain both model performance and clinical meaning.

### Transition

To make that less abstract, the next lab changes the appearance of the same MRI while the anatomy stays fixed.

### Delivery And Timing

Target time: **1:30**.

Ask which shift type the audience most often sees.

### Skip If Late

Mention only feature shift and concept shift.

## Slide 7: Interactive MRI Domain-Shift Lab

### Key Points

- The same public MRI can appear different under simple display transformations.
- The lab is educational and not scanner physics.
- Appearance changes can pressure thresholds, prevalence assumptions, and calibration.

### English Script

This lab uses one public MRI image and changes only the browser-side appearance. We can adjust intensity, contrast, noise, blur, and a simple bias-field effect. These are educational approximations, not scanner physics and not segmentation ground truth. The point is to make a familiar problem visible: the anatomy has not changed, but the measurement appearance has. If a model or a threshold is sensitive to these differences, then site-level performance and calibration may change. The threshold panel is also illustrative. It reminds us that a domain shift is not only a visual problem; it can change apparent-positive rates, prevalence assumptions, and how confident a model should be.

### Transition

Once site differences are visible, the design question becomes how much should be shared and how much should remain local.

### Delivery And Timing

Target time: **1:54**.

Move contrast or bias field, then click baseline split. Keep the explanation short.

### Interaction Notes

- Intensity changes global brightness. It illustrates scanner gain, reconstruction scaling, or preprocessing differences that can move pixels without changing anatomy.
- Contrast changes separation between tissue intensities. When contrast is altered, boundaries become easier or harder for a model even though the patient is the same.
- Noise and blur change image reliability. Higher noise simulates lower signal-to-noise acquisition; higher blur simulates motion, slice thickness, reconstruction, or protocol differences.
- Bias field adds spatial shading. The same structure becomes bright in one region and dim in another, showing why scanner and preprocessing are clinical variables in imaging AI.
- Compare baseline split reveals that the anatomy is constant while appearance changes. Use it to say: domain shift can look harmless to a human and still change model behavior.
- Threshold panel: decision threshold controls how cautious the classifier is; prevalence shift changes the base rate; label noise makes the observed target less reliable. The apparent-positive rate and calibration pressure change because evaluation depends on population and labels, not only the image.

### Skip If Late

Use reset plus one contrast change only.

## Slide 8: Shared and Local Models

### Key Points

- Personalization is often an honest form of federation.
- The solution spectrum runs from robust global models to local fine-tuning.
- Worst-site performance should shape the choice.

### English Script

If sites differ, a single global model may not be the right endpoint. The solution is a spectrum. At one end, we harmonize definitions and build a robust global model. In the middle, we can use target-aware reweighting or a shared backbone with local calibration. At the local end, we fine-tune or calibrate for a specific hospital, but only if local data are sufficient. This is close to partial pooling in statistics: borrow strength where it is justified, but do not erase local accountability. Use the interactive chart to compare mean performance with worst-site performance. A model that improves the average while harming the weakest site may not be clinically acceptable.

### Transition

But even before personalization, many clinical networks face a simpler problem: the sites do not measure the same modalities.

### Delivery And Timing

Target time: **1:48**.

Move the shared-local slider toward both extremes and point to the worst-site curve.

### Interaction Notes

- Shared-local mix moves the vertical marker on the curve. More shared representation can improve the mean site, but the worst site can fall if local calibration is underpowered.
- Heterogeneity widens the gap between mean-site and worst-site curves. When heterogeneity rises, global success becomes less informative about who is safe to deploy on.
- Local data per site changes whether personalization is credible. With more local data, local adaptation can help; with little local data, it may overfit and create false confidence.
- Teaching point: do not average away the vulnerable site. Personalization is not cosmetic customization; it is an accountability mechanism for local failure.

### Skip If Late

Explain partial pooling without moving all sliders.

## Slide 9: Lesson 2: Missing Modalities Are Design Inputs

### Key Points

- Missing modality is a design input, not cleanup.
- The modality-by-site matrix defines what can be shared.
- Imputation or reconstruction does not remove missing-data bias.

### English Script

Many clinical federations are not neat tables. One hospital may have MRI and EHR, another CT and pathology, another genomics but no imaging. That is not just missing data; it is missing modality. The matrix helps us see what learning problem is actually possible. A common clinical core may be enough for one question. For richer questions, we may need modality-specific branches, partial aggregation, or distillation. But we should be careful with reconstruction and imputation. They may help a model run, and they can support sensitivity analysis, but they do not remove the bias created by who was measured, why they were measured, and what was unavailable.

### Transition

After deciding what can be shared scientifically, we still have to ask what information flows through the system and who can see it.

### Delivery And Timing

Target time: **1:48**.

Toggle one modality off and ask what design remains possible.

### Interaction Notes

- Each tick in the modality matrix means a hospital can contribute that modality. Removing a tick changes the common clinical core and can make complete-case analysis biased or impossible.
- MRI, CT, EHR, pathology, and genomics are not interchangeable columns. Their availability reflects care pathways, referral patterns, cost, infrastructure, and indication bias.
- Design consequence cards translate the ticks into architecture: common-core features, modality-specific encoders, dropout or distillation, and missingness-aware evaluation.
- Teaching point: missingness is not a nuisance to hide after collection. It is an input to the federation design and should be reported as evidence about the clinical network.

### Skip If Late

Keep the matrix and the imputation warning.

## Slide 10: Lesson 3: Privacy is a Systems Property

### Key Points

- Data locality is not a complete privacy guarantee.
- Updates, metrics, counts, logs, and releases can carry information.
- A useful privacy discussion starts with a threat model.

### English Script

A common but dangerous shorthand is to say that federated learning is private because data stay local. Data locality is important, but it is not the whole privacy argument. Model updates may leak information. Per-site metrics or counts can be disclosive. Logs may reveal participation patterns, software versions, or failures. A released model can change the risk again. So the useful question is not, does FL guarantee privacy? The useful question is, what information flows through the system, who can see it, what could they infer, and what defence applies to that threat? The explorer on the right is qualitative on purpose. It asks prompts rather than producing a fake privacy score.

### Transition

The same systems view matters for evaluation, because an average result can hide the hospital where the model fails.

### Delivery And Timing

Target time: **1:42**.

Toggle updates, counts, and model release. Emphasize no fake score.

### Interaction Notes

- Each checkbox reveals another information flow. Model updates, counts, metrics, logs, malicious behavior, and external model release are different privacy surfaces, not one generic “data stay local” promise.
- When a box is ticked, follow the arrows in the diagram and ask who can see the flow, who approves it, how long it is retained, and what suppression or audit rule applies.
- Model updates can leak patient-like features; low counts or subgroup metrics can disclose rare cases; logs can reveal participation or timing; external release creates downstream model-use risk.
- Teaching point: privacy is a system property. The claim “raw records stay local” starts the discussion; it does not finish the privacy argument.

### Skip If Late

Read the local/may-move contrast and move on.

## Slide 11: Lesson 4: Evaluate the Hospital

### Key Points

- The average hospital is not a real deployment site.
- Report global, per-site, worst-site, calibration, uncertainty, and abstention behavior.
- Federated evaluation can keep test data distributed.

### English Script

Evaluation is where the clinical promise either survives or fails. A good global number can hide an unsafe hospital. That is why the protocol should specify more than one average metric. We need global and per-site results, worst-site behavior, subgroup performance, calibration, uncertainty, abstention, and drift. The chart on the right is illustrative, but the pattern is real: as unseen-site shift increases, the weakest site may fall below what we would accept clinically. Federated evaluation is useful here because test data can remain distributed. The key question becomes: would we deploy this model at each hospital, or only in the abstract average hospital?

### Transition

If evaluation, privacy, and heterogeneity sound operational, that is the point: the algorithm is only the visible top layer.

### Delivery And Timing

Target time: **1:48**.

Increase unseen-site shift and point to the worst-site value.

### Interaction Notes

- Unseen-site shift lowers the red unseen-site bar relative to the known sites. It shows how a model can look acceptable on participating hospitals and still be weak on the next hospital.
- Abstention threshold controls how often the system refuses or escalates uncertain cases. Raising it can protect safety but increases handoff burden; lowering it increases coverage but may hide uncertainty.
- The bottom readout links global average, worst site, calibration gap, and abstention. These are not decorative metrics; they are deployment rules that should be pre-specified.
- Teaching point: evaluation should name the hospital-level failure mode. A clinical report needs global performance plus per-site, worst-site, subgroup, calibration, drift, uncertainty, and abstention behavior.

### Skip If Late

Mention worst-site and calibration only.

## Slide 12: The Real-World Federation Stack

### Key Points

- The visible algorithm is only the top layer.
- Clinical, data, infrastructure, and governance layers carry much of the risk.
- A federation is a collaboration before it is an algorithm.

### English Script

The algorithm is the part that fits neatly on a slide: model, optimizer, aggregation, and schedule. But a real federation depends on lower layers. The clinical layer defines intended use, population, labels, and decision workflow. The data layer handles harmonization, missingness, provenance, and quality control. The infrastructure layer covers identity, compute, networking, monitoring, and incident response. The governance layer decides ethics, contracts, roles, authorship, withdrawal, and maintenance. If these layers are weak, a technically elegant federation may still fail. This is why I like the sentence: a federation is a collaboration before it is an algorithm.

### Transition

With that full stack in mind, we can read the 2026 research frontier as a set of practical gaps, not just method names.

### Delivery And Timing

Target time: **1:30**.

Use the four bands as the visual path; do not read every item.

### Skip If Late

Read the final sentence only.

## Slide 13: Research Frontier Map, 2026

### Key Points

- The frontier is six coupled research programs.
- Maturity differs across areas, so preprints and deployments should not be treated the same.
- Clinical relevance comes from matching method maturity to the local research question.

### English Script

By 2026, the interesting questions are no longer only whether federated learning can train a model. The frontier is broader. Personalization asks whose hospital the model should serve. Multimodal FL asks what can be shared when sites have different modalities. Foundation-model work asks whether large models can be adapted efficiently, but clinical translation is still limited. Federated evaluation and analytics ask whether we need training, testing, or estimation. Uncertainty, fairness, robustness, and drift ask who is failed by the average. Infrastructure and governance ask who is responsible when the federation breaks. These areas do not have the same maturity. Some are peer-reviewed methods; some are benchmarks or preprints; some are deployment infrastructure. A clinical PhD should name that maturity level explicitly.

### Transition

The frontier is broad, so let us compress it into takeaways that are useful in a clinical protocol meeting.

### Delivery And Timing

Target time: **2:00**.

Read one mature area and one emerging area. Mention preprints carefully.

### Skip If Late

Use only personalization, multimodal, and governance.

## Slide 14: Practical Takeaways for Clinical AI

### Key Points

- The useful lesson is not “use FL”; it is to make the multicentre study design inspectable.
- Hospital, missingness, privacy flows, personalization, and worst-site behavior are part of the scientific object.
- A clinical AI protocol should define movement, failure, ownership, and evidence before the algorithm becomes the center of attention.

### English Script

So the takeaway is more subtle than “federated learning is good.” The transferable habit is to make the collaboration visible. First, treat FL as a study design, not a model choice: define the clinical question, the target setting, and the movement contract before naming the algorithm. Second, treat hospital as a variable. Scanner, referral, workflow, and label definition encode clinical practice; they are not just nuisance variation. Third, remember that the average is not the deployment site. Worst-site performance, calibration, drift, and abstention are safety endpoints, not supplementary analysis. Fourth, treat missingness as evidence about who is measured and what the model cannot know. Fifth, use personalization as accountability: local adaptation is justified when a shared model hides local risk. Sixth, describe privacy as a chain of flows, with owners and stop rules for updates, metrics, logs, and released models.

### Transition

With those takeaways in mind, let us turn the room into a protocol clinic for a few minutes.

### Delivery And Timing

Target time: **1:30**.

Frame this as insight, not homework. Read the bold idea in each card, then add one sentence on why it changes a protocol or ethics discussion.

### Interaction Notes

- This is a synthesis slide. Ask the audience which card would change their next protocol meeting: movement contract, hospital-as-variable, worst-site endpoint, missingness, personalization, or privacy flow.
- If discussion is quiet, point to card 3 and ask: would your current project still look good if the deployment hospital were the worst site rather than the average site?

### Skip If Late

Read takeaways 1, 3, and 6, then move to Q&A.

## Slide 15: Q&A

### Key Points

- Q&A is organized as a mini protocol clinic: question, movement, evidence, governance.
- The best questions use a concrete project and ask what would change practice.
- The prompt cards keep discussion from drifting into abstract FL enthusiasm.

### English Script

For questions, I want to run this like a small protocol clinic. Bring one real or imagined clinical AI project. We will start with the clinical question, then map what moves, and finally ask what evidence would change care. If the question is about design, we ask whether federated training is needed at all, or whether evaluation, analytics, pooling, or local-only modeling is more honest. If the question is about evidence, we ask who could fail: a hospital, a subgroup, a drift scenario, or a missing modality. If the question is about governance, we ask what must be visible: updates, metrics, logs, released models, and incident response. And before any deployment claim, we ask what should have been pre-defined: worst-site threshold, calibration, abstention, and a stop rule.

### Transition

I will finish by leaving the QR code and the resource page on screen.

### Delivery And Timing

Target time: **2:18**.

Invite one project-specific question first. If nobody starts, ask for a project where data cannot move and route it through the four cards.

### Interaction Notes

- Use the four cards as discussion routing buttons: design choice, failure mode, governance surface, and pre-specified rule.
- For a project-specific question, first map what moves; second identify who could fail; third name who owns visibility and response; fourth define what evidence would stop or change the study.

### Skip If Late

If time has almost run out, ask one seeded question on federated evaluation versus federated training, then go directly to the QR slide.

## Slide 16: Final Synthesis and Resources

### Key Points

- FL helps when the clinical question is shared but data cannot be pooled.
- It fails when heterogeneity, privacy, evaluation, and governance are afterthoughts.
- The transferable habit is to make the collaboration visible.

### English Script

To close, I want to leave three messages. Federated learning helps when the clinical question is shared, but patient-level data cannot or should not be pooled. It fails when heterogeneity, privacy, evaluation, and governance are treated as afterthoughts. And the transferable habit is to make the collaboration visible: what moves, what stays local, who is represented, who is failed by the average, and who is responsible. The QR code links to the slides, interactive labs, reading path, and references. Thank you.

### Transition

End of lesson.

### Delivery And Timing

Target time: **0:54**.

Leave the QR code on screen after Q&A or during the last minute of the session.

### Skip If Late

Read only the three final messages.
