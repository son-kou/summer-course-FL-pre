# Speaker Notes And Timing

This file is generated from `assets/practice/slide-scripts.json`. The live deck also has an optional bilingual rehearsal drawer at `index.html?practice=1`.

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

## Slide-By-Slide Bilingual Script

## Slide 0: Federated Learning in Medical AI: When Data Cannot Move

### Key Points

- Federated learning is framed as a multicentre collaboration design.
- The lecture asks when data, models, metrics, or only conclusions should move.
- The goal is careful clinical AI, not algorithm enthusiasm.

### 中文要点

- 本讲把联邦学习放在多中心临床合作的语境中，而不是只讲算法。
- 核心问题是谁可以移动：数据、模型、指标，还是只有结论。
- 目标是更严谨的临床 AI 研究，而不是宣传某一种技术。

### English Script

Today I will talk about federated learning in medical AI from a clinical research perspective. The title is deliberately about data that cannot move, because that is where the method becomes interesting. In many medical questions, the disease, the workflow, and the evidence are multicentre, but patient-level data cannot simply be pooled. Federation does not replace multicentre science. It is one possible way to make multicentre science possible under legal, technical, and institutional constraints. I will keep the algorithmic details light and focus on what clinical PhD students can borrow: how to reason about collaboration design, heterogeneity, privacy, evaluation, and governance.

### 中文讲稿

<div lang="zh-Hans">

今天我会从临床研究的角度介绍医学 AI 中的联邦学习。题目强调“数据不能移动”，因为这正是联邦学习变得有意义的地方。很多医学问题本来就是多中心的：疾病分布、工作流和证据都跨机构存在，但患者级数据往往不能简单集中。联邦学习并不能替代多中心科学，它只是让多中心科学在法律、技术和机构限制下仍然可能的一种方式。本讲不会深入算法细节，而是强调临床博士可以借鉴的研究习惯：如何设计合作、理解异质性、处理隐私、做评估和治理。

</div>

### Transition

**EN:** We will turn that framing into a concrete four-hospital dilemma.

**中文:** 接下来把这个框架放进一个四家医院的具体困境。

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

### 中文要点

- 共同临床问题必须先于算法选择。
- 机构之间在患者、测量、标签、工作流和治理上都有差异。
- 第一步是明确什么信息可以移动。

### English Script

Imagine four hospitals that agree on the clinical question: can we build a useful model for this patient group? But each hospital brings a different constraint. One has a rare outcome and a careful MRI protocol. Another has more data, but a different scanner fleet and workflow. A third has good labels, but the definition changed during the study period. The fourth has missing modalities and stricter governance. This is not yet a machine-learning problem. It is first a collaboration design problem. If we skip that step, we may build a technically impressive model that answers the wrong clinical question or represents only the easiest site.

### 中文讲稿

<div lang="zh-Hans">

设想四家医院都同意研究同一个临床问题：能否为这类患者建立一个有用的模型？但每家医院都有不同限制。有的医院结局罕见、MRI 协议很严格；有的医院数据量更大，但扫描设备和流程不同；有的医院标签质量好，但研究期间定义发生过变化；还有的医院缺少某些模态，同时治理要求更严格。这时问题还不是“用哪个机器学习算法”，而是“如何设计合作”。如果跳过这一步，可能会得到一个技术上漂亮、但临床上回答错误问题的模型。

</div>

### Transition

**EN:** Once the dilemma is visible, the next step is to choose what kind of collaboration is actually being proposed.

**中文:** 当困境变得具体后，下一步是选择到底要设计哪一种合作。

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

### 中文要点

- 联邦学习只是设计选项之一，不是默认答案。
- 集中数据、本地模型、联邦训练、联邦评估和联邦分析解决的问题不同。
- 设计必须与临床任务和治理限制匹配。

### English Script

Before we say federated learning, we should compare the collaboration designs. Centralized pooling gives the strongest statistical control, but it also creates the highest data-movement burden. Local-only models are simple to govern, but they often generalize poorly. Federated learning moves model updates rather than raw patient records. Federated evaluation asks a different question: can a model be tested where the data live? Federated analytics may be enough when we need distributed estimation rather than training. The point is not that one design is morally superior. The point is that the design should match the clinical aim, the data rights, and the evidence we need.

### 中文讲稿

<div lang="zh-Hans">

