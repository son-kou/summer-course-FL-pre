const state = {
  sites: [
    { name: "Hospital A", n: 900, prevalence: 0.18, shift: 0.12, labelNoise: 0.05, color: "#0c6b6f" },
    { name: "Hospital B", n: 420, prevalence: 0.31, shift: 0.34, labelNoise: 0.08, color: "#d99a2b" },
    { name: "Hospital C", n: 150, prevalence: 0.47, shift: 0.62, labelNoise: 0.14, color: "#c85446" }
  ]
};

const controls = {
  heterogeneity: document.getElementById("heterogeneity"),
  imbalance: document.getElementById("imbalance"),
  privacy: document.getElementById("privacy"),
  strategy: document.getElementById("strategy")
};
const chart = document.getElementById("chart");
const sitesEl = document.getElementById("sites");
const takeaway = document.getElementById("takeaway");

function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

function siteMetrics(site, index) {
  const h = Number(controls.heterogeneity.value) / 100;
  const privacy = Number(controls.privacy.value) / 100;
  const strategy = controls.strategy.value;
  const distance = site.shift * h + site.labelNoise * 0.8 + Math.abs(site.prevalence - 0.25) * 0.35;
  let auroc = 0.9 - distance * (0.28 + index * 0.025) - privacy * 0.08;
  let calibration = 0.04 + distance * 0.18 + privacy * 0.06;

  if (strategy === "fedprox") {
    auroc += index === 2 ? 0.025 : 0.006;
    calibration -= 0.015;
  }
  if (strategy === "personalized") {
    auroc += site.shift > 0.3 ? 0.045 : 0.01;
    calibration -= site.shift > 0.3 ? 0.025 : 0.006;
  }
  if (strategy === "harmonize") {
    auroc += 0.035;
    calibration -= 0.035;
  }

  return {
    ...site,
    auroc: clamp(auroc, 0.52, 0.93),
    calibration: clamp(calibration, 0.02, 0.24)
  };
}

function weightedAverage(metrics) {
  const total = metrics.reduce((sum, site) => sum + site.n, 0);
  return metrics.reduce((sum, site) => sum + site.auroc * site.n / total, 0);
}

function equalAverage(metrics) {
  return metrics.reduce((sum, site) => sum + site.auroc, 0) / metrics.length;
}

function updateSizes() {
  const imbalance = Number(controls.imbalance.value) / 100;
  state.sites[0].n = Math.round(360 + imbalance * 980);
  state.sites[1].n = Math.round(310 + (1 - Math.abs(imbalance - 0.45)) * 250);
  state.sites[2].n = Math.round(280 - imbalance * 155);
}

function drawChart(metrics) {
  const left = 86;
  const top = 48;
  const bottom = 382;
  const barWidth = 96;
  const gap = 86;
  const minY = 0.5;
  const maxY = 0.95;

  let svg = `
    <title id="chart-title">AUROC by site</title>
    <desc id="chart-desc">Bar chart comparing site-level and global model performance.</desc>
    <rect x="0" y="0" width="920" height="470" fill="#ffffff"></rect>
    <text x="${left}" y="30" fill="#172033" font-size="24" font-weight="700">AUROC by site</text>
  `;

  for (let tick = 0.55; tick <= 0.95; tick += 0.1) {
    const y = bottom - ((tick - minY) / (maxY - minY)) * (bottom - top);
    svg += `
      <line x1="${left}" y1="${y.toFixed(1)}" x2="874" y2="${y.toFixed(1)}" stroke="#cfd8dd" stroke-width="2"></line>
      <text x="28" y="${(y + 5).toFixed(1)}" fill="#596579" font-size="16">${tick.toFixed(2)}</text>
    `;
  }

  metrics.forEach((site, i) => {
    const x = left + 48 + i * (barWidth + gap);
    const height = ((site.auroc - minY) / (maxY - minY)) * (bottom - top);
    const y = bottom - height;
    svg += `
      <rect x="${x}" y="${y.toFixed(1)}" width="${barWidth}" height="${height.toFixed(1)}" fill="${site.color}" rx="4"></rect>
      <text x="${x + 24}" y="${(y - 10).toFixed(1)}" fill="#10243f" font-size="18" font-weight="700">${site.auroc.toFixed(2)}</text>
      <text x="${x + 16}" y="${bottom + 30}" fill="#10243f" font-size="16" font-weight="700">${site.name.replace("Hospital ", "Site ")}</text>
      <text x="${x + 25}" y="${bottom + 52}" fill="#172033" font-size="14">n=${site.n}</text>
    `;
  });

  const weighted = weightedAverage(metrics);
  const equal = equalAverage(metrics);
  const lineY = bottom - ((weighted - minY) / (maxY - minY)) * (bottom - top);
  svg += `
    <line x1="${left}" y1="${lineY.toFixed(1)}" x2="874" y2="${lineY.toFixed(1)}" stroke="#10243f" stroke-width="3" stroke-dasharray="10 8"></line>
    <text x="610" y="${(lineY - 10).toFixed(1)}" fill="#10243f" font-size="17" font-weight="700">Sample-weighted global ${weighted.toFixed(2)}</text>
    <text x="650" y="${bottom + 30}" fill="#10243f" font-size="17" font-weight="700">Equal-site average ${equal.toFixed(2)}</text>
  `;
  chart.innerHTML = svg;
}

