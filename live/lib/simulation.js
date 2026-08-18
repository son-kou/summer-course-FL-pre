// Deterministic synthetic federated-learning classroom simulation.
//
// Nothing here trains a real model. A student's phone represents one
// federated client; "local training" is a precomputed, seeded projection so
// a full 60-client federation can be inspected in a few minutes.
//
// Scientific framing kept intentionally strict:
//  - local validation performance (localMetricBefore/After) is NOT the thing
//    that gets aggregated. It is shown next to, never inside, the update.
//  - the aggregated object is a 2D model-update vector delta = [dx, dy].
//    Real updates are extremely high-dimensional; 2D is a pedagogical
//    projection for visualization only.
//  - global_metric is never computed as average(local_metric). It is a
//    separate synthetic evaluation panel driven by the aggregated delta.
//
// All functions here are pure and side-effect free so they can be unit
// tested independently of any UI or backend.

/** Mulberry32 seeded PRNG. Same seed -> same sequence, forever. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic 32-bit hash of a string (djb2 variant). */
export function hashString(text) {
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 33) ^ text.charCodeAt(i);
  }
  return hash >>> 0;
}

/** Build a per-client seeded RNG from a session seed and a client id. */
export function clientRng(sessionSeed, clientId) {
  return mulberry32(hashString(`${sessionSeed}::${clientId}`));
}

function lerp(rng, [min, max]) {
  return min + rng() * (max - min);
}

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

// Eight underlying hospital archetypes. Every simulated client is sampled
// from one of these. Angles define the direction the archetype's local
// objective tends to pull the shared model in the 2D projection; spread adds
// per-client noise around that direction. None of this represents a real
// institution.
export const ARCHETYPES = [
  {
    key: "academic",
    label: "Large academic centre",
    selectionWeight: 20,
    nTrain: [220, 340],
    nVal: [40, 70],
    prevalence: [0.18, 0.28],
    dataQuality: [0.85, 0.95],
    labelNoise: [0.03, 0.08],
    domainShift: [0.05, 0.15],
    missingness: [0.0, 0.1],
    angleDeg: 8,
    spreadDeg: 12,
    magnitude: [0.85, 1.05],
    metricBefore: [0.66, 0.72],
    metricGain: [0.06, 0.1],
    dropoutRisk: 0.03,
    note: "Large, well-labelled cohort close to the pooled population.",
  },
  {
    key: "rural",
    label: "Small rural centre",
    selectionWeight: 15,
    nTrain: [28, 60],
    nVal: [10, 20],
    prevalence: [0.1, 0.4],
    dataQuality: [0.65, 0.8],
    labelNoise: [0.08, 0.15],
    domainShift: [0.2, 0.35],
    missingness: [0.1, 0.25],
    angleDeg: 55,
    spreadDeg: 30,
    magnitude: [0.7, 1.3],
    metricBefore: [0.6, 0.7],
    metricGain: [0.02, 0.09],
    dropoutRisk: 0.1,
    note: "Different referral pattern and rare population; useful but noisy update.",
  },
  {
    key: "scanner",
    label: "Different scanner / protocol",
    selectionWeight: 15,
    nTrain: [90, 160],
    nVal: [20, 35],
    prevalence: [0.15, 0.25],
    dataQuality: [0.75, 0.88],
    labelNoise: [0.05, 0.1],
    domainShift: [0.4, 0.6],
    missingness: [0.05, 0.15],
    angleDeg: 100,
    spreadDeg: 18,
    magnitude: [0.9, 1.2],
    metricBefore: [0.62, 0.7],
    metricGain: [0.03, 0.07],
    dropoutRisk: 0.04,
    note: "Feature shift from acquisition hardware; update points in a different direction.",
  },
  {
    key: "labelshift",
    label: "Label-definition mismatch",
    selectionWeight: 10,
    nTrain: [70, 140],
    nVal: [15, 30],
    prevalence: [0.2, 0.35],
    dataQuality: [0.7, 0.85],
    labelNoise: [0.12, 0.2],
    domainShift: [0.3, 0.45],
    missingness: [0.05, 0.15],
    angleDeg: 165,
    spreadDeg: 15,
    magnitude: [1.0, 1.4],
    metricBefore: [0.64, 0.74],
    metricGain: [-0.02, 0.03],
    dropoutRisk: 0.05,
    note: "Apparently reasonable performance hides a systematic concept/label shift.",
  },
  {
    key: "specialist",
    label: "High-quality specialist centre",
    selectionWeight: 10,
    nTrain: [25, 45],
    nVal: [10, 18],
    prevalence: [0.25, 0.45],
    dataQuality: [0.92, 0.98],
    labelNoise: [0.01, 0.04],
    domainShift: [0.15, 0.3],
    missingness: [0.0, 0.05],
    angleDeg: -50,
    spreadDeg: 12,
    magnitude: [0.6, 0.9],
    metricBefore: [0.68, 0.78],
    metricGain: [0.05, 0.09],
    dropoutRisk: 0.03,
    note: "Small but very high annotation quality; clinically distinctive population.",
  },
  {
    key: "noisy",
    label: "Noisy / problematic site",
    selectionWeight: 8,
    nTrain: [60, 130],
    nVal: [15, 25],
    prevalence: [0.15, 0.5],
    dataQuality: [0.4, 0.6],
    labelNoise: [0.25, 0.4],
    domainShift: [0.3, 0.5],
    missingness: [0.15, 0.3],
    angleDeg: 200,
    spreadDeg: 60,
    magnitude: [1.6, 2.4],
    metricBefore: [0.55, 0.68],
    metricGain: [-0.08, 0.02],
    dropoutRisk: 0.06,
    note: "Label noise or a preprocessing problem; unusually large update norm.",
  },
  {
    key: "straggler",
    label: "Slow / resource-limited site",
    selectionWeight: 12,
    nTrain: [50, 110],
    nVal: [15, 25],
    prevalence: [0.15, 0.3],
    dataQuality: [0.7, 0.85],
    labelNoise: [0.06, 0.12],
    domainShift: [0.15, 0.3],
    missingness: [0.1, 0.2],
    angleDeg: 20,
    spreadDeg: 25,
    magnitude: [0.75, 1.1],
    metricBefore: [0.62, 0.72],
    metricGain: [0.02, 0.07],
    dropoutRisk: 0.45,
    note: "Reasonable data, but a real systems-heterogeneity dropout risk.",
  },
  {
    key: "raresubgroup",
    label: "Rare subgroup centre",
    selectionWeight: 10,
    nTrain: [15, 32],
    nVal: [8, 15],
    prevalence: [0.4, 0.6],
    dataQuality: [0.78, 0.9],
    labelNoise: [0.05, 0.1],
    domainShift: [0.35, 0.5],
    missingness: [0.05, 0.15],
    angleDeg: 130,
    spreadDeg: 15,
    magnitude: [0.9, 1.3],
    metricBefore: [0.58, 0.68],
    metricGain: [0.01, 0.06],
    dropoutRisk: 0.05,
    note: "Small sample, clinically critical signal, easily suppressed under sample-size weighting.",
  },
];

