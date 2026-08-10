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

- The five diagrams are a decision vocabulary, not clickable controls. Read them from left to right by asking what unit moves: raw records, separate local models, model updates, finished model, or aggregate statistics.
- Changing the design changes the scientific claim. Pooling maximizes control but moves records; local-only minimizes movement but weakens generalization; FL trains together; federated evaluation tests a model where data live; federated analytics estimates counts or rates before modeling.
- Use this slide to stop premature method choice. The practical question is not “can we do FL?” but “which movement pattern answers the clinical question with the least unnecessary burden?”

### 交互参数和图表读数

<ul lang="zh-Hans">
<li>这五个图不是按钮，而是一套决策词汇。讲解时按从左到右读：移动的是原始记录、本地模型、模型更新、完成后的模型，还是汇总统计量。</li>
<li>改变协作设计，就改变科学主张。集中数据控制力最强但移动负担最大；本地训练治理最简单但泛化最弱；联邦训练共同更新模型；联邦评估在数据所在处测试模型；联邦分析先估计数量、比例或均值。</li>
<li>这一页用来阻止过早选择方法。真正的问题不是“能不能做 FL”，而是“哪一种移动模式能以最少的不必要负担回答临床问题”。</li>
</ul>

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

- Sample-size weighting: each site weight follows cohort size. The largest hospital becomes visually dominant in the left bars, and the aggregate update moves toward that site’s local update.
- Equal-site weighting: every hospital receives the same voice. Smaller sites become visible, but the aggregate can become noisier if a small site has unstable labels or measurement practice.
- Quality-aware weighting: the quality field can change the left weight bars. Turning on “include quality signal” rewards cleaner local data; turning on “upweight under-represented prevalence” gives more influence to a rare-prevalence site.
- Readouts: “aggregate update” is the weighted result; “largest site weight” shows how concentrated the federation is. If one site owns the aggregate, the federation may be technically distributed but scientifically centralized.
- Teaching point: aggregation is not neutral accounting. It encodes what the collaboration values: size, fairness, data quality, target population, or some negotiated compromise.

### 交互参数和图表读数

<ul lang="zh-Hans">
<li>Sample-size 按样本量加权：左侧权重条会让最大医院最显眼，aggregate update 会被拉向这个医院的本地更新。</li>
<li>Equal-site 让每家医院声音相同：小中心会变得可见，但如果小中心标签或测量不稳定，整体估计可能更噪。</li>
<li>Quality-aware 让数据质量影响权重。勾选 include quality signal 会奖励更可靠的数据；勾选 upweight under-represented prevalence 会提高罕见患病率中心的影响力。</li>
<li>读数里 aggregate update 是加权后的总更新；largest site weight 显示联邦是否被某一个中心主导。如果一个中心拥有大部分权重，系统虽然是分布式的，科学上仍可能很集中。</li>
<li>这一页说明：聚合不是中性的平均。它表达协作真正重视什么：规模、公平、数据质量、目标人群，或各方协商后的折中。</li>
</ul>

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

- Intensity changes global brightness. It illustrates scanner gain, reconstruction scaling, or preprocessing differences that can move pixels without changing anatomy.
- Contrast changes separation between tissue intensities. When contrast is altered, boundaries become easier or harder for a model even though the patient is the same.
- Noise and blur change image reliability. Higher noise simulates lower signal-to-noise acquisition; higher blur simulates motion, slice thickness, reconstruction, or protocol differences.
- Bias field adds spatial shading. The same structure becomes bright in one region and dim in another, showing why scanner and preprocessing are clinical variables in imaging AI.
- Compare baseline split reveals that the anatomy is constant while appearance changes. Use it to say: domain shift can look harmless to a human and still change model behavior.
- Threshold panel: decision threshold controls how cautious the classifier is; prevalence shift changes the base rate; label noise makes the observed target less reliable. The apparent-positive rate and calibration pressure change because evaluation depends on population and labels, not only the image.

### 交互参数和图表读数

