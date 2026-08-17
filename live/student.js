import { generateClient } from "./lib/simulation.js";
import { createBackend } from "./lib/backend.js";
import { getSessionCodeFromUrl, getOrCreateClientId, clientDisplayNumber } from "./lib/identity.js";
import { firebaseConfig } from "./firebase-config.js";
import { el, htmlToNode } from "./lib/dom.js";

const CONCERN_OPTIONS = [
  { key: "small-sample", label: "Small sample" },
  { key: "unusual-population", label: "Unusual population" },
  { key: "label-quality", label: "Label quality" },
  { key: "distribution-shift", label: "Distribution shift" },
  { key: "unusual-update", label: "Update looks unusual" },
  { key: "worse-performance", label: "Local performance worsened" },
  { key: "other", label: "Other / unsure" },
];

const ARCHETYPE_HOSPITAL_NAMES = {
  academic: "Regional Academic Centre",
  rural: "Rural District Hospital",
  scanner: "Alternate-Protocol Imaging Centre",
  labelshift: "Community Referral Hospital",
  specialist: "Specialist Diagnostic Centre",
  noisy: "General Hospital, Site Under Review",
  straggler: "Resource-Limited District Site",
  raresubgroup: "Rare-Disease Reference Centre",
};

const root = document.getElementById("screen-root");
const banner = document.getElementById("connection-banner");

const state = {
  sessionCode: null,
  clientId: null,
  client: null,
  backend: null,
  backendKind: "unknown",
  screen: "loading",
  selectedConcern: null,
};

function showBanner(message) {
  banner.textContent = message;
  banner.classList.add("visible");
}

function hideBanner() {
  banner.classList.remove("visible");
}

function renderArrowSvg(delta, { color = "#0c6b6f", maxDrawLength = 42 } = {}) {
  const [dx, dy] = delta;
  const norm = Math.hypot(dx, dy) || 1;
  const scale = Math.min(maxDrawLength / 1.4, maxDrawLength / norm) * 1.4;
  const drawLen = Math.min(maxDrawLength, norm * scale);
  const ux = dx / norm;
  const uy = dy / norm;
  const cx = 60;
  const cy = 60;
  const tipX = cx + ux * drawLen;
  const tipY = cy - uy * drawLen;
  const angle = Math.atan2(cy - tipY, tipX - cx);
  const headLen = 9;
  const leftX = tipX - headLen * Math.cos(angle - Math.PI / 7);
  const leftY = tipY + headLen * Math.sin(angle - Math.PI / 7);
  const rightX = tipX - headLen * Math.cos(angle + Math.PI / 7);
  const rightY = tipY + headLen * Math.sin(angle + Math.PI / 7);

  return `
    <svg viewBox="0 0 120 120" role="img" aria-label="Local model update direction, a two-dimensional projection of Δw">
      <circle cx="${cx}" cy="${cy}" r="3" fill="#10243f"></circle>
      <circle cx="${cx}" cy="${cy}" r="44" fill="none" stroke="#d7e0e4" stroke-dasharray="3 4"></circle>
      <line x1="${cx}" y1="${cy}" x2="${tipX.toFixed(2)}" y2="${tipY.toFixed(2)}" stroke="${color}" stroke-width="3" stroke-linecap="round"></line>
      <polygon points="${tipX.toFixed(2)},${tipY.toFixed(2)} ${leftX.toFixed(2)},${leftY.toFixed(2)} ${rightX.toFixed(2)},${rightY.toFixed(2)}" fill="${color}"></polygon>
      <text x="60" y="112" text-anchor="middle" font-size="8" fill="#596579">server / shared model at centre</text>
    </svg>
  `;
}

function screenWelcome() {
  root.replaceChildren(
    el("div", { class: "screen" }, [
      el("p", { class: "kicker", text: "Live classroom activity" }),
      el("h1", { class: "headline", text: "You are now a federated client." }),
      el("p", { class: "subhead", text: "Your hospital cannot send patient data to the central server." }),
      el("div", { class: "caveat-box" }, [
        "For teaching, your phone represents a federated client. The local training outcome has been simulated so we can inspect a full federation in a few minutes.",
      ]),
      el(
        "button",
        {
          class: "button button-primary",
          onclick: () => {
            joinSession();
          },
        },
        "Reveal my site",
      ),
    ]),
  );
}

