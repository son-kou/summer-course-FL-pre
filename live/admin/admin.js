import {
  generateRoster,
  clientRng,
  runAggregation,
  AGGREGATION_STRATEGIES,
  evaluateGlobalUpdate,
  injectGiantHospital,
  injectRareHospital,
  injectSuspiciousUpdate,
  summarizeParticipation,
  makeSessionCode,
  mulberry32,
  PREDICT_OPTIONS,
  summarizePoll,
} from "../lib/simulation.js";
import { createBackend } from "../lib/backend.js";
import { clientDisplayNumber } from "../lib/identity.js";
import { firebaseConfig } from "../firebase-config.js";

const CONCERN_LABELS = {
  "small-sample": "Small sample",
  "unusual-population": "Unusual population",
  "label-quality": "Label quality",
  "distribution-shift": "Distribution shift",
  "unusual-update": "Update looks unusual",
  "worse-performance": "Local performance worsened",
  other: "Other / unsure",
};

const state = {
  sessionCode: null,
  seed: null,
  backend: null,
  backendKind: "unknown",
  meta: defaultMeta(),
  clients: {},
  unsubMeta: null,
  unsubClients: null,
  eventTargets: {},
  rehearsal: { active: false, stepIndex: -1 },
};

function defaultMeta() {
  return { phase: "predict", joinOpen: true, aggregation: "fedavg", event: null, eventClientId: null };
}

// --- DOM refs ---------------------------------------------------------

const $ = (id) => document.getElementById(id);
const phasePill = $("phase-pill");
const sessionCodeDisplay = $("session-code-display");
const joinedCount = $("joined-count");
const respondedCount = $("responded-count");
const aggregationLabel = $("aggregation-label");
const connectionPill = $("connection-pill");
const federationMap = $("federation-map");
const vectorField = $("vector-field");
const weightsEquation = $("weights-equation");
const weightsBars = $("weights-bars");
const weightsHeadline = $("weights-headline");
const evalCards = $("eval-cards");
const evalMean = $("eval-mean");
const evalWorst = $("eval-worst");
const evalRange = $("eval-range");
const dropoutLine = $("dropout-line");
const qrOverlay = $("qr-overlay");
const qrTarget = $("qr-target");
const qrCodeText = $("qr-code-text");
const qrFallbackUrl = $("qr-fallback-url");
const fatalOverlay = $("fatal-overlay");
const rehearsalStrip = $("rehearsal-strip");
const adminToast = $("admin-toast");
const predictStage = $("predict-stage");
const adminStage = $("admin-stage");
const predictBars = $("predict-bars");
const predictTotal = $("predict-total");

let toastTimer = null;
function showToast(message, { error = false } = {}) {
  adminToast.textContent = message;
  adminToast.classList.toggle("error", error);
  adminToast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    adminToast.hidden = true;
  }, 4000);
}

// --- Boot ---------------------------------------------------------------

async function boot() {
  try {
    const params = new URLSearchParams(location.search);
    const { provider, kind } = await createBackend({
      params,
      firebaseConfig,
      onFallback: () => setConnection("demo-fallback"),
    });
    state.backend = provider;
    state.backendKind = kind;
    setConnection(kind);

    const existingCode = params.get("code");
    if (existingCode) {
      state.sessionCode = existingCode;
      subscribeSession(existingCode);
    } else {
      await createSession();
    }

    wireControls();
    render();

    // Only the opening-slide preview (index.qmd passes &autoqr=1) auto-reveals
    // the QR — a reader flipping through the deck should see all three of the
    // lecture's QR codes at a glance, without one click nobody in the preview
    // performs. The other embedded previews (federation map, vectors,
    // weights) must NOT do this, or the QR modal would cover the very thing
    // they exist to preview. The real, full-page dashboard never auto-shows
    // it either: an instructor opening a fresh tab keeps manual control.
    if (params.get("autoqr") === "1") {
      showQr();
    }
  } catch (error) {
    console.error(error);
    fatalOverlay.hidden = false;
  }
}