在说“联邦学习”之前，我们应该先比较合作设计。集中数据有最强的统计控制能力，但数据移动的负担也最大。本地模型治理简单，但外部泛化能力往往有限。联邦学习移动的是模型更新，而不是患者原始记录。联邦评估回答的是另一个问题：模型能否在数据所在的地方被测试？有时我们需要的只是分布式估计，这时联邦分析就足够了。重点不是哪一种方案更高级，而是设计必须匹配临床目标、数据权利和所需证据。

</div>

### Transition

**EN:** From that menu, let us zoom into federated training and ask what really moves in one round.

**中文:** 在这些选项里，我们放大看联邦训练，并追问一轮中真正移动的是什么。

### Delivery And Timing

Target time: **1:30**.

Point to the diagram first, then use the short labels. Do not read every label twice.

### Interaction Notes

- This slide has no clickable controls; use it as a design menu. Changing the design changes what moves: raw data, model updates, finished models, test metrics, or only aggregate statistics.
- When a student says "we should use FL", ask which card they mean: training, evaluation, or analytics often answer different clinical questions.

### Skip If Late

Keep only centralized, FL, and federated evaluation.

## Slide 3: One Federated-Learning Round

### Key Points

- Raw patient records stay local, but information still moves.
- Aggregation embeds assumptions about site size, quality, and fairness.
- The sandbox is conceptual, not a clinical policy recommendation.

### 中文要点

- 患者原始数据留在本地，但信息仍然在移动。
- 聚合方式隐含了关于样本量、质量和公平性的假设。
- 右侧工具只是教学概念，不是临床聚合政策建议。

### English Script

A basic federated-learning round is easy to describe. Each hospital receives a model, trains locally, sends back an update, and the coordinator aggregates the updates into the next shared model. The sentence sounds simple, but notice the important qualification: raw patient records stay local, while model information still moves. The aggregation step is also not neutral. If we weight by sample size, the largest site has the loudest voice. If we weight sites equally, we protect smaller sites but may increase variance. If we include quality or fairness signals, we have entered a clinical governance question. Use the sandbox to feel that difference. The numbers are illustrative; this is not a recommended clinical aggregation policy.

### 中文讲稿

<div lang="zh-Hans">

一次基本的联邦学习轮次很好描述：每家医院收到模型，在本地训练，返回更新，然后协调方把这些更新聚合成下一轮共享模型。这个过程听起来很简单，但关键在于：患者原始记录留在本地，可是模型信息仍然发生了移动。聚合也不是中性的。如果按样本量加权，最大中心的声音最大；如果每个中心等权，小中心更受保护，但不确定性可能增加；如果加入质量或公平性信号，就已经进入临床治理问题。右侧沙盒是为了感受这种差异。这里的数值都是示意，不是临床推荐政策。

</div>

### Transition

**EN:** With the mechanism on the table, we can judge the evidence more carefully: what has been shown, and what is still thin?

**中文:** 机制清楚后，我们才能更谨慎地看证据：已经证明了什么，哪些仍然薄弱？

### Delivery And Timing

Target time: **2:00**.

Toggle equal-site and fairness weighting. Say explicitly that the lab is conceptual.

### Interaction Notes

- Click Sample-size to make the largest cohort dominate the aggregate update; the left bars show site weights and the aggregate readout shifts toward the largest site.
- Click Equal site to give each hospital equal voice; smaller sites become visible, but the aggregate may become noisier.
- Click Quality-aware and tick include quality signal to let the quality field affect the weights; tick upweight under-represented prevalence to make the rare-prevalence site matter more.
- After each button or tick, point to two changes: the aggregate update and the largest-site-weight readout.

### Skip If Late

Skip quality-aware weighting and show only sample-size versus equal-site.

## Slide 4: Achievement Versus Evidence Gap

### Key Points

- Medical FL literature is large and technically active.
- Real-life clinical FL applications are a small fraction of the evidence base.
- This is a reason for rigorous evaluation, not dismissal.

### 中文要点

- 医学联邦学习文献数量很大，技术发展也很活跃。
- 真正的现实临床应用只占很小一部分。
- 这不是否定联邦学习的理由，而是要求更严格评估的理由。

### English Script