function screenSite() {
  const client = state.client;
  const number = clientDisplayNumber(state.clientId);
  const hospitalName = ARCHETYPE_HOSPITAL_NAMES[client.archetype] || "Partner Hospital";

  root.replaceChildren(
    el("div", { class: "screen" }, [
      el("p", { class: "kicker", text: "Your simulated site" }),
      el("div", { class: "site-card" }, [
        el("span", { class: "site-id", text: `Client #${number}` }),
        el("h2", { text: hospitalName }),
        el("span", { class: "badge", text: client.rarePopulation ? "Rare-population site" : "Synthetic teaching profile" }),
        el("div", { class: "stat-grid" }, [
          stat("Patients (train)", client.nTrain),
          stat("Local validation set", `${client.nVal} patients`),
          stat("Positive prevalence", `${Math.round(client.prevalence * 100)}%`),
          stat("Label quality", qualityWord(client.dataQuality)),
          stat("Local AUROC", `${client.localMetricBefore.toFixed(2)} → ${client.localMetricAfter.toFixed(2)}`),
          stat("Local training", "✓ simulated"),
        ]),
        el("p", { class: "note-box", text: client.archetypeNote }),
      ]),
      el("div", { class: "callout-card arrow-figure" }, [
        el("p", { class: "stat-label", text: "Your simulated model-update direction (Δw, 2D projection)" }),
        htmlToNode(renderArrowSvg(client.delta)),
        el("p", { class: "arrow-caption", text: `Update norm ≈ ${client.updateNorm.toFixed(2)} (illustrative units)` }),
      ]),
      el("p", { class: "caveat-box" }, [
        "Local validation performance is shown for context only. It is not the thing that gets aggregated — the model update is. A real update has thousands to millions of numbers; this arrow is a 2D teaching projection.",
      ]),
      el(
        "button",
        { class: "button button-primary", onclick: () => setScreen("decide") },
        "Continue to my decision",
      ),
    ]),
  );
}

function stat(label, value) {
  return el("div", { class: "stat" }, [
    el("span", { class: "stat-label", text: label }),
    el("span", { class: "stat-value", text: String(value) }),
  ]);
}

function qualityWord(q) {
  if (q >= 0.85) return "High";
  if (q >= 0.7) return "Moderate";
  return "Limited";
}

function screenDecide() {
  root.replaceChildren(
    el("div", { class: "screen" }, [
      el("p", { class: "kicker", text: "Your decision" }),
      el("h1", { class: "headline", text: "Would this site participate in this round?" }),
      el("p", { class: "subhead" }, [
        "You represent both the local computational client and the local site investigator. Real production FL participation is governed by orchestration and protocol rules, not a human vote — this is a classroom simplification.",
      ]),
      el("div", { class: "decision-stack" }, [
        decisionButton("participate", "button-participate", "Participate", "Send my simulated update"),
        decisionButton("hold", "button-hold", "Hold this round", "Do not send my simulated update"),
        decisionButton("flag", "button-flag", "Participate + flag concern", "Send the update, but tell the coordinator something looks unusual"),
      ]),
    ]),
  );
}

function decisionButton(value, cls, title, detail) {
  return el(
    "button",
    {
      class: `button ${cls}`,
      onclick: () => {
        if (value === "flag") {
          setScreen("concern");
        } else {
          submitDecision(value, null);
        }
      },
    },
    [el("span", { text: title }), el("span", { class: "detail", text: detail })],
  );
}

function screenConcern() {
  root.replaceChildren(
    el("div", { class: "screen" }, [
      el("p", { class: "kicker", text: "Optional" }),
      el("h1", { class: "headline", text: "What looks unusual?" }),
      el(
        "div",
        { class: "concern-grid" },
        CONCERN_OPTIONS.map((option) =>
          el(
            "button",
            {
              class: "concern-chip",
              "aria-pressed": String(state.selectedConcern === option.key),
              onclick: () => {
                state.selectedConcern = option.key;
                screenConcern();
              },
            },
            option.label,
          ),
        ),
      ),
      el(
        "button",
        {
          class: "button button-primary",
          disabled: state.selectedConcern ? null : "",
          onclick: () => submitDecision("flag", state.selectedConcern),
        },
        "Send update with this concern",
      ),
    ]),
  );
}