function setConnection(kind) {
  const online = kind === "firebase" || kind === "local" || kind === "demo";
  connectionPill.textContent =
    kind === "firebase"
      ? "● live backend connected"
      : kind === "local"
        ? "● local rehearsal mode (same machine)"
        : kind === "demo"
          ? "● demo mode (no backend)"
          : "● live backend unavailable — demo mode";
  connectionPill.className = `connection-pill ${online ? "online" : "offline"}`;
}

// --- Session lifecycle ----------------------------------------------------

async function createSession() {
  const code = makeSessionCode(mulberry32((Date.now() % 1e9) >>> 0));
  state.sessionCode = code;
  state.seed = code;
  state.eventTargets = {};
  await state.backend.createSession(code, defaultMeta());
  const url = new URL(location.href);
  url.searchParams.set("code", code);
  history.replaceState(null, "", url.toString());
  subscribeSession(code);
}

function subscribeSession(code) {
  state.unsubMeta?.();
  state.unsubClients?.();
  state.unsubMeta = state.backend.watchMeta(code, (meta) => {
    state.meta = meta || defaultMeta();
    renderControlsState();
    render();
  });
  state.unsubClients = state.backend.watchClients(code, (clients) => {
    state.clients = clients || {};
    render();
  });
}

function clientsArray() {
  return Object.entries(state.clients).map(([id, rec]) => ({ id, ...rec }));
}

// --- Rendering --------------------------------------------------------------

function render() {
  const clients = clientsArray();
  const isPredictPhase = (state.meta.phase || "predict") === "predict";
  predictStage.hidden = !isPredictPhase;
  adminStage.hidden = isPredictPhase;

  renderTopbar(clients, isPredictPhase);

  if (isPredictPhase) {
    renderPredict(clients);
    return;
  }

  const strategyKey = state.meta.aggregation || "fedavg";
  const aggregation = runAggregation(strategyKey, clients, { maxNorm: 1.6 });
  renderMap(clients);
  renderVectors(clients, aggregation);
  renderWeights(clients, aggregation, strategyKey);
  renderEval(aggregation);
  renderDropout(clients);
}

function renderPredict(clients) {
  const poll = summarizePoll(clients);
  const maxCount = Math.max(1, ...Object.values(poll.counts));
  predictBars.innerHTML = PREDICT_OPTIONS.map((option) => {
    const count = poll.counts[option.key] || 0;
    const pct = poll.total ? Math.round((count / poll.total) * 100) : 0;
    const leading = count === maxCount && count > 0;
    return `
      <div class="predict-row ${leading ? "leading" : ""}">
        <span>${option.label}</span>
        <span class="predict-bar-track"><span class="predict-bar-fill" style="width:${Math.round((count / maxCount) * 100)}%"></span></span>
        <span class="predict-count">${count} · ${pct}%</span>
      </div>`;
  }).join("");
  predictTotal.textContent = `${poll.total} response${poll.total === 1 ? "" : "s"}`;
}

function renderTopbar(clients, isPredictPhase) {
  phasePill.textContent = state.meta.phase || "predict";
  sessionCodeDisplay.textContent = state.sessionCode || "— create session —";
  if (isPredictPhase) {
    const poll = summarizePoll(clients);
    joinedCount.textContent = String(clients.length);
    respondedCount.textContent = String(poll.total);
  } else {
    const summary = summarizeParticipation(clients);
    joinedCount.textContent = String(summary.joined);
    respondedCount.textContent = String(summary.responded);
  }
  const strategy = AGGREGATION_STRATEGIES[state.meta.aggregation || "fedavg"];
  aggregationLabel.textContent = strategy ? strategy.label.split(" · ")[0] : "FedAvg";
}

function statusOf(client) {
  if (client.decision === "participate") return "participate";
  if (client.decision === "flag") return "flag";
  if (client.decision === "hold") return "hold";
  if (client.straggler) return "straggler";
  return "waiting";
}

const STATUS_FILL = {
  participate: "#17a2a0",
  flag: "#d99a2b",
  hold: "#0f2340",
  straggler: "#22365c",
  waiting: "#17284a",
};