The evidence gap is important to state carefully. Federated learning in healthcare is not a tiny literature. Teo and colleagues included 612 healthcare FL articles, with work across 64 regions. But only 32 of those studies, about 5.2 percent, were real-life FL applications in that review. So the message is balanced. The field is large, creative, and moving quickly. At the same time, clinically mature deployment evidence is still limited. That should not make us dismiss FL. It should make us evaluate it like clinical infrastructure: what was simulated, what was implemented, what was externally evaluated, and what would justify local clinical use?

### 中文讲稿

<div lang="zh-Hans">

这里需要非常准确地表达证据差距。医学联邦学习并不是一个很小的文献领域。Teo 等人的综述纳入了 612 篇医疗 FL 文章，覆盖 64 个地区。但在这项综述中，真正属于现实 FL 应用的只有 32 项，大约 5.2%。所以结论必须平衡：这个领域规模很大、技术很活跃、发展很快；但临床成熟部署的证据仍然有限。这不是否定 FL 的理由，而是提醒我们要像评估临床基础设施一样评估它：哪些只是模拟，哪些真正实施，哪些做过外部评估，什么证据足以支持本地使用。

</div>

### Transition

**EN:** The brain-cancer literature is a useful case because it shows both impressive scale and the remaining evaluation problem.

**中文:** 脑肿瘤文献很适合做案例，因为它同时展示了规模潜力和仍未解决的评估问题。

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

### 中文要点

- 脑肿瘤分割是罕见病多中心研究的典型例子。
- 研究进展从分布式训练，到分布式基准，再到外部评估。
- 平均表现好并不代表每个机构都安全。

### English Script

Brain cancer is one of the strongest examples because the disease is relatively rare, imaging is central, and no single institution sees the whole clinical picture. Pati and colleagues showed large-scale distributed training across 71 sites, six continents, and 6,314 glioblastoma patients. That demonstrates why federation can matter. But the story does not stop at training. MedPerf helped formalize distributed benchmarking, where models can be evaluated without moving test data. The FeTS challenge then pushed the evaluation question further, with many models assessed across distributed institutions. The key clinical lesson is not just that federation can scale. It is that good average performance can coexist with weak performance at particular sites or in outlier cases.

### 中文讲稿

<div lang="zh-Hans">

脑肿瘤是一个很有代表性的例子，因为疾病相对罕见，影像是核心数据，而单个机构很难覆盖完整临床图景。Pati 等人的研究展示了跨 71 个中心、六大洲、6314 名胶质母细胞瘤患者的大规模分布式训练，这说明联邦学习为什么可能重要。但故事并不止于训练。MedPerf 推动了分布式基准评估：模型可以在测试数据不移动的情况下接受评估。FeTS 挑战进一步把问题推进到多机构外部评估。最关键的临床教训不是“联邦学习可以扩大规模”这么简单，而是平均表现良好仍然可能掩盖某些机构或异常病例上的失败。

</div>

### Transition

**EN:** That example leads directly to the first lesson: differences between hospitals are not just noise.

**中文:** 这个例子直接引出第一个经验：医院之间的差异不只是噪声。

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

### 中文要点

- 中心差异往往反映真实的临床和测量差异。
- 特征、标签、概念和工作流偏移需要不同处理方式。
- 机构本身应被视为一个潜在变量。

### English Script

When hospitals disagree statistically, the first question should not be how to average the disagreement away. The first question is what the disagreement means. Feature shift may come from scanners, assays, populations, or timing. Label shift may mean that prevalence or event frequency differs. Concept shift is more serious: the outcome may not mean exactly the same thing across sites or across time. Workflow shift reminds us that referral, annotation, treatment, and documentation practices are part of the data-generating process. This lesson is not specific to federated learning. Any multicentre clinical AI project should treat institution as a latent variable that may explain both model performance and clinical meaning.

### 中文讲稿

<div lang="zh-Hans">

当不同医院在统计上不一致时，第一个问题不应该是如何把差异平均掉，而是这些差异到底意味着什么。特征偏移可能来自扫描设备、实验检测、患者群体或时间点。标签偏移可能意味着患病率或事件频率不同。概念偏移更严重：同一个结局在不同中心或不同时间可能并不完全代表同一个临床含义。工作流偏移提醒我们，转诊、标注、治疗和记录方式本身就是数据生成过程的一部分。这个教训并不只属于联邦学习。任何多中心临床 AI 项目都应把机构看作一个潜在变量。

</div>

### Transition

**EN:** To make that less abstract, the next lab changes the appearance of the same MRI while the anatomy stays fixed.

