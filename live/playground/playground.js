import { mulberry32, fedAvgWeights, evaluateGlobalUpdate } from "../lib/simulation.js";
import { el } from "../lib/dom.js";

// --- Tabs --------------------------------------------------------------

const tabButtons = [...document.querySelectorAll(".tab-button")];
const panels = Object.fromEntries([...document.querySelectorAll(".tab-panel")].map((p) => [p.dataset.panel, p]));

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((b) => b.setAttribute("aria-selected", String(b === button)));
    Object.entries(panels).forEach(([key, panel]) => {
      panel.hidden = key !== button.dataset.tab;
    });
  });
});

// --- Security tab --------------------------------------------------------

const tgMetrics = document.getElementById("tg-metrics");
const tgLogs = document.getElementById("tg-logs");
const tgRelease = document.getElementById("tg-release");
const securityNodeList = document.getElementById("security-node-list");
const securityCenterList = document.getElementById("security-center-list");
const securityRisk = document.getElementById("security-risk");

const NODE_ALWAYS = ["Raw patient records", "Direct identifiers", "Local preprocessing"];
const CENTER_ALWAYS = ["Model updates (Δw)"];

function renderSecurity() {
  securityNodeList.replaceChildren(...NODE_ALWAYS.map((item) => el("li", { text: item })));

  const centerItems = [...CENTER_ALWAYS];
  const risks = [];
  if (tgMetrics.checked) {
    centerItems.push("Validation metrics per hospital");
    risks.push("Per-site metrics can leak small-cell information (e.g. a hospital with very few positive cases).");
  }
  if (tgLogs.checked) {
    centerItems.push("Orchestration logs (join/participation timing)");
    risks.push("Logs are operational metadata, but timing and participation patterns can still be identifying at a small site.");
  }
  if (tgRelease.checked) {
    centerItems.push("The trained model, released externally");
    risks.push("A released model is a new attack surface: membership inference and model-inversion become possible for anyone who can query it.");
  }
  securityCenterList.replaceChildren(...centerItems.map((item) => el("li", { text: item })));

  securityRisk.innerHTML = risks.length
    ? `<strong>What could go wrong:</strong> ${risks.join(" ")}`
    : "";
  securityRisk.classList.toggle("visible", risks.length > 0);
}

[tgMetrics, tgLogs, tgRelease].forEach((input) => input.addEventListener("change", renderSecurity));
renderSecurity();

// --- Heterogeneity tab -----------------------------------------------------

const slHeterogeneity = document.getElementById("sl-heterogeneity");
const heterogeneityValue = document.getElementById("heterogeneity-value");
const hetNodeArrow = document.getElementById("het-node-arrow");
const hetCenterArrows = document.getElementById("het-center-arrows");
const hetCenterNote = document.getElementById("het-center-note");

const HET_HOSPITAL_COUNT = 8;
const hetSeedRng = mulberry32(20260817);
const hetNoise = Array.from({ length: HET_HOSPITAL_COUNT }, () => (hetSeedRng() - 0.5) * 2); // fixed per-hospital noise in [-1, 1]

function arrowSvg([dx, dy], { color = "#0c6b6f", size = 120, maxLen = 46 } = {}) {
  const norm = Math.hypot(dx, dy) || 1e-6;
  const drawLen = Math.min(maxLen, norm * maxLen);
  const ux = dx / norm;
  const uy = dy / norm;
  const cx = size / 2;
  const cy = size / 2;
  const tipX = cx + ux * drawLen;
  const tipY = cy - uy * drawLen;
  const angle = Math.atan2(cy - tipY, tipX - cx);
  const headLen = 8;
  const leftX = tipX - headLen * Math.cos(angle - Math.PI / 7);
  const leftY = tipY + headLen * Math.sin(angle - Math.PI / 7);
  const rightX = tipX - headLen * Math.cos(angle + Math.PI / 7);
  const rightY = tipY + headLen * Math.sin(angle + Math.PI / 7);
  return `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Model update direction">
      <circle cx="${cx}" cy="${cy}" r="2.5" fill="#10243f"></circle>
      <line x1="${cx}" y1="${cy}" x2="${tipX.toFixed(1)}" y2="${tipY.toFixed(1)}" stroke="${color}" stroke-width="3" stroke-linecap="round"></line>
      <polygon points="${tipX.toFixed(1)},${tipY.toFixed(1)} ${leftX.toFixed(1)},${leftY.toFixed(1)} ${rightX.toFixed(1)},${rightY.toFixed(1)}" fill="${color}"></polygon>
    </svg>`;
}