function screenWaiting() {
  root.replaceChildren(
    el("div", { class: "screen" }, [
      el("div", { class: "callout-card", role: "status" }, [
        el("p", { class: "status-line" }, [el("span", { class: "spinner-dot" }), "Update decision received."]),
        el("h2", { text: "Look at the main screen to see your federation." }),
        el("p", { class: "subhead", text: "Thank you — your simulated hospital has reported in." }),
      ]),
    ]),
  );
}

function setScreen(name) {
  state.screen = name;
  if (name === "welcome") screenWelcome();
  else if (name === "site") screenSite();
  else if (name === "decide") screenDecide();
  else if (name === "concern") screenConcern();
  else if (name === "waiting") screenWaiting();
}

async function joinSession() {
  try {
    await state.backend.upsertClient(state.sessionCode, state.clientId, {
      joinedAt: Date.now(),
      archetype: state.client.archetype,
      archetypeLabel: state.client.archetypeLabel,
      nTrain: state.client.nTrain,
      nVal: state.client.nVal,
      prevalence: state.client.prevalence,
      updateNorm: state.client.updateNorm,
      delta: state.client.delta,
      localMetricBefore: state.client.localMetricBefore,
      localMetricAfter: state.client.localMetricAfter,
      rarePopulation: state.client.rarePopulation,
      suspicious: state.client.suspicious,
      straggler: state.client.straggler,
      decision: null,
    });
    hideBanner();
  } catch (error) {
    console.error(error);
    showBanner("Live connection unavailable. You can still explore your simulated site locally.");
  }
  setScreen("site");
}

async function submitDecision(decision, concern) {
  try {
    await state.backend.upsertClient(state.sessionCode, state.clientId, {
      decision,
      concern,
      decidedAt: Date.now(),
    });
    hideBanner();
  } catch (error) {
    console.error(error);
    showBanner("Live connection unavailable. Your decision is saved on this device only.");
  }
  setScreen("waiting");
}

async function boot() {
  try {
    let sessionCode = getSessionCodeFromUrl();
    const params = new URLSearchParams(window.location.search);
    const isDemo = params.get("demo") === "1";

    if (!sessionCode && isDemo) sessionCode = "FL-DEMO";

    if (!sessionCode) {
      renderCodeEntry();
      return;
    }

    state.sessionCode = sessionCode;
    state.clientId = getOrCreateClientId(sessionCode);
    state.client = generateClient(sessionCode, state.clientId);

    const { provider, kind } = await createBackend({ params, firebaseConfig });
    state.backend = provider;
    state.backendKind = kind;

    setScreen("welcome");
  } catch (error) {
    console.error(error);
    renderFatalFallback();
  }
}

function renderCodeEntry() {
  root.replaceChildren(
    el("div", { class: "screen" }, [
      el("p", { class: "kicker", text: "Join the federation" }),
      el("h1", { class: "headline", text: "Enter your session code" }),
      el("p", { class: "subhead", text: "Ask your instructor for the short code shown on the main screen, e.g. FL-4821." }),
      el("input", {
        id: "code-input",
        class: "callout-card",
        style: "width:100%;font-size:1.2rem;text-align:center;letter-spacing:0.08em;padding:14px",
        placeholder: "FL-0000",
        autocapitalize: "characters",
      }),
      el(
        "button",
        {
          class: "button button-primary",
          onclick: () => {
            const value = document.getElementById("code-input").value.trim().toUpperCase();
            if (!value) return;
            const url = new URL(window.location.href);
            url.searchParams.set("code", value);
            window.location.href = url.toString();
          },
        },
        "Join",
      ),
    ]),
  );
}

function renderFatalFallback() {
  root.replaceChildren(
    el("div", { class: "screen" }, [
      el("h1", { class: "headline", text: "You are now a federated client." }),
      el("div", { class: "note-box" }, [
        "This activity could not start correctly on this device. Please tell your instructor — the lecture continues either way using demo mode on the main screen.",
      ]),
    ]),
  );
}

window.addEventListener("error", () => {
  if (state.screen === "loading") renderFatalFallback();
});

boot();