function renderMap(clients) {
  const width = 1000;
  const height = 480;
  if (!clients.length) {
    federationMap.innerHTML = `<svg viewBox="0 0 ${width} ${height}"><text x="50%" y="50%" text-anchor="middle" fill="#7d94bf" font-size="20">No clients yet — show the JOIN QR, or populate demo clients.</text></svg>`;
    return;
  }
  const cols = Math.max(6, Math.ceil(Math.sqrt(clients.length * (width / height))));
  const rows = Math.ceil(clients.length / cols);
  const cellW = width / cols;
  const cellH = height / rows;
  const maxN = Math.max(...clients.map((c) => c.nTrain || 40), 40);

  const nodes = clients
    .map((client, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const cx = cellW * (col + 0.5);
      const cy = cellH * (row + 0.5);
      const status = statusOf(client);
      const radius = 6 + 12 * Math.sqrt(Math.min(1, (client.nTrain || 40) / maxN));
      const fill = STATUS_FILL[status];
      const stroke = client.suspicious ? "#c85446" : status === "hold" ? "#6b7fa8" : "none";
      const dash = status === "hold" ? "3 3" : "0";
      const strokeWidth = client.suspicious ? 3 : 1.5;
      const glyph =
        status === "flag"
          ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" fill="#10243f">⚑</text>`
          : status === "straggler"
            ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" fill="#b9c8e6">⏱</text>`
            : "";
      const rareMarker = client.rarePopulation
        ? `<circle cx="${cx + radius - 2}" cy="${cy - radius + 2}" r="4" fill="#c85446"></circle>`
        : "";
      return `
        <g>
          <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${radius.toFixed(1)}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-dasharray="${dash}">
            <title>Client #${clientDisplayNumber(client.id)} · ${client.archetypeLabel || "joining"} · ${status}</title>
          </circle>
          ${glyph}
          ${rareMarker}
        </g>`;
    })
    .join("");

  federationMap.innerHTML = `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">${nodes}</svg>`;
}

function projectVector([dx, dy], maxRadius) {
  const norm = Math.hypot(dx, dy);
  if (norm === 0) return { x: 0, y: 0, norm };
  const drawLen = maxRadius * (1 - Math.exp(-norm / 1.4));
  return { x: (dx / norm) * drawLen, y: (dy / norm) * drawLen, norm };
}

function arrowPath(cx, cy, tipX, tipY, headLen) {
  const angle = Math.atan2(cy - tipY, tipX - cx);
  const leftX = tipX - headLen * Math.cos(angle - Math.PI / 7);
  const leftY = tipY + headLen * Math.sin(angle - Math.PI / 7);
  const rightX = tipX - headLen * Math.cos(angle + Math.PI / 7);
  const rightY = tipY + headLen * Math.sin(angle + Math.PI / 7);
  return `${tipX.toFixed(1)},${tipY.toFixed(1)} ${leftX.toFixed(1)},${leftY.toFixed(1)} ${rightX.toFixed(1)},${rightY.toFixed(1)}`;
}

