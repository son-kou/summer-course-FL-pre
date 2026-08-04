const sites = ["A", "B", "C", "D", "Unseen"];
const base = [0.86, 0.84, 0.82, 0.79, 0.81];
const sensitivity = [0.04, 0.08, 0.13, 0.19, 0.28];
const shift = document.getElementById("shift");
const abstain = document.getElementById("abstain");
const chart = document.getElementById("chart");
const readout = document.getElementById("readout");

[shift, abstain].forEach((control) => control.addEventListener("input", update));

function update() {
  const s = Number(shift.value) / 100;
  const a = Number(abstain.value) / 100;
  const metrics = base.map((value, index) => Math.max(0.5, value - sensitivity[index] * s + 0.06 * a * (0.5 + sensitivity[index])));
  const abstentionRate = Math.round((a * 0.22 + s * 0.08) * 100);
  const global = metrics.reduce((sum, value) => sum + value, 0) / metrics.length;
  const worst = Math.min(...metrics);
  const worstSite = sites[metrics.indexOf(worst)];
  const calibrationGap = Math.round((0.04 + s * 0.18 - a * 0.05) * 100);

  const bars = metrics.map((value, index) => {
    const x = 92 + index * 130;
    const h = (value - 0.5) * 680;
    const y = 362 - h;
    const color = value === worst ? "#c85446" : index === 4 ? "#d99a2b" : "#0c6b6f";
    return `
      <rect x="${x}" y="${y}" width="68" height="${h}" rx="6" fill="${color}"></rect>
      <text x="${x + 34}" y="${y - 12}" class="metric">${value.toFixed(2)}</text>
      <text x="${x + 34}" y="392" class="label">${sites[index]}</text>
    `;
  }).join("");

  chart.innerHTML = `
    <style>
      .axis { stroke: #9ba8b4; stroke-width: 1.4; }
      .grid { stroke: #d7e0e4; stroke-width: 1; }
      .label { fill: #596579; font: 15px system-ui, sans-serif; text-anchor: middle; }
      .metric { fill: #10243f; font: 900 17px system-ui, sans-serif; text-anchor: middle; }
      .title { fill: #10243f; font: 800 18px system-ui, sans-serif; }
    </style>
    <text x="72" y="34" class="title">Per-site performance under distribution shift</text>
    <line x1="72" y1="362" x2="740" y2="362" class="axis"></line>
    <line x1="72" y1="362" x2="72" y2="70" class="axis"></line>
    <line x1="72" y1="158" x2="740" y2="158" class="grid"></line>
    <line x1="72" y1="260" x2="740" y2="260" class="grid"></line>
    <text x="16" y="82" class="label">1.0</text>
    <text x="16" y="365" class="label">0.5</text>
    ${bars}
  `;
  readout.textContent = `Global: ${global.toFixed(2)}. Worst site: ${worstSite} (${worst.toFixed(2)}). Calibration gap: about ${calibrationGap} points. Abstention: ${abstentionRate}% of cases need a handoff rule.`;
}

update();