function pickArchetype(rng) {
  const total = ARCHETYPES.reduce((sum, a) => sum + a.selectionWeight, 0);
  let roll = rng() * total;
  for (const archetype of ARCHETYPES) {
    roll -= archetype.selectionWeight;
    if (roll <= 0) return archetype;
  }
  return ARCHETYPES[ARCHETYPES.length - 1];
}

function round(value, decimals = 3) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Generate one deterministic synthetic client from a session seed and a
 * stable client id. Calling this twice with the same inputs always returns
 * an identical client — this is what makes the classroom demo reproducible.
 */
export function generateClient(sessionSeed, clientId, options = {}) {
  const rng = clientRng(sessionSeed, clientId);
  const archetype = options.forceArchetype
    ? ARCHETYPES.find((a) => a.key === options.forceArchetype) || pickArchetype(rng)
    : pickArchetype(rng);

  const nTrain = Math.round(lerp(rng, archetype.nTrain));
  const nVal = Math.round(lerp(rng, archetype.nVal));
  const prevalence = round(lerp(rng, archetype.prevalence), 3);
  const dataQuality = round(lerp(rng, archetype.dataQuality), 3);
  const labelNoise = round(lerp(rng, archetype.labelNoise), 3);
  const domainShift = round(lerp(rng, archetype.domainShift), 3);
  const missingness = round(lerp(rng, archetype.missingness), 3);

  const angle = degToRad(archetype.angleDeg + (rng() - 0.5) * 2 * archetype.spreadDeg);
  const magnitude = lerp(rng, archetype.magnitude);
  const delta = [round(magnitude * Math.cos(angle), 3), round(magnitude * Math.sin(angle), 3)];
  const updateNorm = round(Math.hypot(delta[0], delta[1]), 3);

  const metricBefore = round(lerp(rng, archetype.metricBefore), 3);
  const metricAfter = round(Math.min(0.97, Math.max(0.4, metricBefore + lerp(rng, archetype.metricGain))), 3);

  const straggler = rng() < archetype.dropoutRisk;

  return {
    id: clientId,
    archetype: archetype.key,
    archetypeLabel: archetype.label,
    archetypeNote: archetype.note,
    nTrain,
    nVal,
    prevalence,
    dataQuality,
    labelNoise,
    domainShift,
    missingness,
    localMetricBefore: metricBefore,
    localMetricAfter: metricAfter,
    delta,
    updateNorm,
    rarePopulation: archetype.key === "raresubgroup",
    suspicious: false,
    straggler,
    decision: null,
    concern: null,
  };
}