function renderVectors(clients, aggregation) {
  const width = 640;
  const height = 480;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) / 2 - 30;
  const included = new Set(aggregation.included);
  const byId = Object.fromEntries(clients.map((c) => [c.id, c]));

  const clientArrows = aggregation.included
    .map((id) => {
      const client = byId[id];
      if (!client || !client.delta) return "";
      const weight = aggregation.weights.get(id) || 0;
      const { x, y } = projectVector(client.delta, maxRadius);
      const tipX = cx + x;
      const tipY = cy - y;
      const opacity = Math.max(0.25, Math.min(0.9, weight * 6 + 0.2));
      const color = client.suspicious ? "#c85446" : client.rarePopulation ? "#d99a2b" : "#5aa9a5";
      return `
        <line x1="${cx}" y1="${cy}" x2="${tipX.toFixed(1)}" y2="${tipY.toFixed(1)}" stroke="${color}" stroke-width="2" opacity="${opacity.toFixed(2)}"></line>
        <polygon points="${arrowPath(cx, cy, tipX, tipY, 6)}" fill="${color}" opacity="${opacity.toFixed(2)}"></polygon>`;
    })
    .join("");

  const { x: gx, y: gy } = projectVector(aggregation.globalDelta || [0, 0], maxRadius);
  const gTipX = cx + gx;
  const gTipY = cy - gy;
  const globalNorm = Math.hypot((aggregation.globalDelta || [0, 0])[0], (aggregation.globalDelta || [0, 0])[1]);

  vectorField.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <line x1="20" y1="${cy}" x2="${width - 20}" y2="${cy}" stroke="#22365c"></line>
      <line x1="${cx}" y1="20" x2="${cx}" y2="${height - 20}" stroke="#22365c"></line>
      ${clientArrows}
      <line x1="${cx}" y1="${cy}" x2="${gTipX.toFixed(1)}" y2="${gTipY.toFixed(1)}" stroke="#ffffff" stroke-width="5" stroke-linecap="round"></line>
      <polygon points="${arrowPath(cx, cy, gTipX, gTipY, 12)}" fill="#ffffff"></polygon>
      <circle cx="${cx}" cy="${cy}" r="5" fill="#10243f" stroke="#ffffff" stroke-width="2"></circle>
      <text x="${cx}" y="${height - 8}" text-anchor="middle" font-size="12" fill="#93a8ce">shared model · aggregated update norm ≈ ${globalNorm.toFixed(2)}</text>
    </svg>`;
}

function renderWeights(clients, aggregation, strategyKey) {
  const byId = Object.fromEntries(clients.map((c) => [c.id, c]));
  const rows = [...aggregation.weights.entries()].sort((a, b) => b[1] - a[1]);
  const top = rows.slice(0, 8);
  const restWeight = rows.slice(8).reduce((s, [, w]) => s + w, 0);
  const maxWeight = rows.length ? rows[0][1] : 0;

  const strategy = AGGREGATION_STRATEGIES[strategyKey];
  weightsEquation.innerHTML =
    strategyKey === "median"
      ? `w<sub>t+1</sub> = coordinate-median { w<sub>t+1</sub><sup>(k)</sup> }<br><span style="color:#93a8ce;font-size:0.78rem">${strategy.teachingPoint}</span>`
      : `w<sub>t+1</sub> = Σ<sub>k</sub> (n<sub>k</sub> / Σ<sub>j</sub> n<sub>j</sub>) · w<sub>t+1</sub><sup>(k)</sup><br><span style="color:#93a8ce;font-size:0.78rem">${strategy.teachingPoint}</span>`;

  weightsBars.innerHTML = top
    .map(([id, weight]) => {
      const client = byId[id] || {};
      const pct = Math.round(weight * 1000) / 10;
      const dominant = weight === maxWeight && weight > 0;
      return `
        <div class="weight-row ${dominant ? "dominant" : ""}">
          <span>#${clientDisplayNumber(id)}</span>
          <span class="weight-bar-track"><span class="weight-bar-fill" style="width:${Math.min(100, weight * 100 * (1 / Math.max(0.12, maxWeight))).toFixed(1)}%"></span></span>
          <span>${pct}%</span>
        </div>`;
    })
    .join("");

  if (restWeight > 0) {
    weightsBars.innerHTML += `<div class="weight-row"><span>others</span><span class="weight-bar-track"><span class="weight-bar-fill" style="width:${Math.min(100, restWeight * 100).toFixed(1)}%"></span></span><span>${Math.round(restWeight * 1000) / 10}%</span></div>`;
  }

  weightsHeadline.textContent = rows.length ? `Largest client weight: ${Math.round(maxWeight * 1000) / 10}%` : "Largest client weight: —";
}

function renderEval(aggregation) {
  const evaluation = evaluateGlobalUpdate(aggregation.globalDelta || [0, 0]);
  evalCards.innerHTML = evaluation.perEnvironment
    .map(
      (env) => `
      <div class="eval-card">
        <span class="eval-card-label">${env.label}</span>
        <span class="eval-card-value">${env.performance.toFixed(2)}</span>
        <div class="eval-bar-track"><div class="eval-bar-fill" style="width:${Math.round(env.performance * 100)}%"></div></div>
      </div>`,
    )
    .join("");
  evalMean.textContent = evaluation.mean.toFixed(2);
  evalWorst.textContent = `${evaluation.worst.label} · ${evaluation.worst.performance.toFixed(2)}`;
  evalRange.textContent = evaluation.range.toFixed(2);
}

function renderDropout(clients) {
  const summary = summarizeParticipation(clients);
  const stragglers = clients.filter((c) => c.straggler);
  const stragglersResponded = stragglers.filter((c) => c.decision != null).length;
  dropoutLine.textContent = `Selected: ${summary.joined} · Responded before deadline: ${summary.responded}`;
  if (stragglers.length) {
    dropoutLine.textContent += ` (of which ${stragglers.length} resource-limited sites, ${stragglersResponded} responded)`;
  }
}

// --- Controls ---------------------------------------------------------------

function renderControlsState() {
  document.querySelectorAll("#aggregation-controls [data-strategy]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.strategy === (state.meta.aggregation || "fedavg")));
  });
  $("btn-toggle-join").textContent = state.meta.joinOpen === false ? "Reopen enrollment" : "Freeze enrollment";
}

// Prefer a client that is already participating (or flagged) so the event's
// effect is immediately visible in the weights/vector panels, which only
// include participating clients. Falls back to any matching archetype, then
// to any client at all, so the event never silently no-ops.
function pickEventTarget(kind) {
  if (state.eventTargets[kind]) return state.eventTargets[kind];
  const arr = clientsArray();
  if (!arr.length) return null;
  const participating = (c) => c.decision === "participate" || c.decision === "flag";
  const archetypeFor = { giant: "academic", rare: "raresubgroup", suspicious: "noisy" }[kind];
  const rareFallback = (c) => c.rarePopulation;

  const candidate =
    arr.find((c) => c.archetype === archetypeFor && participating(c)) ||
    (kind === "rare" && arr.find((c) => rareFallback(c) && participating(c))) ||
    arr.find((c) => participating(c)) ||
    arr.find((c) => c.archetype === archetypeFor) ||
    (kind === "rare" && arr.find(rareFallback)) ||
    arr[0];

  state.eventTargets[kind] = candidate.id;
  return candidate.id;
}

async function runEvent(kind) {
  const id = pickEventTarget(kind);
  if (!id) {
    window.alert("No clients yet. Populate demo clients or wait for students to join before running a teaching event.");
    return;
  }
  const rec = { id, ...state.clients[id] };
  let patch = {};
  if (kind === "giant") {
    const [patched] = injectGiantHospital([rec], id);
    patch = { nTrain: patched.nTrain, archetypeNote: patched.archetypeNote };
  } else if (kind === "rare") {
    const [patched] = injectRareHospital([rec], id);
    patch = { rarePopulation: patched.rarePopulation, archetypeNote: patched.archetypeNote };
  } else if (kind === "suspicious") {
    const [patched] = injectSuspiciousUpdate([rec], id);
    patch = { delta: patched.delta, updateNorm: patched.updateNorm, suspicious: patched.suspicious };
  }
  await state.backend.upsertClient(state.sessionCode, id, patch);
  await state.backend.setMeta(state.sessionCode, { event: kind, eventClientId: id });
}

function decideForClient(seed, client) {
  const rng = clientRng(`${seed}::decision`, client.id);
  if (client.straggler && rng() < 0.55) return { decision: null, concern: null };
  const roll = rng();
  if (roll < 0.68) return { decision: "participate", concern: null };
  if (roll < 0.83) return { decision: "hold", concern: null };
  const pool = concernPoolFor(client);
  const concern = pool[Math.floor(rng() * pool.length)];
  return { decision: "flag", concern };
}

// Weighted so the demo roster looks like a plausible cold-take distribution:
// "weight by data" (closest to FedAvg) and "average" are the most common
// intuitions, "vote" a distant third, and the two weakest options rarest.
function voteForClient(seed, client) {
  const rng = clientRng(`${seed}::predict`, client.id);
  const roll = rng();
  if (roll < 0.32) return "weight-by-data";
  if (roll < 0.58) return "average";
  if (roll < 0.78) return "vote";
  if (roll < 0.91) return "best-only";
  return "pool-retrain";
}

function concernPoolFor(client) {
  if (client.archetype === "noisy" || client.suspicious) return ["unusual-update", "label-quality"];
  if (client.archetype === "raresubgroup") return ["unusual-population", "small-sample"];
  if (client.archetype === "rural") return ["small-sample", "distribution-shift"];
  if (client.archetype === "scanner") return ["distribution-shift"];
  if (client.archetype === "labelshift") return ["label-quality", "worse-performance"];
  return ["other"];
}

async function populateDemoClients(count = 60) {
  const seed = state.seed || state.sessionCode;
  const roster = generateRoster(seed, count);
  await state.backend.setMeta(state.sessionCode, { phase: "joining" });
  await Promise.all(
    roster.map((client) =>
      state.backend.upsertClient(state.sessionCode, client.id, {
        joinedAt: Date.now(),
        predictVote: voteForClient(seed, client),
        archetype: client.archetype,
        archetypeLabel: client.archetypeLabel,
        archetypeNote: client.archetypeNote,
        nTrain: client.nTrain,
        nVal: client.nVal,
        prevalence: client.prevalence,
        dataQuality: client.dataQuality,
        updateNorm: client.updateNorm,
        delta: client.delta,
        localMetricBefore: client.localMetricBefore,
        localMetricAfter: client.localMetricAfter,
        rarePopulation: client.rarePopulation,
        suspicious: client.suspicious,
        straggler: client.straggler,
        decision: null,
      }),
    ),
  );
}

async function simulateResponses() {
  const seed = state.seed || state.sessionCode;
  const roster = clientsArray();
  await Promise.all(
    roster.map((client) => {
      const { decision, concern } = decideForClient(seed, client);
      const delayMs = Math.floor(Math.random() * 900); // stagger only, not part of the deterministic outcome
      return new Promise((resolve) => {
        setTimeout(() => {
          state.backend.upsertClient(state.sessionCode, client.id, { decision, concern, decidedAt: Date.now() }).then(resolve, resolve);
        }, delayMs);
      });
    }),
  );
}

// --- Rehearsal mode ----------------------------------------------------------

const REHEARSAL_STEPS = [
  { label: "1 · Title", line: "Open on the title slide. Name the two-day-course callback in one sentence." },
  { label: "2 · You already trained different models", line: "Show JOIN QR. Ask the opening prediction poll: how would you combine 60 models without moving data?" },
  { label: "3 · Why not pool", line: "Name centralized vs local-only vs federated. Ask who voted to pool the data." },
  { label: "4 · One FL round", line: "Walk the round animation: broadcast, local training, updates move, aggregate." },
  { label: "5 · Reveal your hospital", line: "Prompt: tap Reveal my site — no new scan needed." },
  { label: "6 · Meet the federation", line: "Freeze enrollment. Ask: would you trust all these hospitals equally? Would you weight them equally?" },
  { label: "7 · Round 1", line: "Run FedAvg. Point at the weight bars and the resultant arrow. Callback to the opening poll." },
  { label: "8 · Not IID", line: "Reveal profiles. Point at disagreeing arrows. Name feature/label/concept/workflow shift." },
  { label: "9 · Classics & frontier", line: "Name FedProx/FedBN/SCAFFOLD/FedOpt correctly in two sentences." },
  { label: "10 · Round 2", line: "Predict, then trigger the rare-hospital event (default) or suspicious-update event." },
  { label: "11 · Worst site", line: "Show mean vs worst-site. 'The average is not the deployment site.'" },
  { label: "12 · Security", line: "Stays local vs still moves. Federation changes the privacy problem; it does not delete it." },
  { label: "13 · Real world", line: "Everything simulated here becomes harder in real hospitals." },
  { label: "14 · Four lenses", line: "Bias, security, heterogeneity, fairness — none require running FL to be useful." },
  { label: "15 · Playground", line: "Show the playground QR — distinct from the join QR and the resources QR." },
  { label: "16 · Resources", line: "Show the resources QR — the third and final distinct QR of the lecture." },
];

function startRehearsal() {
  state.rehearsal.active = true;
  state.rehearsal.stepIndex = 0;
  rehearsalStrip.hidden = false;
  updateRehearsalStrip();
}

function updateRehearsalStrip() {
  const step = REHEARSAL_STEPS[state.rehearsal.stepIndex];
  $("rehearsal-step-label").textContent = step ? step.label : "Rehearsal complete";
  $("rehearsal-spoken-line").textContent = step ? step.line : "Reset when ready to teach live.";
}

function exitRehearsal() {
  state.rehearsal.active = false;
  rehearsalStrip.hidden = true;
}

// --- QR overlay --------------------------------------------------------------

function joinUrl(code) {
  const base = new URL("../index.html", location.href);
  base.searchParams.set("code", code);
  return base.toString();
}

function showQr() {
  const url = joinUrl(state.sessionCode);
  qrCodeText.textContent = state.sessionCode || "FL-0000";
  qrFallbackUrl.textContent = url;
  try {
    const qr = window.qrcode(0, "M");
    qr.addData(url);
    qr.make();
    qrTarget.innerHTML = qr.createSvgTag({ scalable: true, margin: 4 });
  } catch (error) {
    console.error(error);
    qrTarget.innerHTML = `<p style="color:#10243f">QR generation failed — use the URL below.</p>`;
  }
  qrOverlay.hidden = false;
}

// --- Wiring -------------------------------------------------------------------

function wireControls() {
  $("btn-create-session").addEventListener("click", async () => {
    if (!window.confirm("Create a fresh session? This resets the current federation.")) return;
    try {
      await createSession();
      showToast(`New session created: ${state.sessionCode}`);
    } catch (error) {
      console.error(error);
      showToast("Could not create a new session — check the live backend connection.", { error: true });
    }
  });
  $("btn-show-qr").addEventListener("click", showQr);
  $("qr-close").addEventListener("click", () => {
    qrOverlay.hidden = true;
  });
  $("session-code-button").addEventListener("click", showQr);

  $("btn-toggle-join").addEventListener("click", async () => {
    const nextOpen = state.meta.joinOpen === false;
    await state.backend.setMeta(state.sessionCode, { joinOpen: nextOpen });
  });

  $("btn-reveal-federation").addEventListener("click", async () => {
    try {
      await state.backend.setMeta(state.sessionCode, { phase: "lobby" });
    } catch (error) {
      console.error(error);
      showToast("Could not reveal the federation map — check the connection.", { error: true });
    }
  });

  $("btn-round1").addEventListener("click", async () => {
    await state.backend.setMeta(state.sessionCode, { phase: "round1", joinOpen: false });
  });
  $("btn-round2").addEventListener("click", async () => {
    await state.backend.setMeta(state.sessionCode, { phase: "stress" });
  });
  $("btn-reset").addEventListener("click", async () => {
    if (!window.confirm("Reset the whole simulation for this session?")) return;
    try {
      await state.backend.resetSession(state.sessionCode, defaultMeta());
      state.eventTargets = {};
      showToast("Simulation reset. Same session code, join QR still valid.");
    } catch (error) {
      console.error(error);
      showToast("Reset failed — this device may not be the session's creator. Use “Create / reset session” instead.", {
        error: true,
      });
    }
  });

  document.querySelectorAll("#aggregation-controls [data-strategy]").forEach((button) => {
    button.addEventListener("click", async () => {
      await state.backend.setMeta(state.sessionCode, { aggregation: button.dataset.strategy });
    });
  });

  $("btn-event-giant").addEventListener("click", () => runEvent("giant"));
  $("btn-event-rare").addEventListener("click", () => runEvent("rare"));
  $("btn-event-suspicious").addEventListener("click", () => runEvent("suspicious"));

  $("btn-demo-populate").addEventListener("click", () => populateDemoClients(60));
  $("btn-demo-respond").addEventListener("click", () => simulateResponses());

  $("btn-rehearsal").addEventListener("click", startRehearsal);
  $("btn-rehearsal-next").addEventListener("click", () => {
    state.rehearsal.stepIndex = Math.min(REHEARSAL_STEPS.length - 1, state.rehearsal.stepIndex + 1);
    updateRehearsalStrip();
  });
  $("btn-rehearsal-exit").addEventListener("click", exitRehearsal);

  $("fatal-demo-button").addEventListener("click", async () => {
    const url = new URL(location.href);
    url.searchParams.set("demo", "1");
    url.searchParams.delete("code");
    location.href = url.toString();
  });
}

window.addEventListener("error", (event) => {
  console.error(event.error || event.message);
});

boot();
