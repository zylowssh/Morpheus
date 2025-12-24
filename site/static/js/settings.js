document.addEventListener("DOMContentLoaded", () => {
  let isSnapping = false;

  const toggle = document.getElementById("toggle-analysis");
  const goodSlider = document.getElementById("good-threshold");
  if (!toggle || !goodSlider) return;

  const badSlider = document.getElementById("bad-threshold");
  const statusText = document.getElementById("status-text");
  const goodValue = document.getElementById("good-value");
  const badValue = document.getElementById("bad-value");
  const goodLabel = document.getElementById("good-label");
  const badLabel = document.getElementById("bad-label");

  const realisticMode = document.getElementById("realistic-mode");
  const updateSpeed = document.getElementById("update-speed");
  const speedValue = document.getElementById("speed-value");

  const saveBtn = document.getElementById("save-settings");
  const resetBtn = document.getElementById("reset-settings");

  const goodSeg = document.querySelector(".good-seg");
  const midSeg = document.querySelector(".medium-seg");
  const badSeg = document.querySelector(".bad-seg");

  const MIN = 0;
  const MAX = 2000;

  const DEFAULTS = {
    analysis_running: true,
    good_threshold: 800,
    bad_threshold: 1200,
    realistic_mode: true,
    update_speed: 2,
  };

  function updateLiveValues() {
    goodValue.textContent = `${snap(+goodSlider.value)} ppm`;
    badValue.textContent = `${snap(+badSlider.value)} ppm`;
  }

  function snap(value) {
    const STEP = 50;
    return Math.round(value / STEP) * STEP;
  }

  function springTo(slider, target, onDone) {
    if (isSnapping) return;

    isSnapping = true;

    const start = +slider.value;
    const diff = target - start;
    const duration = 220;
    const startTime = performance.now();

    function animate(time) {
      const t = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      slider.value = Math.round(start + diff * eased);
      updateVisualization();

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // 🔒 FINAL HARD LOCK
        slider.value = target;

        isSnapping = false;

        updateLiveValues();
        updateTexts();
        updateVisualization();
        if (onDone) onDone();
      }
    }

    requestAnimationFrame(animate);
  }

  /* =========================
     TEXT
  ========================= */
  function updateTexts() {
    statusText.textContent = toggle.checked
      ? "Analyse en direct activée"
      : "Analyse en direct désactivée";

    statusText.classList.toggle("on", toggle.checked);
    statusText.classList.toggle("off", !toggle.checked);

    goodValue.textContent = `${goodSlider.value} ppm`;
    badValue.textContent = `${badSlider.value} ppm`;
    speedValue.textContent = `${updateSpeed.value} secondes`;

    goodLabel.textContent = goodSlider.value;
    badLabel.textContent = badSlider.value;
  }

  /* =========================
     LINKED SLIDERS
  ========================= */
  function syncThresholds(changed) {
    let good = +goodSlider.value;
    let bad = +badSlider.value;

    good = Math.max(MIN, Math.min(good, MAX));
    bad = Math.max(MIN, Math.min(bad, MAX));

    // 🔗 Always move the OTHER slider
    if (good > bad) {
      if (changed === goodSlider) bad = good;
      else good = bad;
    }

    goodSlider.value = good;
    badSlider.value = bad;
  }

  function updateThresholdLabels() {
    const good = +goodSlider.value;
    const bad = +badSlider.value;

    const goodPct = (good / MAX) * 100;
    const badPct = (bad / MAX) * 100;

    goodLabel.style.left = `${goodPct}%`;
    badLabel.style.left = `${badPct}%`;

    // 🔥 COLLISION HANDLING
    const distance = Math.abs(goodPct - badPct);

    if (distance < 6) {
      goodLabel.style.transform = "translate(-50%, -6px)";
      badLabel.style.transform = "translate(-50%, 10px)";
    } else {
      goodLabel.style.transform = "translateX(-50%)";
      badLabel.style.transform = "translateX(-50%)";
    }
  }

  /* =========================
     VISUAL ZONES
  ========================= */
  function updateVisualization() {
    const good = +goodSlider.value;
    const bad = +badSlider.value;

    if (good === bad) {
      const pct = (good / MAX) * 100;
      goodSeg.style.width = `${pct}%`;
      badSeg.style.width = `${100 - pct}%`;
      midSeg.style.display = "none";
      updateThresholdLabels();
      return;
    }

    midSeg.style.display = "flex";

    const goodW = (good / MAX) * 100;
    const midW  = ((bad - good) / MAX) * 100;
    const badW  = 100 - goodW - midW;

    goodSeg.style.width = `${goodW}%`;
    midSeg.style.width  = `${midW}%`;
    badSeg.style.width  = `${badW}%`;

    updateThresholdLabels(); // ✅ single call
  }

  /* =========================
     LOAD
  ========================= */
  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      const s = await res.json();

      toggle.checked = s.analysis_running;
      const good = Number.isFinite(s.good_threshold)
        ? s.good_threshold
        : DEFAULTS.good_threshold;
      const bad = Number.isFinite(s.bad_threshold)
        ? s.bad_threshold
        : DEFAULTS.bad_threshold;

      goodSlider.value = Math.min(Math.max(good, MIN), MAX);
      badSlider.value = Math.min(Math.max(bad, MIN), MAX);

      realisticMode.checked = s.realistic_mode;
      updateSpeed.value = s.update_speed;
    } catch {
      toggle.checked = DEFAULTS.analysis_running;
      goodSlider.value = DEFAULTS.good_threshold;
      badSlider.value = DEFAULTS.bad_threshold;
      realisticMode.checked = DEFAULTS.realistic_mode;
      updateSpeed.value = DEFAULTS.update_speed;
    }

    syncThresholds();
    updateTexts();
    updateVisualization();
  }

  /* =========================
     SAVE
  ========================= */
  saveBtn.addEventListener("click", async () => {
    syncThresholds();

    saveBtn.classList.add("btn-saved");
    saveBtn.textContent = "✓ Enregistré";

    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analysis_running: toggle.checked,
        good_threshold: +goodSlider.value,
        bad_threshold: +badSlider.value,
        realistic_mode: realisticMode.checked,
        update_speed: +updateSpeed.value,
      }),
    });

    setTimeout(() => {
      saveBtn.textContent = "💾 Enregistrer";
      saveBtn.classList.remove("btn-saved");
    }, 900);
  });

  resetBtn.addEventListener("click", async () => {
    resetBtn.classList.add("btn-resetting");
    resetBtn.textContent = "↺ Réinitialisé";

    await fetch("/api/settings", { method: "DELETE" });
    await loadSettings();

    setTimeout(() => {
      resetBtn.textContent = "⟲ Réinitialiser";
      resetBtn.classList.remove("btn-resetting");
    }, 700);
  });


  /* =========================
     LIVE INPUT
  ========================= */
  [goodSlider, badSlider].forEach((el) =>
    el.addEventListener("input", (e) => {
      if (isSnapping) return;

      syncThresholds(e.target);
      updateVisualization();
      updateLiveValues(); // 🔥 NEW
    })
  );

  loadSettings();

  function snapOne(slider) {
    const snapped = snap(+slider.value);

    springTo(slider, snapped, () => {
      slider.value = snapped;
      syncThresholds(slider);
      updateTexts();
      updateVisualization();
    });
  }

  goodSlider.addEventListener("change", () => snapOne(goodSlider));
  badSlider.addEventListener("change", () => snapOne(badSlider));
});