**中文:** 为了让这个概念不那么抽象，下一页实验会在解剖不变的情况下改变同一张 MRI 的外观。

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

### 中文要点

- 同一张公开 MRI 图像在简单显示变换下会呈现不同外观。
- 这个实验用于教学，不代表真实扫描物理。
- 外观变化会影响阈值、患病率假设和校准压力。

### English Script

This lab uses one public MRI image and changes only the browser-side appearance. We can adjust intensity, contrast, noise, blur, and a simple bias-field effect. These are educational approximations, not scanner physics and not segmentation ground truth. The point is to make a familiar problem visible: the anatomy has not changed, but the measurement appearance has. If a model or a threshold is sensitive to these differences, then site-level performance and calibration may change. The threshold panel is also illustrative. It reminds us that a domain shift is not only a visual problem; it can change apparent-positive rates, prevalence assumptions, and how confident a model should be.

### 中文讲稿

<div lang="zh-Hans">

这个实验使用一张公开 MRI 图像，只改变浏览器端的显示外观。我们可以调节强度、对比度、噪声、模糊和一个简单的偏置场效果。这些都是教学近似，不是真实扫描物理，也不是分割真值。重点是把一个常见问题可视化：解剖结构没有改变，但测量外观改变了。如果模型或阈值对这些差异敏感，那么不同中心的表现和校准都可能改变。阈值面板也是示意性的，它提醒我们域偏移不只是视觉问题，还可能改变表观阳性率、患病率假设和模型置信度。

</div>

### Transition

**EN:** Once site differences are visible, the design question becomes how much should be shared and how much should remain local.

**中文:** 当中心差异可见以后，设计问题就变成：应该共享多少，又该保留多少本地特异性？

### Delivery And Timing

Target time: **1:54**.

Move contrast or bias field, then click baseline split. Keep the explanation short.

### Interaction Notes

- Intensity brightens or darkens the image; contrast expands or compresses tissue separation; noise adds grain; blur removes edge detail; bias field adds a smooth intensity gradient.
- The compare-baseline tick splits the current appearance against the reset image, helping the audience see that anatomy is unchanged while appearance moves.
- Decision threshold changes the apparent-positive rate; prevalence shift changes the simulated site context; label noise makes the output less trustworthy.
- Use Reset before leaving the slide so the next viewer starts from a clean state.

### Skip If Late

Use reset plus one contrast change only.

## Slide 8: Shared and Local Models

### Key Points

- Personalization is often an honest form of federation.
- The solution spectrum runs from robust global models to local fine-tuning.
- Worst-site performance should shape the choice.

### 中文要点

- 个性化模型往往是更诚实的联邦学习形式。
- 方案光谱从稳健全局模型到本地微调。
- 最差中心表现应影响模型选择。

### English Script

If sites differ, a single global model may not be the right endpoint. The solution is a spectrum. At one end, we harmonize definitions and build a robust global model. In the middle, we can use target-aware reweighting or a shared backbone with local calibration. At the local end, we fine-tune or calibrate for a specific hospital, but only if local data are sufficient. This is close to partial pooling in statistics: borrow strength where it is justified, but do not erase local accountability. Use the interactive chart to compare mean performance with worst-site performance. A model that improves the average while harming the weakest site may not be clinically acceptable.

### 中文讲稿

<div lang="zh-Hans">

如果中心之间存在差异，一个单一全局模型未必是最合适的终点。解决方案其实是一条光谱。一端是统一定义并训练稳健的全局模型；中间可以做目标中心重加权，或共享主干加本地校准；另一端是针对特定医院微调或校准，但前提是本地数据足够。这和统计学中的部分池化很接近：在合理的地方借力，但不能抹掉本地责任。右侧图用于比较平均表现和最差中心表现。如果一个模型提升了平均值，却损害了最弱中心，它可能并不具备临床可接受性。

</div>

### Transition

**EN:** But even before personalization, many clinical networks face a simpler problem: the sites do not measure the same modalities.

**中文:** 但在谈个性化之前，很多临床网络还有一个更基础的问题：不同中心测量的模态并不相同。

### Delivery And Timing

Target time: **1:48**.

Move the shared-local slider toward both extremes and point to the worst-site curve.

### Interaction Notes

