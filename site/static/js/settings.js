const toggle = document.getElementById("toggle-analysis");
const statusText = document.getElementById("status-text");

const goodSlider = document.getElementById("good-threshold");
const badSlider = document.getElementById("bad-threshold");
const goodValue = document.getElementById("good-value");
const badValue = document.getElementById("bad-value");
const goodLabel = document.getElementById("good-label");
const badLabel = document.getElementById("bad-label");

const realisticMode = document.getElementById("realistic-mode");
const updateSpeed = document.getElementById("update-speed");
const speedValue = document.getElementById("speed-value");

const saveBtn = document.getElementById("save-settings");
const resetBtn = document.getElementById("reset-settings");

const DEFAULT_SETTINGS = {
  analysis_running: true,
  good_threshold: 800,
  bad_threshold: 1200,
  realistic_mode: true,
  update_speed: 1
};

/* ---------- Load ---------- */
async function loadSettings() {
  try {
    const res = await fetch("/api/settings");
    const data = await res.json();
    applySettings(data);
  } catch {
    applySettings(DEFAULT_SETTINGS);
  }
}

/* ---------- Apply ---------- */
function applySettings(s) {
  toggle.checked = s.analysis_running ?? DEFAULT_SETTINGS.analysis_running;
  goodSlider.value = s.good_threshold ?? DEFAULT_SETTINGS.good_threshold;
  badSlider.value = s.bad_threshold ?? DEFAULT_SETTINGS.bad_threshold;
  realisticMode.checked = s.realistic_mode ?? DEFAULT_SETTINGS.realistic_mode;
  updateSpeed.value = s.update_speed ?? DEFAULT_SETTINGS.update_speed;

  updateTexts();
  updateVisualization();
}

/* ---------- UI ---------- */
function updateTexts() {
  statusText.textContent = toggle.checked
    ? "L'analyse en direct est activée"
    : "L'analyse en direct est désactivée";
  statusText.style.color = toggle.checked ? "#4ade80" : "#9ca3af";

  goodValue.textContent = `${goodSlider.value} ppm`;
  badValue.textContent = `${badSlider.value} ppm`;
  speedValue.textContent = `${updateSpeed.value} secondes`;

  goodLabel.textContent = goodSlider.value;
  badLabel.textContent = badSlider.value;
}

/* ---------- Threshold bar ---------- */
function updateVisualization() {
  const good = +goodSlider.value;
  const bad = +badSlider.value;

  const goodW = ((good - 400) / 1600) * 100;
  const midW = ((bad - good) / 1600) * 100;
  const badW = 100 - goodW - midW;

  document.querySelector(".good-seg").style.width = `${goodW}%`;
  document.querySelector(".medium-seg").style.width = `${midW}%`;
  document.querySelector(".bad-seg").style.width = `${badW}%`;
}

/* ---------- Save ---------- */
async function saveSettings() {
  const payload = {
    analysis_running: toggle.checked,
    good_threshold: +goodSlider.value,
    bad_threshold: +badSlider.value,
    realistic_mode: realisticMode.checked
  };

  try {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    saveBtn.textContent = "✓ Enregistré";
    setTimeout(() => (saveBtn.textContent = "💾 Enregistrer"), 1500);
  } catch {
    alert("Erreur lors de l'enregistrement");
  }
}

/* ---------- Reset ---------- */
function resetSettings() {
  applySettings(DEFAULT_SETTINGS);
  saveSettings();
}

/* ---------- Events ---------- */
goodSlider.addEventListener("input", () => {
  if (+goodSlider.value >= +badSlider.value) {
    badSlider.value = +goodSlider.value + 50;
  }
  updateTexts();
  updateVisualization();
});

badSlider.addEventListener("input", () => {
  if (+badSlider.value <= +goodSlider.value) {
    goodSlider.value = +badSlider.value - 50;
  }
  updateTexts();
  updateVisualization();
});

toggle.addEventListener("change", updateTexts);
updateSpeed.addEventListener("input", updateTexts);

saveBtn.addEventListener("click", saveSettings);
resetBtn.addEventListener("click", resetSettings);

/* ---------- Init ---------- */
loadSettings();
