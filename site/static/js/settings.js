document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle-analysis");
  const goodSlider = document.getElementById("good-threshold");

  // Exit safely if not on settings page
  if (!toggle || !goodSlider) {
    return;
  }

  const statusText = document.getElementById("status-text");
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

  const DEFAULTS = {
    analysis_running: true,
    good_threshold: 800,
    bad_threshold: 1200,
    realistic_mode: true,
    update_speed: 2
  };

  function updateTexts() {
    statusText.textContent = toggle.checked
      ? "L'analyse en direct est activée"
      : "L'analyse en direct est désactivée";

    goodValue.textContent = `${goodSlider.value} ppm`;
    badValue.textContent = `${badSlider.value} ppm`;
    speedValue.textContent = `${updateSpeed.value} secondes`;

    goodLabel.textContent = goodSlider.value;
    badLabel.textContent = badSlider.value;
  }

  function updateVisualization() {
    const goodW = ((goodSlider.value - 400) / 1600) * 100;
    const midW = ((badSlider.value - goodSlider.value) / 1600) * 100;
    const badW = 100 - goodW - midW;

    document.querySelector(".good-seg").style.width = `${goodW}%`;
    document.querySelector(".medium-seg").style.width = `${midW}%`;
    document.querySelector(".bad-seg").style.width = `${badW}%`;
  }

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      const s = await res.json();

      toggle.checked = s.analysis_running;
      goodSlider.value = s.good_threshold;
      badSlider.value = s.bad_threshold;
      realisticMode.checked = s.realistic_mode;
      updateSpeed.value = s.update_speed;
    } catch {
      toggle.checked = DEFAULTS.analysis_running;
      goodSlider.value = DEFAULTS.good_threshold;
      badSlider.value = DEFAULTS.bad_threshold;
      realisticMode.checked = DEFAULTS.realistic_mode;
      updateSpeed.value = DEFAULTS.update_speed;
    }

    updateTexts();
    updateVisualization();
  }

  saveBtn.addEventListener("click", async () => {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis_running: toggle.checked,
        good_threshold: +goodSlider.value,
        bad_threshold: +badSlider.value,
        realistic_mode: realisticMode.checked,
        update_speed: +updateSpeed.value
      })
    });
  });

  resetBtn.addEventListener("click", loadSettings);

  [toggle, goodSlider, badSlider, updateSpeed].forEach(el =>
    el.addEventListener("input", () => {
      updateTexts();
      updateVisualization();
    })
  );

  loadSettings();
});