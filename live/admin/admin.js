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
  summarizePollByDesign,
} from "../lib/simulation.js";
import { createBackend } from "../lib/backend.js";
import { clientDisplayNumber, publishActiveSession } from "../lib/identity.js";
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
  eventEffectTimer: null,
  rehearsal: { active: false, stepIndex: -1 },
  forceView: null,
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
const predictDesignPanel = $("predict-design-panel");
const predictDesignGroups = $("predict-design-groups");
const eventEffectBanner = $("event-effect-banner");
const eventEffectTitle = $("event-effect-title");
const eventEffectRows = $("event-effect-rows");

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
    // Slides 1-2 embed this dashboard to show the opening prediction poll
    // specifically — that poll's votes are cast once, early, and should
    // stay visible there even after the real session's phase moves on
    // (map revealed, rounds run) for the rest of the lecture. ?view=predict
    // pins the predict-stage on regardless of the live meta.phase.
    state.forceView = params.get("view");
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
      if (kind !== "demo") publishActiveSession(existingCode);
    } else {
      await createSession();
    }

    wireControls();
    render();

    // The opening slide's "Open Federation Dashboard" link passes
    // &autoqr=1 so a fresh session immediately shows its QR — one less
    // click at the exact moment a presenter is standing at the podium
    // wanting the code on screen as fast as possible.
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
  // Never publish a throwaway Demo Mode session as "the" active session —
  // every deck-embedded preview defaults to ?demo=1 so it shows *something*
  // before a real session exists, and each one independently calls
  // createSession(). If those were published, the last iframe to load would
  // silently hijack every other iframe's (and the real dashboard's) mirror.
  if (state.backendKind !== "demo") publishActiveSession(code);
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
  const isPredictPhase = state.forceView === "predict" || (state.meta.phase || "predict") === "predict";
  predictStage.hidden = !isPredictPhase;
  adminStage.hidden = isPredictPhase;

  renderTopbar(clients, isPredictPhase);

  if (isPredictPhase) {
    renderPredict(clients);
    return;
  }

  // The map (who has joined) is always meaningful. The aggregation panels
  // are deliberately withheld until the instructor clicks "Start Round 1" /
  // "Start Round 2" — otherwise they'd already be showing live-updating
  // arrows and weights before that click did anything, making the click
  // feel like it had no effect.
  const phase = state.meta.phase || "predict";
  const hasAggregated = phase === "round1" || phase === "stress" || phase === "closed";
  const strategyKey = state.meta.aggregation || "fedavg";
  const aggregation = runAggregation(strategyKey, clients, { maxNorm: 1.6 });
  renderMap(clients);
  renderVectors(clients, aggregation, hasAggregated);
  renderWeights(clients, aggregation, strategyKey, hasAggregated);
  renderEval(aggregation, hasAggregated);
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

  // Reveal the design-mapping panel only once there is enough data for it to
  // be a real discussion rather than a guess — this is the "why not simply
  // pool" content, grounded in the room's actual votes.
  const showDesignPanel = poll.total >= 3;
  predictDesignPanel.hidden = !showDesignPanel;
  if (showDesignPanel) {
    const groups = summarizePollByDesign(clients);
    predictDesignGroups.innerHTML = groups
      .map(
        (g) => `
        <div class="predict-design-card">
          <div class="predict-design-card-head">
            <span class="predict-design-card-label">${g.label}</span>
            <span class="predict-design-card-count">${g.count}</span>
          </div>
          <p>${g.pro}</p>
          <p class="con">${g.con}</p>
        </div>`,
      )
      .join("");
  }
}

function renderTopbar(clients, isPredictPhase) {
  phasePill.textContent = state.forceView === "predict" ? "predict" : state.meta.phase || "predict";
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
  participate: "#0c6b6f",
  flag: "#d99a2b",
  hold: "#ffffff",
  straggler: "#e7eaee",
  waiting: "#f3f5f7",
};

const STATUS_STROKE = {
  waiting: "#aab2c0",
  straggler: "#596579",
};