function multiArrowSvg(vectors, aggregate, { size = 220, maxLen = 84 } = {}) {
  const cx = size / 2;
  const cy = size / 2;
  const thin = vectors
    .map(([dx, dy]) => {
      const norm = Math.hypot(dx, dy) || 1e-6;
      const drawLen = Math.min(maxLen, norm * maxLen);
      const tipX = cx + (dx / norm) * drawLen;
      const tipY = cy - (dy / norm) * drawLen;
      return `<line x1="${cx}" y1="${cy}" x2="${tipX.toFixed(1)}" y2="${tipY.toFixed(1)}" stroke="#8fb9c9" stroke-width="1.5" opacity="0.7"></line>`;
    })
    .join("");

  const [adx, ady] = aggregate;
  const anorm = Math.hypot(adx, ady);
  const boldLen = Math.min(maxLen, anorm * maxLen);
  const tipX = cx + (anorm ? (adx / anorm) * boldLen : 0);
  const tipY = cy - (anorm ? (ady / anorm) * boldLen : 0);
  const bold =
    anorm > 0.01
      ? `<line x1="${cx}" y1="${cy}" x2="${tipX.toFixed(1)}" y2="${tipY.toFixed(1)}" stroke="#10243f" stroke-width="4" stroke-linecap="round"></line>
         <circle cx="${tipX.toFixed(1)}" cy="${tipY.toFixed(1)}" r="4" fill="#10243f"></circle>`
      : "";

  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Eight client updates and the aggregated global update">
    <circle cx="${cx}" cy="${cy}" r="2.5" fill="#10243f"></circle>
    ${thin}
    ${bold}
  </svg>`;
}

function renderHeterogeneity() {
  const spreadPct = Number(slHeterogeneity.value);
  heterogeneityValue.textContent = spreadPct < 25 ? "Low" : spreadPct < 60 ? "Moderate" : "High";
  const maxSpreadDeg = 130; // at 100%, hospitals can point in wildly different directions

  const vectors = hetNoise.map((noise) => {
    const angleDeg = noise * (spreadPct / 100) * maxSpreadDeg;
    const rad = (angleDeg * Math.PI) / 180;
    return [Math.cos(rad), Math.sin(rad)];
  });

  const aggregate = vectors.reduce((acc, [x, y]) => [acc[0] + x / vectors.length, acc[1] + y / vectors.length], [0, 0]);
  const aggregateNorm = Math.hypot(aggregate[0], aggregate[1]);

  hetNodeArrow.innerHTML = arrowSvg([1, 0]);
  hetCenterArrows.innerHTML = multiArrowSvg(vectors, aggregate);
  hetCenterNote.textContent =
    aggregateNorm > 0.75
      ? "Hospitals mostly agree — the aggregate is nearly as strong as any one update."
      : aggregateNorm > 0.35
        ? "Hospitals partly disagree — the aggregate is noticeably weaker than any single update."
        : "Hospitals strongly disagree — updates cancel out, and the aggregate barely moves the model at all.";
}

slHeterogeneity.addEventListener("input", renderHeterogeneity);
renderHeterogeneity();

// --- Fairness tab ------------------------------------------------------

const slFairness = document.getElementById("sl-fairness");
const fairnessValue = document.getElementById("fairness-value");
const fairNodeWeight = document.getElementById("fair-node-weight");
const fairMean = document.getElementById("fair-mean");
const fairRare = document.getElementById("fair-rare");
const fairWorst = document.getElementById("fair-worst");

// Seven fixed, ordinary hospitals plus the one rare-population site, all
// pointing toward the "common academic" evaluation environment except the
// rare site, which points toward its own environment (see EVAL_ENVIRONMENTS
// in lib/simulation.js). Only the giant hospital's nTrain is adjustable.
const FAIRNESS_ROSTER = [
  { id: "giant", nTrain: 200, delta: [0.95, 0.14], decision: "participate" },
  { id: "ordinary-1", nTrain: 140, delta: [0.9, 0.1], decision: "participate" },
  { id: "ordinary-2", nTrain: 120, delta: [0.85, 0.16], decision: "participate" },
  { id: "ordinary-3", nTrain: 110, delta: [0.92, 0.05], decision: "participate" },
  { id: "ordinary-4", nTrain: 95, delta: [0.88, 0.12], decision: "participate" },
  { id: "ordinary-5", nTrain: 90, delta: [0.9, 0.08], decision: "participate" },
  { id: "ordinary-6", nTrain: 80, delta: [0.86, 0.1], decision: "participate" },
  { id: "rare", nTrain: 22, delta: [0.53, 0.85], decision: "participate", rarePopulation: true },
];

function renderFairness() {
  const giantN = Number(slFairness.value);
  fairnessValue.textContent = `${giantN} patients`;

  const roster = FAIRNESS_ROSTER.map((c) => (c.id === "giant" ? { ...c, nTrain: giantN } : c));
  const { weights } = fedAvgWeights(roster);
  const totalN = roster.reduce((s, c) => s + c.nTrain, 0);
  const globalDelta = roster.reduce(
    (acc, c) => {
      const w = weights.get(c.id) || 0;
      return [acc[0] + w * c.delta[0], acc[1] + w * c.delta[1]];
    },
    [0, 0],
  );

  const rareWeight = weights.get("rare") || 0;
  fairNodeWeight.textContent = `${(rareWeight * 100).toFixed(1)}% of ${totalN} total patients`;

  const evaluation = evaluateGlobalUpdate(globalDelta);
  const rareEnv = evaluation.perEnvironment.find((e) => e.key === "raresubgroup");
  fairMean.textContent = evaluation.mean.toFixed(2);
  fairRare.textContent = rareEnv ? rareEnv.performance.toFixed(2) : "—";
  fairWorst.textContent = `${evaluation.worst.performance.toFixed(2)} (${evaluation.worst.label})`;
}

slFairness.addEventListener("input", renderFairness);
renderFairness();