<ul lang="zh-Hans">
<li>Intensity 改变整体亮度，模拟扫描仪增益、重建尺度或预处理差异；解剖没有变，但像素分布变了。</li>
<li>Contrast 改变组织强度之间的分离度。调高或调低后，边界对模型会更容易或更困难，即使病人是同一个。</li>
<li>Noise 和 blur 改变图像可靠性。噪声更高表示信噪比更低；模糊更高可代表运动、层厚、重建或协议差异。</li>
<li>Bias field 增加空间性亮暗不均。同一个结构在某些区域更亮、另一些区域更暗，说明扫描仪和预处理本身就是影像 AI 的变量。</li>
<li>compare baseline split 用来对比“解剖不变、外观改变”。讲解重点是：domain shift 对人眼可能不夸张，但足以改变模型行为。</li>
<li>Threshold panel 中，decision threshold 控制分类器谨慎程度；prevalence shift 改变基础患病率；label noise 让观察到的标签更不可靠。因此 apparent-positive rate 和 calibration pressure 会变化，说明评估依赖人群和标签，而不只依赖图像。</li>
</ul>

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

- Shared-local mix moves the vertical marker on the curve. More shared representation can improve the mean site, but the worst site can fall if local calibration is underpowered.
- Heterogeneity widens the gap between mean-site and worst-site curves. When heterogeneity rises, global success becomes less informative about who is safe to deploy on.
- Local data per site changes whether personalization is credible. With more local data, local adaptation can help; with little local data, it may overfit and create false confidence.
- Teaching point: do not average away the vulnerable site. Personalization is not cosmetic customization; it is an accountability mechanism for local failure.

### 交互参数和图表读数

<ul lang="zh-Hans">
<li>Shared-local mix 会移动曲线上的竖线。共享表示更多时，平均中心可能更好，但如果本地校准能力不足，最差中心可能下降。</li>
<li>Heterogeneity 会拉大 mean-site 和 worst-site 曲线的距离。异质性越强，全局平均越不能说明哪些中心可以安全部署。</li>
<li>Local data per site 决定个性化是否可信。本地数据更多时，本地适配可能有帮助；本地数据很少时，可能过拟合并产生虚假的安全感。</li>
<li>这一页的重点是：不要用平均值掩盖脆弱中心。个性化不是装饰性的定制，而是对本地失败负责的一种机制。</li>
</ul>

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

- Each tick in the modality matrix means a hospital can contribute that modality. Removing a tick changes the common clinical core and can make complete-case analysis biased or impossible.
- MRI, CT, EHR, pathology, and genomics are not interchangeable columns. Their availability reflects care pathways, referral patterns, cost, infrastructure, and indication bias.
- Design consequence cards translate the ticks into architecture: common-core features, modality-specific encoders, dropout or distillation, and missingness-aware evaluation.
- Teaching point: missingness is not a nuisance to hide after collection. It is an input to the federation design and should be reported as evidence about the clinical network.

### 交互参数和图表读数

<ul lang="zh-Hans">
<li>矩阵里的每一个勾表示某家医院能提供这个模态。去掉一个勾，就会改变共同临床核心，complete-case 分析可能立刻有偏或不可行。</li>
<li>MRI、CT、EHR、病理和基因组不是可以随便互换的列。它们的可用性反映诊疗路径、转诊模式、成本、基础设施和适应证偏倚。</li>
<li>右侧设计后果把这些勾转换成架构选择：共同核心特征、模态专属编码器、dropout 或 distillation，以及考虑缺失性的评估。</li>
<li>这一页说明：缺失不是收集完以后再隐藏的小麻烦。它是联邦设计的输入，也应该作为临床网络证据被报告。</li>
</ul>

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

- Each checkbox reveals another information flow. Model updates, counts, metrics, logs, malicious behavior, and external model release are different privacy surfaces, not one generic “data stay local” promise.
- When a box is ticked, follow the arrows in the diagram and ask who can see the flow, who approves it, how long it is retained, and what suppression or audit rule applies.
- Model updates can leak patient-like features; low counts or subgroup metrics can disclose rare cases; logs can reveal participation or timing; external release creates downstream model-use risk.
- Teaching point: privacy is a system property. The claim “raw records stay local” starts the discussion; it does not finish the privacy argument.

### 交互参数和图表读数