function renderMap(clients) {
  const width = 1000;
  const height = 480;
  if (!clients.length) {
    federationMap.innerHTML = `<svg viewBox="0 0 ${width} ${height}"><text x="50%" y="50%" text-anchor="middle" fill="#596579" font-size="20">No clients yet — show the JOIN QR, or populate demo clients.</text></svg>`;
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
      const stroke = client.suspicious ? "#c85446" : status === "hold" ? "#6b7fa8" : STATUS_STROKE[status] || "none";
      const dash = status === "hold" ? "3 3" : "0";
      const strokeWidth = client.suspicious ? 3 : 1.5;
      const glyph =
        status === "flag"
          ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" fill="#10243f">⚑</text>`
          : status === "straggler"
            ? `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" fill="#596579">⏱</text>`
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

function renderVectors(clients, aggregation, hasAggregated) {
  const width = 640;
  const height = 480;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) / 2 - 30;

  if (!hasAggregated) {
    vectorField.innerHTML = `<svg viewBox="0 0 ${width} ${height}"><text x="50%" y="50%" text-anchor="middle" fill="#596579" font-size="18">Click "Start Round 1" to aggregate and reveal the update vectors.</text></svg>`;
    return;
  }

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
      const color = client.suspicious ? "#c85446" : client.rarePopulation ? "#d99a2b" : "#0c6b6f";
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
      <line x1="20" y1="${cy}" x2="${width - 20}" y2="${cy}" stroke="#d7e0e4"></line>
      <line x1="${cx}" y1="20" x2="${cx}" y2="${height - 20}" stroke="#d7e0e4"></line>
      ${clientArrows}
      <line x1="${cx}" y1="${cy}" x2="${gTipX.toFixed(1)}" y2="${gTipY.toFixed(1)}" stroke="#10243f" stroke-width="5" stroke-linecap="round"></line>
      <polygon points="${arrowPath(cx, cy, gTipX, gTipY, 12)}" fill="#10243f"></polygon>
      <circle cx="${cx}" cy="${cy}" r="5" fill="#10243f" stroke="#ffffff" stroke-width="2"></circle>
      <text x="${cx}" y="${height - 8}" text-anchor="middle" font-size="12" fill="#596579">shared model · aggregated update norm ≈ ${globalNorm.toFixed(2)}</text>
    </svg>`;
}

function renderWeights(clients, aggregation, strategyKey, hasAggregated) {
  if (!hasAggregated) {
    weightsEquation.innerHTML = "";
    weightsBars.innerHTML = `<p style="color:#596579;font-size:0.85rem">Waiting for "Start Round 1"…</p>`;
    weightsHeadline.textContent = "Largest client weight: —";
    return;
  }

  const byId = Object.fromEntries(clients.map((c) => [c.id, c]));
  const rows = [...aggregation.weights.entries()].sort((a, b) => b[1] - a[1]);
  const top = rows.slice(0, 8);
  const restWeight = rows.slice(8).reduce((s, [, w]) => s + w, 0);
  const maxWeight = rows.length ? rows[0][1] : 0;

  const strategy = AGGREGATION_STRATEGIES[strategyKey];
  weightsEquation.innerHTML =
    strategyKey === "median"
      ? `w<sub>t+1</sub> = coordinate-median { w<sub>t+1</sub><sup>(k)</sup> }<br><span style="color:#596579;font-size:0.78rem">${strategy.teachingPoint}</span>`
      : `w<sub>t+1</sub> = Σ<sub>k</sub> (n<sub>k</sub> / Σ<sub>j</sub> n<sub>j</sub>) · w<sub>t+1</sub><sup>(k)</sup><br><span style="color:#596579;font-size:0.78rem">${strategy.teachingPoint}</span>`;

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

function renderEval(aggregation, hasAggregated) {
  if (!hasAggregated) {
    evalCards.innerHTML = `<p style="color:#596579;font-size:0.85rem">Waiting for "Start Round 1"…</p>`;
    evalMean.textContent = "—";
    evalWorst.textContent = "—";
    return;
  }

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
  // The score is the number a back-of-room reader needs first; the
  // hospital name is a smaller caption underneath rather than inline text,
  // so a long label (e.g. "Rare subgroup hospital") wraps without pushing
  // the panel past its fixed height budget.
  evalWorst.innerHTML = `${evaluation.worst.performance.toFixed(2)}<span class="worst-label">${evaluation.worst.label}</span>`;
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

  if (kind === "rare") {
    // injectRareHospital *transforms* a hospital into a small, divergent
    // one — picking a client that is already small/rare would make the
    // before/after barely move. Pick the largest-influence participating
    // client that isn't already flagged rare, so the contrast is obvious:
    // a hospital that mattered a lot, suddenly barely counts at all.
    const byInfluence = arr
      .filter((c) => participating(c) && !c.rarePopulation)
      .sort((a, b) => (b.nTrain || 0) - (a.nTrain || 0));
    const candidate = byInfluence[0] || arr.find(participating) || arr[0];
    state.eventTargets[kind] = candidate.id;
    return candidate.id;
  }

  const archetypeFor = { giant: "academic", suspicious: "noisy" }[kind];

  const candidate =
    arr.find((c) => c.archetype === archetypeFor && participating(c)) ||
    arr.find((c) => participating(c)) ||
    arr.find((c) => c.archetype === archetypeFor) ||
    arr[0];

  state.eventTargets[kind] = candidate.id;
  return candidate.id;
}

function snapshotStats(clients, strategyKey, targetId) {
  const aggregation = runAggregation(strategyKey, clients, { maxNorm: 1.6 });
  const evaluation = evaluateGlobalUpdate(aggregation.globalDelta || [0, 0]);
  const weights = [...aggregation.weights.values()];
  const maxWeight = weights.length ? Math.max(...weights) : 0;
  const targetWeight = aggregation.weights.get(targetId) || 0;
  const targetRecord = clients.find((c) => c.id === targetId) || {};
  const rareEnv = evaluation.perEnvironment.find((e) => e.key === "raresubgroup");
  return {
    evaluation,
    maxWeight,
    targetWeight,
    nTrain: targetRecord.nTrain,
    updateNorm: targetRecord.updateNorm,
    rarePerf: rareEnv ? rareEnv.performance : null,
  };
}

async function runEvent(kind) {
  const id = pickEventTarget(kind);
  if (!id) {
    window.alert("No clients yet. Populate demo clients or wait for students to join before running a teaching event.");
    return;
  }
  const strategyKey = state.meta.aggregation || "fedavg";
  const clientsBefore = clientsArray();
  const before = snapshotStats(clientsBefore, strategyKey, id);

  const rec = { id, ...state.clients[id] };
  let patch = {};
  if (kind === "giant") {
    const [patched] = injectGiantHospital([rec], id);
    patch = { nTrain: patched.nTrain, archetypeNote: patched.archetypeNote };
  } else if (kind === "rare") {
    const [patched] = injectRareHospital([rec], id);
    patch = {
      rarePopulation: patched.rarePopulation,
      nTrain: patched.nTrain,
      delta: patched.delta,
      updateNorm: patched.updateNorm,
      archetypeNote: patched.archetypeNote,
    };
  } else if (kind === "suspicious") {
    const [patched] = injectSuspiciousUpdate([rec], id);
    patch = { delta: patched.delta, updateNorm: patched.updateNorm, suspicious: patched.suspicious };
  }

  // Compute "after" from the patch applied locally, so the effect banner
  // reflects exactly this click rather than whatever watchClients happens
  // to deliver next (which could lag on a real backend, or race with other
  // students' decisions arriving at the same moment).
  const clientsAfter = clientsBefore.map((c) => (c.id === id ? { ...c, ...patch } : c));
  const after = snapshotStats(clientsAfter, strategyKey, id);

  await state.backend.upsertClient(state.sessionCode, id, patch);
  await state.backend.setMeta(state.sessionCode, { event: kind, eventClientId: id });

  renderEventEffect(kind, id, before, after);
}

const EVENT_TITLES = {
  giant: "Event A · Giant hospital",
  rare: "Event B · Rare hospital",
  suspicious: "Event C · Suspicious update",
};

function pct(w) {
  return `${Math.round(w * 1000) / 10}%`;
}

function score(v) {
  return v == null ? "—" : v.toFixed(2);
}

function effectRow(label, beforeVal, afterVal, { better, worse } = {}) {
  let cls = "";
  if (typeof better === "boolean") cls = better ? "better" : worse ? "worse" : "";
  return `
    <div class="event-effect-row">
      <span class="event-effect-row-label">${label}</span>
      <div class="event-effect-row-values ${cls}">
        <span class="before">${beforeVal}</span>
        <span class="event-effect-row-arrow">→</span>
        <span class="after">${afterVal}</span>
      </div>
    </div>`;
}

function renderEventEffect(kind, targetId, before, after) {
  eventEffectTitle.textContent = `${EVENT_TITLES[kind] || kind} — Client #${clientDisplayNumber(targetId)}`;

  let rows = "";
  if (kind === "rare") {
    rows =
      effectRow("This hospital's weight", pct(before.targetWeight), pct(after.targetWeight), {
        better: false,
        worse: after.targetWeight < before.targetWeight,
      }) +
      effectRow("Mean performance", score(before.evaluation.mean), score(after.evaluation.mean), {
        better: after.evaluation.mean >= before.evaluation.mean,
        worse: after.evaluation.mean < before.evaluation.mean,
      }) +
      effectRow("Rare-subgroup site", score(before.rarePerf), score(after.rarePerf), {
        better: after.rarePerf >= before.rarePerf,
        worse: after.rarePerf < before.rarePerf,
      }) +
      effectRow(
        "Worst site",
        `${score(before.evaluation.worst.performance)} (${before.evaluation.worst.label})`,
        `${score(after.evaluation.worst.performance)} (${after.evaluation.worst.label})`,
      );
  } else if (kind === "giant") {
    rows =
      effectRow("This hospital's weight", pct(before.targetWeight), pct(after.targetWeight), {
        better: false,
        worse: after.targetWeight > before.targetWeight,
      }) +
      effectRow("Largest client weight", pct(before.maxWeight), pct(after.maxWeight), {
        better: false,
        worse: after.maxWeight > before.maxWeight,
      });
  } else if (kind === "suspicious") {
    rows =
      effectRow("This hospital's update norm", score(before.updateNorm), score(after.updateNorm), {
        better: false,
        worse: after.updateNorm > before.updateNorm,
      }) +
      effectRow("Mean performance", score(before.evaluation.mean), score(after.evaluation.mean), {
        better: after.evaluation.mean >= before.evaluation.mean,
        worse: after.evaluation.mean < before.evaluation.mean,
      }) +
      effectRow(
        "Worst site",
        `${score(before.evaluation.worst.performance)} (${before.evaluation.worst.label})`,
        `${score(after.evaluation.worst.performance)} (${after.evaluation.worst.label})`,
      );
  }
  eventEffectRows.innerHTML = rows;
  eventEffectBanner.hidden = false;
  clearTimeout(state.eventEffectTimer);
  state.eventEffectTimer = setTimeout(() => {
    eventEffectBanner.hidden = true;
  }, 18000);
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
  { label: "3 · Why not pool", line: "Point at the 'What this means' panel under the poll bars. Ask who voted to pool the data, then click Reveal federation map." },
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

function closeQr() {
  qrOverlay.hidden = true;
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
  $("qr-close").addEventListener("click", closeQr);
  $("event-effect-close").addEventListener("click", () => {
    clearTimeout(state.eventEffectTimer);
    eventEffectBanner.hidden = true;
  });
  // The QR overlay covers the whole screen, so give it two more obvious
  // ways out beyond finding the small "Close" button: clicking the dark
  // backdrop, and pressing Escape.
  qrOverlay.addEventListener("click", (event) => {
    if (event.target === qrOverlay) closeQr();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !qrOverlay.hidden) closeQr();
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
