const modalities = ["MRI", "CT", "EHR", "Pathology", "Genomics"];
const sites = [
  { name: "Site A", values: [true, false, true, false, false] },
  { name: "Site B", values: [true, true, true, false, false] },
  { name: "Site C", values: [false, true, true, true, false] },
  { name: "Site D", values: [true, false, false, true, true] },
  { name: "Site E", values: [false, false, true, false, true] }
];

const matrix = document.getElementById("matrix");
const recommendations = document.getElementById("recommendations");

function renderMatrix() {
  matrix.innerHTML = `<div class="cell head">Hospital</div>${modalities.map((name) => `<div class="cell head">${name}</div>`).join("")}`;
  sites.forEach((site, row) => {
    matrix.insertAdjacentHTML("beforeend", `<div class="cell site">${site.name}</div>`);
    site.values.forEach((checked, col) => {
      matrix.insertAdjacentHTML("beforeend", `<label class="cell"><input type="checkbox" data-row="${row}" data-col="${col}" ${checked ? "checked" : ""} aria-label="${site.name} has ${modalities[col]}"></label>`);
    });
  });
  matrix.querySelectorAll("input").forEach((input) => input.addEventListener("change", (event) => {
    const row = Number(event.target.dataset.row);
    const col = Number(event.target.dataset.col);
    sites[row].values[col] = event.target.checked;
    update();
  }));
}

function update() {
  const modalityCoverage = modalities.map((name, col) => ({
    name,
    count: sites.filter((site) => site.values[col]).length
  }));
  const completeRows = sites.filter((site) => site.values.every(Boolean)).length;
  const rare = modalityCoverage.filter((item) => item.count <= 2).map((item) => item.name);
  const common = modalityCoverage.filter((item) => item.count >= 4).map((item) => item.name);

  const cards = [
    {
      title: "Common-core design",
      body: common.length ? `The likely common core is ${common.join(", ")}. Report what clinical question this core can actually answer.` : "No modality is common enough for a simple shared core."
    },
    {
      title: "Modality-specific encoders",
      body: rare.length ? `${rare.join(", ")} need modality-specific encoders, partial aggregation, or local branches.` : "Coverage is broad enough to test shared encoders, but missingness still needs profiling."
    },
    {
      title: "Dropout, distillation, imputation",
      body: "Use missing-modality dropout and distillation as robustness tools; treat imputation/reconstruction as assumptions that need sensitivity analysis."
    },
    {
      title: "Bias check",
      body: completeRows ? `${completeRows} site(s) have all modalities. Complete-case analysis would mostly learn from them.` : "No site has all modalities, so complete-case analysis would fail outright."
    }
  ];

  recommendations.innerHTML = cards.map((card) => `<article><h3>${card.title}</h3><p>${card.body}</p></article>`).join("");
}

renderMatrix();
update();