- Shared-local mix moves between local-only, partial pooling, and shared-only assumptions; the curve changes because borrowing strength and local accountability trade off.
- Heterogeneity widens the gap between mean-site and worst-site performance; local data per site makes local calibration more or less plausible.
- Point to the worst-site readout, not only the mean-site readout. The clinical question is whether the weakest site is still acceptable.

### Skip If Late

Explain partial pooling without moving all sliders.

## Slide 9: Lesson 2: Missing Modalities Are Design Inputs

### Key Points

- Missing modality is a design input, not cleanup.
- The modality-by-site matrix defines what can be shared.
- Imputation or reconstruction does not remove missing-data bias.

### 中文要点

- 缺失模态是研究设计输入，而不是后期清理问题。
- 模态-中心矩阵决定了什么可以共享。
- 插补或重建并不能消除缺失数据偏倚。

### English Script

Many clinical federations are not neat tables. One hospital may have MRI and EHR, another CT and pathology, another genomics but no imaging. That is not just missing data; it is missing modality. The matrix helps us see what learning problem is actually possible. A common clinical core may be enough for one question. For richer questions, we may need modality-specific branches, partial aggregation, or distillation. But we should be careful with reconstruction and imputation. They may help a model run, and they can support sensitivity analysis, but they do not remove the bias created by who was measured, why they were measured, and what was unavailable.

### 中文讲稿

<div lang="zh-Hans">

很多临床联邦并不是整齐的数据表。有的医院有 MRI 和 EHR，有的有 CT 和病理，有的有基因组数据却没有影像。这不仅是普通缺失值，而是缺失模态。这个矩阵帮助我们看清实际能够学习的问题是什么。对于某些问题，一个共同临床核心就足够；对于更复杂的问题，可能需要模态特异分支、部分聚合或蒸馏。但对重建和插补要谨慎。它们可以帮助模型运行，也可以用于敏感性分析，但不能消除“谁被测量、为什么被测量、什么不可用”所带来的偏倚。

</div>

### Transition

**EN:** After deciding what can be shared scientifically, we still have to ask what information flows through the system and who can see it.

**中文:** 在科学上决定什么可以共享之后，我们还必须问系统里流动了哪些信息，以及谁能看到。

### Delivery And Timing

Target time: **1:48**.

Toggle one modality off and ask what design remains possible.

### Interaction Notes

- Each matrix tick means that a modality exists at a hospital. Removing a tick changes what can be treated as common clinical core.
- Sparse modality rows push the design toward modality-specific encoders, partial aggregation, distillation, or missingness-aware evaluation.
- Use one deliberate toggle only; the message is that missingness is a design input, not a cleanup step.

### Skip If Late

Keep the matrix and the imputation warning.

## Slide 10: Lesson 3: Privacy is a Systems Property

### Key Points

- Data locality is not a complete privacy guarantee.
- Updates, metrics, counts, logs, and releases can carry information.
- A useful privacy discussion starts with a threat model.

### 中文要点

- 数据留在本地并不等于完整隐私保证。
- 更新、指标、计数、日志和模型发布都可能携带信息。
- 有效的隐私讨论应从威胁模型开始。

### English Script

A common but dangerous shorthand is to say that federated learning is private because data stay local. Data locality is important, but it is not the whole privacy argument. Model updates may leak information. Per-site metrics or counts can be disclosive. Logs may reveal participation patterns, software versions, or failures. A released model can change the risk again. So the useful question is not, does FL guarantee privacy? The useful question is, what information flows through the system, who can see it, what could they infer, and what defence applies to that threat? The explorer on the right is qualitative on purpose. It asks prompts rather than producing a fake privacy score.

### 中文讲稿

<div lang="zh-Hans">

一个常见但危险的简化说法是：因为数据留在本地，所以联邦学习是隐私安全的。数据本地化当然重要，但它不是完整的隐私论证。模型更新可能泄露信息；中心级指标或计数可能暴露敏感细胞；日志可能透露参与模式、软件版本或失败信息；模型发布后风险也会改变。所以真正有用的问题不是“FL 是否保证隐私”，而是系统中哪些信息在流动，谁能看到，能推断出什么，以及哪些防御对应哪种威胁。右侧工具刻意不给假分数，而是提出定性问题。

</div>

### Transition

**EN:** The same systems view matters for evaluation, because an average result can hide the hospital where the model fails.

**中文:** 同样的系统视角也适用于评估，因为平均结果可能掩盖模型失败的那家医院。