function renderSites(metrics) {
  sitesEl.innerHTML = metrics.map((site) => `
    <article class="site-card">
      <h2>${site.name}</h2>
      <p>${site.n} patients; prevalence ${(site.prevalence * 100).toFixed(0)}%; measurement shift ${(site.shift * 100).toFixed(0)}%.</p>
      <div class="metric"><span>AUROC</span><strong>${site.auroc.toFixed(2)}</strong></div>
      <div class="metric"><span>Calibration error</span><strong>${site.calibration.toFixed(2)}</strong></div>
      <div class="metric"><span>Label noise</span><strong>${(site.labelNoise * 100).toFixed(0)}%</strong></div>
    </article>
  `).join("");
}

function renderTakeaway(metrics) {
  const weighted = weightedAverage(metrics);
  const worst = Math.min(...metrics.map((site) => site.auroc));
  const gap = weighted - worst;
  const strategy = controls.strategy.options[controls.strategy.selectedIndex].text;
  const warning = gap > 0.12
    ? "The global number looks acceptable, but the worst site is far behind."
    : "The site gap is smaller, but per-site reporting is still necessary.";
  takeaway.textContent = `${strategy}: sample-weighted global AUROC ${weighted.toFixed(2)}, worst-site AUROC ${worst.toFixed(2)}. ${warning}`;
}

function render() {
  updateSizes();
  const metrics = state.sites.map(siteMetrics);
  drawChart(metrics);
  renderSites(metrics);
  renderTakeaway(metrics);
}

function randomizeSites() {
  state.sites.forEach((site, index) => {
    site.prevalence = clamp(0.12 + Math.random() * 0.42, 0.08, 0.62);
    site.shift = clamp(0.08 + Math.random() * (0.28 + index * 0.2), 0.04, 0.85);
    site.labelNoise = clamp(0.03 + Math.random() * 0.16, 0.02, 0.22);
  });
  render();
}

function reset() {
  controls.heterogeneity.value = 55;
  controls.imbalance.value = 60;
  controls.privacy.value = 12;
  controls.strategy.value = "fedavg";
  state.sites = [
    { name: "Hospital A", n: 900, prevalence: 0.18, shift: 0.12, labelNoise: 0.05, color: "#0c6b6f" },
    { name: "Hospital B", n: 420, prevalence: 0.31, shift: 0.34, labelNoise: 0.08, color: "#d99a2b" },
    { name: "Hospital C", n: 150, prevalence: 0.47, shift: 0.62, labelNoise: 0.14, color: "#c85446" }
  ];
  render();
}

Object.values(controls).forEach((control) => control.addEventListener("input", render));
document.getElementById("randomize").addEventListener("click", randomizeSites);
document.getElementById("reset").addEventListener("click", reset);
document.getElementById("copy").addEventListener("click", async (event) => {
  await navigator.clipboard.writeText(takeaway.textContent);
  event.target.textContent = "Copied";
  setTimeout(() => (event.target.textContent = "Copy Summary"), 1200);
});

render();