/** Generate a full deterministic roster of clients for a session. */
export function generateRoster(sessionSeed, count, options = {}) {
  const roster = [];
  for (let i = 1; i <= count; i += 1) {
    roster.push(generateClient(sessionSeed, `client-${i}`, options));
  }
  return roster;
}

// --- Teaching-event injection -------------------------------------------

/** Event A: make one client an outsized hospital (large n_k). */
export function injectGiantHospital(roster, clientId, nTrain = 900) {
  return roster.map((c) => (c.id === clientId ? { ...c, nTrain, archetypeNote: `${c.archetypeNote} (giant hospital event)` } : c));
}

/** Event B: mark a client as the highlighted rare-population hospital. */
/**
 * Event B: highlight a clinically rare, small hospital. Unlike a cosmetic
 * flag, this must actually reproduce "under FedAvg its contribution
 * becomes tiny": a small, fixed nTrain so its aggregation weight is
 * visibly near zero, and a fixed direction distinct from the common
 * archetypes' cluster (matching the "raresubgroup" archetype's own angle
 * in ARCHETYPES) so its arrow is visually distinguishable in the vector
 * field even though it barely moves the aggregate.
 */
export function injectRareHospital(roster, clientId, options = {}) {
  const nTrain = options.nTrain ?? 14;
  const angleDeg = options.angleDeg ?? 130;
  const magnitude = options.magnitude ?? 1.15;
  const rad = (angleDeg * Math.PI) / 180;
  const delta = [round(magnitude * Math.cos(rad), 3), round(magnitude * Math.sin(rad), 3)];
  return roster.map((c) =>
    c.id === clientId
      ? {
          ...c,
          rarePopulation: true,
          nTrain,
          delta,
          updateNorm: round(Math.hypot(delta[0], delta[1]), 3),
          archetypeNote: `${c.archetypeNote} (rare hospital event)`,
        }
      : c,
  );
}

/** Event C: inject one extreme, unexplained update. Cause is intentionally not attached to the data. */
export function injectSuspiciousUpdate(roster, clientId, seedSalt = "suspicious") {
  const rng = clientRng(`${seedSalt}:${clientId}`, "delta");
  const angle = rng() * Math.PI * 2;
  const magnitude = 3.2 + rng() * 1.4;
  const delta = [round(magnitude * Math.cos(angle), 3), round(magnitude * Math.sin(angle), 3)];
  return roster.map((c) =>
    c.id === clientId
      ? { ...c, delta, updateNorm: round(Math.hypot(delta[0], delta[1]), 3), suspicious: true }
      : c,
  );
}

// --- Aggregation strategies ----------------------------------------------
// Each returns { weights: Map<id, number>, globalDelta: [dx, dy], included: string[] }
// `clients` should already be filtered to participating (decision !== "hold"
// and not an unresolved straggler) — aggregation itself has no opinion on
// eligibility, matching how a server aggregates whatever it actually receives.

// Only clients who actively decided to participate (with or without a
// flagged concern) are aggregated. "hold" and not-yet-responded/straggler
// clients contribute nothing — matching the classroom framing that this
// decision is a site-level participation choice, not a computed opt-out.
function eligible(clients) {
  return clients.filter((c) => c.decision === "participate" || c.decision === "flag");
}

export function fedAvgWeights(clients) {
  const included = eligible(clients);
  const totalN = included.reduce((sum, c) => sum + c.nTrain, 0) || 1;
  const weights = new Map(included.map((c) => [c.id, c.nTrain / totalN]));
  return { weights, included: included.map((c) => c.id) };
}

export function equalClientWeights(clients) {
  const included = eligible(clients);
  const k = included.length || 1;
  const weights = new Map(included.map((c) => [c.id, 1 / k]));
  return { weights, included: included.map((c) => c.id) };
}

