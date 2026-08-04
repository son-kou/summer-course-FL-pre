const mix = document.getElementById("mix");
const heterogeneity = document.getElementById("heterogeneity");
const localData = document.getElementById("localData");
const svg = document.getElementById("curve");
const globalOut = document.getElementById("global");
const worstOut = document.getElementById("worst");
const advice = document.getElementById("advice");

[mix, heterogeneity, localData].forEach((control) => control.addEventListener("input", update));

function scoreAt(x, h, data, kind) {
  const shared = x / 100;
  const local = 1 - shared;
  const dataBonus = data / 100;
  const mismatch = h / 100;
  if (kind === "mean") {
    return 0.71 + 0.13 * Math.exp(-Math.pow(shared - 0.58, 2) / 0.08) + 0.03 * dataBonus - 0.04 * mismatch * shared;
  }
  return 0.63 + 0.16 * Math.exp(-Math.pow(shared - (0.38 + 0.22 * dataBonus), 2) / 0.075) - 0.11 * mismatch * shared - 0.05 * local * (1 - dataBonus);
}

function pathFor(kind, h, data) {
  const points = [];
  for (let x = 0; x <= 100; x += 3) {
    const score = scoreAt(x, h, data, kind);
    points.push([80 + x * 6.3, 390 - (score - 0.5) * 740]);
  }
  return points.map((point, index) => `${index ? "L" : "M"} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" ");
}

function update() {
  const m = Number(mix.value);
  const h = Number(heterogeneity.value);
  const data = Number(localData.value);
  const meanScore = scoreAt(m, h, data, "mean");
  const worstScore = scoreAt(m, h, data, "worst");
  const x = 80 + m * 6.3;

  globalOut.textContent = meanScore.toFixed(2);
  worstOut.textContent = worstScore.toFixed(2);
  advice.textContent = worstScore < 0.72 ? "Do not average away the vulnerable site." : meanScore - worstScore > 0.08 ? "Inspect site-specific calibration." : "Shared model may be acceptable, but validate per site.";

  svg.innerHTML = `
    <style>
      .axis { stroke: #9ba8b4; stroke-width: 1.4; }
      .grid { stroke: #d7e0e4; stroke-width: 1; }
      .mean { fill: none; stroke: #0c6b6f; stroke-width: 5; }
      .worst { fill: none; stroke: #c85446; stroke-width: 5; }
      .label { fill: #596579; font: 15px system-ui, sans-serif; }
      .title { fill: #10243f; font: 800 18px system-ui, sans-serif; }
    </style>
    <text x="80" y="34" class="title">Conceptual performance across the shared-local spectrum</text>
    <line x1="80" y1="390" x2="710" y2="390" class="axis"></line>
    <line x1="80" y1="390" x2="80" y2="70" class="axis"></line>
    <line x1="80" y1="168" x2="710" y2="168" class="grid"></line>
    <line x1="80" y1="279" x2="710" y2="279" class="grid"></line>
    <text x="82" y="424" class="label">local only</text>
    <text x="609" y="424" class="label">shared only</text>
    <text x="94" y="92" class="label">better</text>
    <path class="mean" d="${pathFor("mean", h, data)}"></path>
    <path class="worst" d="${pathFor("worst", h, data)}"></path>
    <line x1="${x}" y1="64" x2="${x}" y2="390" stroke="#10243f" stroke-width="2" stroke-dasharray="8 8"></line>
    <circle cx="${x}" cy="${390 - (meanScore - 0.5) * 740}" r="8" fill="#0c6b6f"></circle>
    <circle cx="${x}" cy="${390 - (worstScore - 0.5) * 740}" r="8" fill="#c85446"></circle>
    <rect x="500" y="70" width="192" height="74" rx="8" fill="#ffffff" stroke="#d7e0e4"></rect>
    <line x1="516" y1="96" x2="556" y2="96" stroke="#0c6b6f" stroke-width="5"></line><text x="566" y="101" class="label">mean site</text>
    <line x1="516" y1="125" x2="556" y2="125" stroke="#c85446" stroke-width="5"></line><text x="566" y="130" class="label">worst site</text>
  `;
}

update();