### Delivery And Timing

Target time: **1:42**.

Toggle updates, counts, and model release. Emphasize no fake score.

### Interaction Notes

- Model updates visible turns gradients or parameters into an information channel; counts and metrics visible adds small-cell and per-site disclosure risk.
- Orchestration logs retained adds operational metadata; participant can be malicious introduces poisoning or inference by a participating site.
- Model released externally changes downstream risk after training. The diagram and prompts change qualitatively; do not present the lab as a privacy score.

### Skip If Late

Read the local/may-move contrast and move on.

## Slide 11: Lesson 4: Evaluate the Hospital

### Key Points

- The average hospital is not a real deployment site.
- Report global, per-site, worst-site, calibration, uncertainty, and abstention behavior.
- Federated evaluation can keep test data distributed.

### 中文要点

- “平均医院”并不是真实部署地点。
- 需要报告全局、分中心、最差中心、校准、不确定性和拒绝预测行为。
- 联邦评估可以让测试数据继续分布在本地。

### English Script

Evaluation is where the clinical promise either survives or fails. A good global number can hide an unsafe hospital. That is why the protocol should specify more than one average metric. We need global and per-site results, worst-site behavior, subgroup performance, calibration, uncertainty, abstention, and drift. The chart on the right is illustrative, but the pattern is real: as unseen-site shift increases, the weakest site may fall below what we would accept clinically. Federated evaluation is useful here because test data can remain distributed. The key question becomes: would we deploy this model at each hospital, or only in the abstract average hospital?

### 中文讲稿

<div lang="zh-Hans">

评估是临床承诺能否成立的关键环节。一个漂亮的全局指标可能掩盖某家医院的不安全表现。因此研究方案不能只规定一个平均指标。我们需要全局和分中心结果、最差中心表现、亚组表现、校准、不确定性、拒绝预测和漂移。右侧图是示意性的，但模式很真实：当未见中心偏移增大时，最弱中心可能低于临床可接受阈值。联邦评估在这里很有用，因为测试数据仍可留在本地。核心问题是：这个模型能否在每家医院部署，而不只是服务于抽象的平均医院？

</div>

### Transition

**EN:** If evaluation, privacy, and heterogeneity sound operational, that is the point: the algorithm is only the visible top layer.

**中文:** 如果评估、隐私和异质性听起来像运营问题，这正是重点：算法只是最可见的顶层。

### Delivery And Timing

Target time: **1:48**.

Increase unseen-site shift and point to the worst-site value.

### Interaction Notes

- Increase unseen-site shift to show the weakest hospital separating from the average.
- Move abstention to show a safety/coverage trade-off: deferring uncertain cases may improve risk control but leaves fewer automated decisions.
- Use calibration or subgroup controls if time allows; the audience should leave with the rule that global performance is never the whole evaluation.

### Skip If Late

Mention worst-site and calibration only.

## Slide 12: The Real-World Federation Stack

### Key Points

- The visible algorithm is only the top layer.
- Clinical, data, infrastructure, and governance layers carry much of the risk.
- A federation is a collaboration before it is an algorithm.

### 中文要点

- 可见的算法只是最上层。
- 临床、数据、基础设施和治理层承担了大部分风险。
- 联邦首先是合作，然后才是算法。

### English Script

The algorithm is the part that fits neatly on a slide: model, optimizer, aggregation, and schedule. But a real federation depends on lower layers. The clinical layer defines intended use, population, labels, and decision workflow. The data layer handles harmonization, missingness, provenance, and quality control. The infrastructure layer covers identity, compute, networking, monitoring, and incident response. The governance layer decides ethics, contracts, roles, authorship, withdrawal, and maintenance. If these layers are weak, a technically elegant federation may still fail. This is why I like the sentence: a federation is a collaboration before it is an algorithm.

### 中文讲稿

<div lang="zh-Hans">

算法是最容易放在幻灯片上的部分：模型、优化器、聚合方式和通信计划。但真正的联邦依赖下面几层。临床层定义预期用途、目标人群、标签和决策工作流；数据层处理统一、缺失、来源和质量控制；基础设施层包括身份、计算、网络、监控和事故响应；治理层决定伦理、合同、角色、署名、退出和维护。如果这些层薄弱，一个技术上优雅的联邦仍然会失败。所以我想强调这句话：联邦首先是一种合作，然后才是算法。

