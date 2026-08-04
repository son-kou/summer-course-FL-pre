const sites = [
  { name: "Aarhus", patients: 132, quality: 0.92, prevalence: 0.18, update: 0.018 },
  { name: "Copenhagen", patients: 88, quality: 0.86, prevalence: 0.12, update: 0.026 },
  { name: "Odense", patients: 41, quality: 0.74, prevalence: 0.31, update: -0.006 },
  { name: "Aalborg", patients: 19, quality: 0.66, prevalence: 0.08, update: 0.041 }
];

const chart = document.getElementById("chart");
const aggregate = document.getElementById("aggregate");
const dominance = document.getElementById("dominance");
const quality = document.getElementById("quality");
const fairness = document.getElementById("fairness");
let mode = "sample";

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    document.querySelectorAll("[data-mode]").forEach((item) => item.classList.toggle("active", item === button));
    update();
  });
});

[quality, fairness].forEach((control) => control.addEventListener("change", update));

function weightsForSite(site) {
  let weight = mode === "equal" ? 1 : site.patients;
  if (mode === "quality" || quality.checked) weight *= site.quality;
  if (fairness.checked) weight *= Math.min(2.6, 0.18 / Math.max(site.prevalence, 0.03));
  return weight;
}

function barColor(value) {
  if (value < 0) return "#c85446";
  if (value > 0.03) return "#d99a2b";
  return "#0c6b6f";
}

function update() {
  const rawWeights = sites.map(weightsForSite);
  const totalWeight = rawWeights.reduce((sum, value) => sum + value, 0);
  const normalized = rawWeights.map((value) => value / totalWeight);
  const agg = sites.reduce((sum, site, index) => sum + site.update * normalized[index], 0);
  const maxWeight = Math.max(...normalized);

  aggregate.textContent = `${agg >= 0 ? "+" : ""}${agg.toFixed(3)}`;
  dominance.textContent = `${Math.round(maxWeight * 100)}%`;

  const rows = sites.map((site, index) => {
    const y = 72 + index * 78;
    const w = normalized[index] * 420;
    const deltaWidth = Math.abs(site.update) * 4200;
    const deltaX = site.update >= 0 ? 556 : 556 - deltaWidth;
    return `
      <text x="28" y="${y + 7}" class="site">${site.name}</text>
      <text x="28" y="${y + 29}" class="meta">n=${site.patients}  quality=${site.quality.toFixed(2)}  prevalence=${Math.round(site.prevalence * 100)}%</text>
      <rect x="190" y="${y - 15}" width="420" height="22" rx="4" fill="#edf4f2"></rect>
      <rect x="190" y="${y - 15}" width="${w}" height="22" rx="4" fill="#0c6b6f"></rect>
      <text x="${Math.min(596, 198 + w)}" y="${y + 2}" class="bar-label">${Math.round(normalized[index] * 100)}%</text>
      <line x1="556" y1="${y + 24}" x2="556" y2="${y + 52}" stroke="#9ba8b4"></line>
      <rect x="${deltaX}" y="${y + 31}" width="${deltaWidth}" height="13" rx="3" fill="${barColor(site.update)}"></rect>
      <text x="628" y="${y + 43}" class="delta">${site.update >= 0 ? "+" : ""}${site.update.toFixed(3)}</text>
    `;
  }).join("");

  chart.innerHTML = `
    <style>
      .axis { stroke: #aeb9c3; stroke-width: 1; }
      .site { fill: #10243f; font: 700 21px system-ui, sans-serif; }
      .meta, .caption { fill: #596579; font: 14px system-ui, sans-serif; }
      .bar-label { fill: #fff; font: 800 13px system-ui, sans-serif; text-anchor: end; }
      .delta { fill: #172033; font: 700 16px system-ui, sans-serif; }
      .agg { fill: #10243f; font: 900 26px system-ui, sans-serif; text-anchor: middle; }
    </style>
    <text x="28" y="32" class="caption">Left bars: normalized site weight. Right bars: local update direction.</text>
    <text x="400" y="32" class="caption">All values are illustrative.</text>
    <line x1="556" y1="52" x2="556" y2="382" class="axis"></line>
    ${rows}
    <line x1="${556 + agg * 4200}" y1="372" x2="${556 + agg * 4200}" y2="412" stroke="#10243f" stroke-width="5"></line>
    <text x="${556 + agg * 4200}" y="424" class="agg">${agg >= 0 ? "+" : ""}${agg.toFixed(3)}</text>
  `;
}

update();