<ul lang="zh-Hans">
<li>每个 checkbox 都会暴露一种信息流。模型更新、计数、指标、日志、恶意参与者和模型外部发布，是不同的隐私攻击面，而不是一句“数据留在本地”可以覆盖。</li>
<li>勾选某一项后，沿着图里的箭头问：谁能看见这条信息流？谁批准？保留多久？用什么抑制、审计或访问规则限制？</li>
<li>模型更新可能泄露类似患者的特征；低计数或亚组指标可能暴露罕见病例；日志可能暴露参与和时间；外部发布会带来下游模型使用风险。</li>
<li>这一页说明：隐私是系统属性。“原始记录留在本地”只是讨论起点，不是完整的隐私论证。</li>
</ul>

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

- Unseen-site shift lowers the red unseen-site bar relative to the known sites. It shows how a model can look acceptable on participating hospitals and still be weak on the next hospital.
- Abstention threshold controls how often the system refuses or escalates uncertain cases. Raising it can protect safety but increases handoff burden; lowering it increases coverage but may hide uncertainty.
- The bottom readout links global average, worst site, calibration gap, and abstention. These are not decorative metrics; they are deployment rules that should be pre-specified.
- Teaching point: evaluation should name the hospital-level failure mode. A clinical report needs global performance plus per-site, worst-site, subgroup, calibration, drift, uncertainty, and abstention behavior.

### 交互参数和图表读数

<ul lang="zh-Hans">
<li>Unseen-site shift 会让红色 unseen-site 柱相对已知中心下降，说明模型在参与医院看起来可以，但到了下一家医院仍可能变弱。</li>
<li>Abstention threshold 控制系统拒绝预测或升级人工处理的频率。阈值更高可能更安全，但会增加交接负担；阈值更低覆盖更多病例，但可能掩盖不确定性。</li>
<li>底部读数把 global average、worst site、calibration gap 和 abstention 连在一起。这些不是装饰性指标，而是应该预先写进方案的部署规则。</li>
<li>这一页说明：评估要说清楚医院层面的失败模式。临床报告需要全局表现，也需要 per-site、worst-site、亚组、校准、漂移、不确定性和拒绝预测行为。</li>
</ul>

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

- The useful lesson is not “use FL”; it is to make the multicentre study design inspectable.
- Hospital, missingness, privacy flows, personalization, and worst-site behavior are part of the scientific object.
- A clinical AI protocol should define movement, failure, ownership, and evidence before the algorithm becomes the center of attention.

### 中文要点

- 真正有用的 takeaway 不是“使用 FL”，而是让多中心研究设计本身可检查。
- 医院、缺失性、隐私信息流、个性化和最差中心表现，都是科学对象的一部分。
- 临床 AI 方案应该先定义移动、失败、责任和证据，再让算法成为中心。

### English Script

So the takeaway is more subtle than “federated learning is good.” The transferable habit is to make the collaboration visible. First, treat FL as a study design, not a model choice: define the clinical question, the target setting, and the movement contract before naming the algorithm. Second, treat hospital as a variable. Scanner, referral, workflow, and label definition encode clinical practice; they are not just nuisance variation. Third, remember that the average is not the deployment site. Worst-site performance, calibration, drift, and abstention are safety endpoints, not supplementary analysis. Fourth, treat missingness as evidence about who is measured and what the model cannot know. Fifth, use personalization as accountability: local adaptation is justified when a shared model hides local risk. Sixth, describe privacy as a chain of flows, with owners and stop rules for updates, metrics, logs, and released models.

### 中文讲稿

<div lang="zh-Hans">

所以最后的 takeaway 不是简单地说“联邦学习很好”。更可迁移的习惯，是把协作本身变得可见。第一，把 FL 当作研究设计，而不是模型选择：先定义临床问题、目标场景和信息移动契约，再说算法。第二，把医院当作变量。扫描仪、转诊、工作流和标签定义都编码了临床实践，不只是 nuisance variation。第三，记住平均值不是部署地点。最差中心表现、校准、漂移和拒绝预测是安全终点，不是补充分析。第四，把缺失性当作证据：它告诉我们谁被测量、模型永远不知道什么。第五，把个性化看作问责机制：只有当共享模型掩盖了本地风险时，本地适配才有临床意义。第六，把隐私描述成一条信息流链：更新、指标、日志和发布后的模型，都需要责任人和停止规则。

