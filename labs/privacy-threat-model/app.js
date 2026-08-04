const prompts = {
  updates: "Can gradients or parameters reveal patient-like features? Which privacy layer limits this, and what utility trade-off is accepted?",
  counts: "Are low counts, per-site metrics, or subgroup cells disclosive? Who approves suppression thresholds?",
  logs: "Do orchestration logs contain IPs, timestamps, failures, software versions, or site participation patterns?",
  participants: "What happens if a participant submits poisoned updates or probes others through repeated rounds?",
  release: "Does public model release change membership-inference, extraction, or re-identification risk?"
};

const controls = document.querySelectorAll("input[data-topic]");
const promptBox = document.getElementById("prompts");
const map = document.getElementById("map");

controls.forEach((control) => control.addEventListener("change", update));

function activeTopics() {
  return [...controls].filter((control) => control.checked).map((control) => control.dataset.topic);
}

function update() {
  const active = activeTopics();
  promptBox.innerHTML = active.map((topic) => `<article>${prompts[topic]}</article>`).join("");
  const lineClass = (topic) => active.includes(topic) ? "flow active" : "flow";
  map.innerHTML = `
    <style>
      .box { fill: #ffffff; stroke: #d7e0e4; stroke-width: 2; }
      .server { fill: #edf4f2; stroke: #0c6b6f; stroke-width: 3; }
      .label { fill: #10243f; font: 800 18px system-ui, sans-serif; text-anchor: middle; }
      .small { fill: #596579; font: 13px system-ui, sans-serif; text-anchor: middle; }
      .flow { stroke: #c9d2d8; stroke-width: 5; fill: none; marker-end: url(#arrow); }
      .flow.active { stroke: #c85446; }
    </style>
    <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#c85446"></path></marker></defs>
    <rect x="38" y="86" width="156" height="86" rx="10" class="box"></rect>
    <text x="116" y="124" class="label">Hospital A</text><text x="116" y="148" class="small">raw data local</text>
    <rect x="38" y="248" width="156" height="86" rx="10" class="box"></rect>
    <text x="116" y="286" class="label">Hospital B</text><text x="116" y="310" class="small">raw data local</text>
    <rect x="322" y="164" width="176" height="98" rx="12" class="server"></rect>
    <text x="410" y="204" class="label">Coordinator</text><text x="410" y="230" class="small">updates, metrics, logs</text>
    <rect x="612" y="86" width="150" height="86" rx="10" class="box"></rect>
    <text x="687" y="124" class="label">Readers</text><text x="687" y="148" class="small">reports</text>
    <rect x="612" y="248" width="150" height="86" rx="10" class="box"></rect>
    <text x="687" y="286" class="label">Model use</text><text x="687" y="310" class="small">release / API</text>
    <path d="M194 129 C254 129 269 188 322 199" class="${lineClass("updates")}"></path>
    <path d="M194 291 C254 291 269 238 322 226" class="${lineClass("updates")}"></path>
    <path d="M498 198 C558 172 566 132 612 128" class="${lineClass("counts")}"></path>
    <path d="M498 230 C560 250 570 285 612 290" class="${lineClass("release")}"></path>
    <path d="M410 262 C410 322 490 362 608 364" class="${lineClass("logs")}"></path>
    <text x="618" y="368" class="small">audit trail</text>
    <path d="M116 248 C108 210 108 194 116 172" class="${lineClass("participants")}"></path>
  `;
}

update();