</div>

### Transition

**EN:** With that full stack in mind, we can read the 2026 research frontier as a set of practical gaps, not just method names.

**中文:** 带着这个完整分层，我们可以把 2026 年研究前沿理解为一组实际缺口，而不只是方法名称。

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

### 中文要点

- 研究前沿不是一个主题，而是六个相互关联的方向。
- 不同方向成熟度不同，不能把预印本和部署证据等同。
- 临床相关性来自方法成熟度与本地研究问题的匹配。

### English Script

By 2026, the interesting questions are no longer only whether federated learning can train a model. The frontier is broader. Personalization asks whose hospital the model should serve. Multimodal FL asks what can be shared when sites have different modalities. Foundation-model work asks whether large models can be adapted efficiently, but clinical translation is still limited. Federated evaluation and analytics ask whether we need training, testing, or estimation. Uncertainty, fairness, robustness, and drift ask who is failed by the average. Infrastructure and governance ask who is responsible when the federation breaks. These areas do not have the same maturity. Some are peer-reviewed methods; some are benchmarks or preprints; some are deployment infrastructure. A clinical PhD should name that maturity level explicitly.

### 中文讲稿

<div lang="zh-Hans">

到 2026 年，有意思的问题已经不只是“联邦学习能否训练模型”。前沿更宽。个性化方向问模型应该服务哪家医院；多模态 FL 问当不同中心有不同模态时，什么可以共享；基础模型方向问大型模型能否高效适配，但临床转化证据仍有限；联邦评估和分析问我们需要的是训练、测试还是估计；不确定性、公平性、稳健性和漂移关注谁会被平均结果掩盖；基础设施和治理则问联邦出问题时谁负责。这些方向成熟度不同，有的是同行评议方法，有的是基准或预印本，有的是部署基础设施。临床博士应明确说明这种成熟度。

</div>

### Transition

**EN:** The frontier is broad, so let us compress it into takeaways that are useful in a clinical protocol meeting.

**中文:** 前沿很宽，所以我们把它压缩成在临床方案会议中真正有用的 takeaway。

### Delivery And Timing

Target time: **2:00**.

Read one mature area and one emerging area. Mention preprints carefully.

### Skip If Late

Use only personalization, multimodal, and governance.

## Slide 14: Practical Takeaways for Clinical AI

### Key Points

- The takeaway is a clinical protocol habit, not a command to use FL.
- Specify the clinical question, movement policy, heterogeneity audit, missing-modality plan, evaluation standard, and governance model.
- These habits are useful for multicentre clinical AI even when FL is not the final design.

### 中文要点

- Takeaway 是一种临床方案设计习惯，而不是要求一定使用 FL。
- 需要明确临床问题、信息移动政策、异质性审计、缺失模态计划、评估标准和治理模型。
- 即使最后不采用 FL，这些习惯也适用于多中心临床 AI。

### English Script

So what can a clinical PhD actually use after this lecture? Not a slogan that says use federated learning, but a practical protocol habit. First, write the clinical question and the target setting before naming the model. Second, decide what is allowed to move: raw data, model updates, metrics, finished models, or only conclusions. Third, treat hospital, scanner, workflow, and label definition as variables, because they shape the meaning of the data. Fourth, plan for missing modalities and local calibration from day one. Fifth, evaluate worst-site performance, uncertainty, drift, and abstention, not only the global average. Sixth, document privacy flows, roles, failure response, and maintenance. These are the pieces that make a multicentre AI study inspectable.

### 中文讲稿

<div lang="zh-Hans">

那么，临床博士在这节课之后真正能用什么？不是一句“应该使用联邦学习”的口号，而是一套实用的方案设计习惯。第一，在说模型名称之前，先写清楚临床问题和目标应用场景。第二，决定什么可以移动：原始数据、模型更新、指标、完成后的模型，还是只有结论。第三，把医院、扫描设备、工作流和标签定义都当作变量，因为它们会改变数据的临床含义。第四，从第一天就计划缺失模态和本地校准。第五，评估最差中心、不确定性、漂移和拒绝预测，而不只是全局平均值。第六，记录隐私信息流、角色分工、失败响应和维护责任。这些部分会让多中心 AI 研究变得可检查、可讨论。

</div>

### Transition

**EN:** Let us pause for questions before I put the final QR and resource link on screen.