function weightedGlobalDelta(clients, weights) {
  let dx = 0;
  let dy = 0;
  clients.forEach((c) => {
    const w = weights.get(c.id) || 0;
    // A client can exist in a partial state — e.g. it has answered the
    // opening poll but hasn't reached local-training reveal yet, so it has
    // no delta. Its weight is 0 in that case (eligible() requires a
    // decision), but skip explicitly rather than relying on 0 * undefined.
    if (w === 0 || !c.delta) return;
    dx += w * c.delta[0];
    dy += w * c.delta[1];
  });
  return [round(dx, 4), round(dy, 4)];
}

export function clipDelta(delta, maxNorm) {
  const norm = Math.hypot(delta[0], delta[1]);
  if (norm <= maxNorm || norm === 0) return delta;
  const scale = maxNorm / norm;
  return [round(delta[0] * scale, 4), round(delta[1] * scale, 4)];
}

export function clippedFedAvg(clients, maxNorm = 1.6) {
  const included = eligible(clients);
  const totalN = included.reduce((sum, c) => sum + c.nTrain, 0) || 1;
  const weights = new Map(included.map((c) => [c.id, c.nTrain / totalN]));
  const clippedClients = included.map((c) => ({ ...c, delta: clipDelta(c.delta, maxNorm) }));
  const globalDelta = weightedGlobalDelta(clippedClients, weights);
  return { weights, included: included.map((c) => c.id), globalDelta, clippedTo: maxNorm };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function coordinateMedian(clients) {
  const included = eligible(clients);
  const dx = median(included.map((c) => c.delta[0]));
  const dy = median(included.map((c) => c.delta[1]));
  // Illustrative equal-influence weight for the UI only; the median itself is not a weighted sum.
  const weights = new Map(included.map((c) => [c.id, 1 / (included.length || 1)]));
  return { weights, included: included.map((c) => c.id), globalDelta: [round(dx, 4), round(dy, 4)] };
}

export const AGGREGATION_STRATEGIES = {
  fedavg: {
    key: "fedavg",
    label: "FedAvg · weight by local sample size",
    teachingPoint:
      "Each training example contributes roughly equally to the pooled objective, but hospitals do not receive equal influence.",
    run(clients) {
      const { weights, included } = fedAvgWeights(clients);
      return { weights, included, globalDelta: weightedGlobalDelta(clients, weights) };
    },
  },
  equal: {
    key: "equal",
    label: "Equal-client weighting · teaching contrast",
    teachingPoint: "Equal influence per institution is a different objective from equal influence per observation.",
    run(clients) {
      const { weights, included } = equalClientWeights(clients);
      return { weights, included, globalDelta: weightedGlobalDelta(clients, weights) };
    },
  },
  clipped: {
    key: "clipped",
    label: "Clipped FedAvg · limit extreme update magnitude",
    teachingPoint: "Robustness choices create assumptions and tradeoffs; clipping bounds influence, it does not diagnose it.",
    run(clients, options = {}) {
      return clippedFedAvg(clients, options.maxNorm ?? 1.6);
    },
  },
  median: {
    key: "median",
    label: "Coordinate median · robust aggregation illustration",
    teachingPoint:
      "A simplified robust-aggregation illustration, not a default medical-FL recommendation.",
    run(clients) {
      return coordinateMedian(clients);
    },
  },
};

export function runAggregation(strategyKey, clients, options = {}) {
  const strategy = AGGREGATION_STRATEGIES[strategyKey];
  if (!strategy) throw new Error(`Unknown aggregation strategy: ${strategyKey}`);
  return { strategy: strategyKey, ...strategy.run(clients, options) };
}

// --- Synthetic evaluation panel -------------------------------------------
// Four representative validation environments. Performance is a function of
// how well the aggregated global delta aligns with each environment's ideal
// direction and magnitude. This is a coherent deterministic teaching
// simulation, not a claim about any real model or dataset.

export const EVAL_ENVIRONMENTS = [
  { key: "academic", label: "Common academic hospital", idealAngleDeg: 8, idealNorm: 1.0, baseline: 0.68 },
  { key: "rural", label: "Rural hospital", idealAngleDeg: 55, idealNorm: 1.0, baseline: 0.63 },
  { key: "scanner", label: "Shifted scanner", idealAngleDeg: 100, idealNorm: 1.0, baseline: 0.6 },
  { key: "raresubgroup", label: "Rare subgroup hospital", idealAngleDeg: 130, idealNorm: 1.0, baseline: 0.58 },
];

function angleOf([dx, dy]) {
  return Math.atan2(dy, dx);
}

function angularAlignment(deltaAngle, idealAngleDeg) {
  const diff = deltaAngle - degToRad(idealAngleDeg);
  return Math.cos(diff); // 1 = perfectly aligned, -1 = opposite
}

/**
 * Evaluate a global update against the four synthetic environments.
 * Returns per-environment performance in [0.3, 0.97], plus mean and worst.
 */
export function evaluateGlobalUpdate(globalDelta) {
  const norm = Math.hypot(globalDelta[0], globalDelta[1]);
  const angle = norm === 0 ? 0 : angleOf(globalDelta);

  const perEnvironment = EVAL_ENVIRONMENTS.map((env) => {
    const alignment = norm === 0 ? 0 : angularAlignment(angle, env.idealAngleDeg);
    const magnitudeFactor = Math.min(1, norm / env.idealNorm);
    const overshoot = Math.max(0, norm - env.idealNorm * 1.6) * 0.05;
    const gain = 0.18 * alignment * magnitudeFactor - overshoot;
    const performance = round(Math.min(0.97, Math.max(0.3, env.baseline + gain)), 3);
    return { key: env.key, label: env.label, performance };
  });

  const values = perEnvironment.map((e) => e.performance);
  const mean = round(values.reduce((s, v) => s + v, 0) / values.length, 3);
  const worst = perEnvironment.reduce((min, e) => (e.performance < min.performance ? e : min), perEnvironment[0]);
  const range = round(Math.max(...values) - Math.min(...values), 3);

  return { perEnvironment, mean, worst, range };
}

// --- Session helpers -------------------------------------------------------

export function makeSessionCode(rng = mulberry32(Date.now() >>> 0)) {
  const digits = String(Math.floor(rng() * 9000) + 1000);
  return `FL-${digits}`;
}

export function summarizeParticipation(clients) {
  const responded = clients.filter((c) => c.decision != null);
  const participate = responded.filter((c) => c.decision === "participate").length;
  const hold = responded.filter((c) => c.decision === "hold").length;
  const flag = responded.filter((c) => c.decision === "flag").length;
  return { joined: clients.length, responded: responded.length, participate, hold, flag };
}

// --- Opening prediction poll -------------------------------------------------
// Before any FL vocabulary is introduced, students are asked how they would
// combine everyone's already-trained models without moving training data.
// This is deliberately answered "cold" — the point is to surface intuition
// (including wrong intuition) before FedAvg is named, not to test recall.

export const PREDICT_OPTIONS = [
  { key: "average", label: "Average everyone's model weights equally" },
  { key: "best-only", label: "Keep only the best-performing model, discard the rest" },
  { key: "weight-by-data", label: "Weight each model by how much data it was trained on" },
  { key: "vote", label: "Have every model vote on each prediction (ensemble)" },
  { key: "pool-retrain", label: "Send everyone's training data to one place and retrain" },
];

/** Tally opening-poll votes. Never includes clients who haven't voted. */
export function summarizePoll(clients) {
  const voted = clients.filter((c) => c.predictVote != null);
  const counts = Object.fromEntries(PREDICT_OPTIONS.map((o) => [o.key, 0]));
  voted.forEach((c) => {
    if (counts[c.predictVote] != null) counts[c.predictVote] += 1;
  });
  return { total: voted.length, counts };
}

// Groups the five cold-take options into the collaboration-design families
// the lecture actually teaches, each with one honest pro and one honest con.
// This is what turns the raw vote tally into the "why not simply pool"
// discussion — grounded in what the room just picked, not an abstract list.
export const POLL_DESIGN_GROUPS = [
  {
    key: "pool",
    label: "Centralized pooling",
    optionKeys: ["pool-retrain"],
    pro: "Strongest statistical control — one dataset, one training run.",
    con: "Highest legal and logistical burden: raw data must physically move.",
  },
  {
    key: "federated",
    label: "Federated / weighted combination",
    optionKeys: ["weight-by-data", "average"],
    pro: "Data never leaves any hospital, and the group still gets one shared model.",
    con: "The weighting rule embeds an assumption about whose data should count more.",
  },
  {
    key: "ensemble",
    label: "Ensemble — keep every model separate",
    optionKeys: ["vote"],
    pro: "No aggregation assumptions at all; every model's judgement is preserved.",
    con: "Never becomes one shared model — every model must run at inference time.",
  },
  {
    key: "select",
    label: "Pick one champion model",
    optionKeys: ["best-only"],
    pro: "The simplest possible rule to explain and implement.",
    con: "Throws away every other hospital's information entirely.",
  },
];

/** Roll the raw poll tally up into the four design families, for display. */
export function summarizePollByDesign(clients) {
  const poll = summarizePoll(clients);
  return POLL_DESIGN_GROUPS.map((group) => ({
    ...group,
    count: group.optionKeys.reduce((sum, key) => sum + (poll.counts[key] || 0), 0),
  }));
}