</div>

### Transition

**EN:** With those takeaways in mind, let us turn the room into a protocol clinic for a few minutes.

**中文:** 带着这些 takeaway，我们把接下来的几分钟变成一个小型方案门诊。

### Delivery And Timing

Target time: **1:30**.

Frame this as insight, not homework. Read the bold idea in each card, then add one sentence on why it changes a protocol or ethics discussion.

### Interaction Notes

- This is a synthesis slide. Ask the audience which card would change their next protocol meeting: movement contract, hospital-as-variable, worst-site endpoint, missingness, personalization, or privacy flow.
- If discussion is quiet, point to card 3 and ask: would your current project still look good if the deployment hospital were the worst site rather than the average site?

### 交互参数和图表读数

<ul lang="zh-Hans">
<li>这是总结页。可以问听众：哪一张卡会改变你下一次写方案或伦理申请时的表达？信息移动契约、医院作为变量、最差中心终点、缺失性、个性化，还是隐私信息流？</li>
<li>如果现场安静，就指向第 3 点问：如果部署医院不是平均中心，而是最差中心，你现在的项目还成立吗？</li>
</ul>

### Skip If Late

Read takeaways 1, 3, and 6, then move to Q&A.

## Slide 15: Q&A

### Key Points

- Q&A is organized as a mini protocol clinic: question, movement, evidence, governance.
- The best questions use a concrete project and ask what would change practice.
- The prompt cards keep discussion from drifting into abstract FL enthusiasm.

### 中文要点

- Q&A 被设计成一个小型方案门诊：问题、移动、证据、治理。
- 最好的问题来自具体项目，并追问什么证据会改变实践。
- 提示卡能避免讨论停留在抽象的 FL 兴奋感上。

### English Script

For questions, I want to run this like a small protocol clinic. Bring one real or imagined clinical AI project. We will start with the clinical question, then map what moves, and finally ask what evidence would change care. If the question is about design, we ask whether federated training is needed at all, or whether evaluation, analytics, pooling, or local-only modeling is more honest. If the question is about evidence, we ask who could fail: a hospital, a subgroup, a drift scenario, or a missing modality. If the question is about governance, we ask what must be visible: updates, metrics, logs, released models, and incident response. And before any deployment claim, we ask what should have been pre-defined: worst-site threshold, calibration, abstention, and a stop rule.

### 中文讲稿

<div lang="zh-Hans">

提问环节我想把它做成一个小型方案门诊。请带一个真实或想象中的临床 AI 项目。我们先从临床问题开始，然后画出什么会移动，最后问什么证据会改变临床实践。如果问题属于设计，就问是否真的需要联邦训练，还是联邦评估、联邦分析、集中数据或本地模型更诚实。如果问题属于证据，就问谁可能失败：某家医院、某个亚组、某种漂移场景，还是某个缺失模态。如果问题属于治理，就问什么必须可见：更新、指标、日志、发布后的模型和事件响应。最后，在任何部署主张之前，我们都问哪些规则应该预先定义：最差中心阈值、校准、拒绝预测和停止规则。

</div>

### Transition

**EN:** I will finish by leaving the QR code and the resource page on screen.

**中文:** 最后我会把二维码和资源页留在屏幕上。

### Delivery And Timing

Target time: **2:18**.

Invite one project-specific question first. If nobody starts, ask for a project where data cannot move and route it through the four cards.

### Interaction Notes

- Use the four cards as discussion routing buttons: design choice, failure mode, governance surface, and pre-specified rule.
- For a project-specific question, first map what moves; second identify who could fail; third name who owns visibility and response; fourth define what evidence would stop or change the study.

### 交互参数和图表读数

<ul lang="zh-Hans">
<li>把四张卡当作讨论路由按钮：设计选择、失败模式、治理表面、预先定义的规则。</li>
<li>如果有人提出具体项目，先画什么会移动；再找谁可能失败；第三说清楚谁负责可见性和响应；第四定义什么证据会停止或改变研究。</li>
</ul>

### Skip If Late

If time has almost run out, ask one seeded question on federated evaluation versus federated training, then go directly to the QR slide.

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