**中文:** 在最后二维码和资源链接之前，我们先留出时间提问。

### Delivery And Timing

Target time: **1:30**.

Use this as a synthesis slide. Do not read every item mechanically; group them as design, data, evaluation, and governance.

### Interaction Notes

- This is a synthesis slide, not a lab. Ask which takeaway would change an audience member's next protocol meeting.
- If discussion is quiet, invite them to pick one: data movement, heterogeneity audit, missing-modality plan, or worst-site evaluation.

### Skip If Late

Read takeaways 1, 2, and 5, then move to Q&A.

## Slide 15: Q&A

### Key Points

- Questions should be routed through design, evidence, or governance.
- Project-specific questions are most useful when we map what moves and what must be evaluated locally.
- A good Q&A can turn the lecture into a protocol critique.

### 中文要点

- 提问可以围绕设计、证据或治理三条线展开。
- 项目相关问题最好先画清楚什么会移动，以及什么必须在本地评估。
- 好的 Q&A 可以把整节课转化为对研究方案的讨论。

### English Script

I want to leave space for questions, but I will frame them in the same way as the lecture. Bring a clinical AI project, and we can map what moves, what stays local, and what evidence would change practice. If the question is about design, we can ask whether federated training is really needed, or whether federated evaluation or federated analytics would answer the question more cleanly. If the question is about evidence, we can ask which hospital, subgroup, or drift scenario could fail even when the average looks good. If the question is about governance, we can ask who sees updates, metrics, logs, and released models, and who responds when assumptions break.

### 中文讲稿

<div lang="zh-Hans">

我想留一点时间给大家提问，但会沿用这节课的框架来回答。可以带着一个具体的临床 AI 项目来问：什么会移动，什么留在本地，什么证据会改变临床实践。如果问题属于设计，我们可以讨论是否真的需要联邦训练，还是联邦评估或联邦分析更干净地回答问题。如果问题属于证据，我们可以问哪家医院、哪个亚组或哪种漂移场景可能在平均结果很好时失败。如果问题属于治理，我们可以问谁能看到更新、指标、日志和发布后的模型，以及假设破裂时谁负责响应。

</div>

### Transition

**EN:** I will finish by leaving the QR code and the resource page on screen.

**中文:** 最后我会把二维码和资源页留在屏幕上。

### Delivery And Timing

Target time: **2:18**.

Invite one project-specific question first. If the room is quiet, seed the question: when would federated evaluation be better than federated training?

### Interaction Notes

- Use the three prompt cards as routing buttons for discussion: design, evidence, governance.
- For a project-specific question, first map what moves; second map who could fail; third map who is responsible for visibility and response.

### Skip If Late

If time has almost run out, say that questions can continue after the session and go directly to the QR slide.

## Slide 16: Final Synthesis and Resources

### Key Points

- FL helps when the clinical question is shared but data cannot be pooled.
- It fails when heterogeneity, privacy, evaluation, and governance are afterthoughts.
- The transferable habit is to make the collaboration visible.

### 中文要点

- 当临床问题共享但数据不能集中时，FL 可能有帮助。
- 如果异质性、隐私、评估和治理被事后处理，FL 会失败。
- 最重要的习惯是让合作结构变得可见。

### English Script

To close, I want to leave three messages. Federated learning helps when the clinical question is shared, but patient-level data cannot or should not be pooled. It fails when heterogeneity, privacy, evaluation, and governance are treated as afterthoughts. And the transferable habit is to make the collaboration visible: what moves, what stays local, who is represented, who is failed by the average, and who is responsible. The QR code links to the slides, interactive labs, reading path, and references. Thank you.

### 中文讲稿

<div lang="zh-Hans">

最后我想留下三句话。第一，当临床问题是共同的，但患者级数据不能或不应集中时，联邦学习可能有帮助。第二，如果异质性、隐私、评估和治理只是事后补充，联邦学习会失败。第三，最可迁移的习惯是让合作结构变得可见：什么会移动，什么留在本地，谁被代表，谁被平均值掩盖，以及谁负责。二维码链接到幻灯片、交互实验、阅读路径和参考文献。谢谢大家。

</div>

### Transition

**EN:** End of lesson.

**中文:** 课程结束。

### Delivery And Timing

Target time: **0:54**.

Leave the QR code on screen after Q&A or during the last minute of the session.

### Skip If Late

Read only the three final messages.
