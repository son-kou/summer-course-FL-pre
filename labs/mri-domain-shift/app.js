const controls = {
  intensity: document.getElementById("intensity"),
  contrast: document.getElementById("contrast"),
  noise: document.getElementById("noiseControl"),
  blur: document.getElementById("blur"),
  bias: document.getElementById("biasControl"),
  compare: document.getElementById("compare"),
  threshold: document.getElementById("threshold"),
  prevalence: document.getElementById("prevalence"),
  labelNoise: document.getElementById("labelNoise")
};

const scan = document.getElementById("scan");
const noise = document.getElementById("noise");
const bias = document.getElementById("bias");
const split = document.getElementById("split");
const readout = document.getElementById("readout");

Object.values(controls).forEach((control) => control.addEventListener("input", update));
document.getElementById("reset").addEventListener("click", () => {
  controls.intensity.value = 100;
  controls.contrast.value = 100;
  controls.noise.value = 12;
  controls.blur.value = 0;
  controls.bias.value = 18;
  controls.compare.checked = false;
  controls.threshold.value = 55;
  controls.prevalence.value = 18;
  controls.labelNoise.value = 4;
  update();
});

function update() {
  const brightness = controls.intensity.value / 100;
  const contrast = controls.contrast.value / 100;
  const blur = Number(controls.blur.value);
  const saturation = 0.95 + (controls.contrast.value - 100) / 280;
  scan.style.filter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) blur(${blur}px)`;
  noise.style.opacity = controls.noise.value / 100;
  bias.style.opacity = controls.bias.value / 100;
  split.classList.toggle("on", controls.compare.checked);

  const apparentPositive = Math.max(4, Math.min(96,
    Number(controls.prevalence.value) +
    (Number(controls.intensity.value) - 100) * 0.18 +
    (Number(controls.contrast.value) - 100) * 0.11 -
    (Number(controls.threshold.value) - 55) * 0.42 +
    Number(controls.labelNoise.value) * 0.36
  ));
  const calibrationDrift = Math.abs(apparentPositive - Number(controls.prevalence.value));
  readout.textContent = `Illustrative apparent-positive rate: ${apparentPositive.toFixed(1)}%. Calibration pressure: ${calibrationDrift < 8 ? "low" : calibrationDrift < 18 ? "moderate" : "high"}.`;
}

update();
