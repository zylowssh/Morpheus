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

// Progressive reveal function
function revealElements(elements, delay = 100) {
  elements.forEach((element, index) => {
    setTimeout(() => {
      if (element) {
        element.classList.add('revealed');
      }
    }, index * delay);
  });
}

/* ---------- Load ---------- */
async function loadSettings() {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error("Failed to fetch settings");
    const data = await res.json();
    applySettings(data);
  } catch {
    applySettings(DEFAULT_SETTINGS);
  } finally {
    // After settings are loaded, reveal the content
    setTimeout(() => {
      revealPageContent();
    }, 300);
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
  // FIXED: Don't fade out the status text on slider changes
  // Keep the text visible and just update it
  const wasVisible = statusText.classList.contains('revealed');
  
  statusText.textContent = toggle.checked
    ? "L'analyse en direct est activée"
    : "L'analyse en direct est désactivée";
  statusText.style.color = toggle.checked ? "#4ade80" : "#9ca3af";
  
  // If it was already revealed, keep it revealed
  if (wasVisible) {
    statusText.classList.add('revealed');
  }

  // Update slider values with animation
  updateSliderValue(goodValue, `${goodSlider.value} ppm`);
  updateSliderValue(badValue, `${badSlider.value} ppm`);
  updateSliderValue(speedValue, `${updateSpeed.value} secondes`);

  goodLabel.textContent = goodSlider.value;
  badLabel.textContent = badSlider.value;
}

function updateSliderValue(element, newText) {
  if (element.textContent !== newText) {
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.2s ease-out';
    
    setTimeout(() => {
      element.textContent = newText;
      element.style.transform = 'scale(1)';
    }, 200);
  } else {
    element.textContent = newText;
  }
}

/* ---------- Threshold bar ---------- */
function updateVisualization() {
  const good = +goodSlider.value;
  const bad = +badSlider.value;

  const goodW = ((good - 400) / 1600) * 100;
  const midW = ((bad - good) / 1600) * 100;
  const badW = 100 - goodW - midW;

  const goodSeg = document.querySelector(".good-seg");
  const mediumSeg = document.querySelector(".medium-seg");
  const badSeg = document.querySelector(".bad-seg");

  // Animate width changes
  animateWidth(goodSeg, `${goodW}%`);
  animateWidth(mediumSeg, `${midW}%`);
  animateWidth(badSeg, `${badW}%`);
}

function animateWidth(element, newWidth) {
  if (element.style.width !== newWidth) {
    element.style.transition = 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    element.style.width = newWidth;
  }
}

/* ---------- Save ---------- */
async function saveSettings() {
  const originalText = saveBtn.innerHTML;
  saveBtn.classList.add('btn-loading');
  saveBtn.disabled = true;
  
  const payload = {
    analysis_running: toggle.checked,
    good_threshold: +goodSlider.value,
    bad_threshold: +badSlider.value,
    realistic_mode: realisticMode.checked
  };

  try {
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("Save failed");

    // Success animation
    setTimeout(() => {
      saveBtn.classList.remove('btn-loading');
      saveBtn.innerHTML = "✓";
      saveBtn.style.background = "#4ade80";
      saveBtn.style.transform = 'scale(1.1)';
      saveBtn.style.transition = 'all 0.2s ease-out';
      
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.style.background = "";
        saveBtn.style.transform = 'scale(1)';
        saveBtn.disabled = false;
      }, 1000);
    }, 300);
  } catch {
    // Error animation
    setTimeout(() => {
      saveBtn.classList.remove('btn-loading');
      saveBtn.innerHTML = "✗";
      saveBtn.style.background = "#f87171";
      saveBtn.style.transform = 'scale(1.1)';
      saveBtn.style.transition = 'all 0.2s ease-out';
      
      setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.style.background = "";
        saveBtn.style.transform = 'scale(1)';
        saveBtn.disabled = false;
      }, 1000);
    }, 300);
  }
}

/* ---------- Reset ---------- */
async function resetSettings() {
  resetBtn.classList.add('btn-loading');
  resetBtn.disabled = true;
  
  // Animate sliders to default values
  animateSliderToValue(goodSlider, DEFAULT_SETTINGS.good_threshold);
  animateSliderToValue(badSlider, DEFAULT_SETTINGS.bad_threshold);
  animateSliderToValue(updateSpeed, DEFAULT_SETTINGS.update_speed);
  
  setTimeout(() => {
    applySettings(DEFAULT_SETTINGS);
    
    // Also save the reset values
    saveSettings().finally(() => {
      setTimeout(() => {
        resetBtn.classList.remove('btn-loading');
        resetBtn.disabled = false;
      }, 300);
    });
  }, 500);
}

function animateSliderToValue(slider, targetValue) {
  const currentValue = parseInt(slider.value);
  const step = (targetValue - currentValue) / 10;
  let current = currentValue;
  
  const interval = setInterval(() => {
    current += step;
    if ((step > 0 && current >= targetValue) || (step < 0 && current <= targetValue)) {
      slider.value = targetValue;
      clearInterval(interval);
      
      // Trigger events
      slider.dispatchEvent(new Event('input'));
    } else {
      slider.value = Math.round(current);
      slider.dispatchEvent(new Event('input'));
    }
  }, 30);
}

/* ---------- Reveal page content ---------- */
function revealPageContent() {
  // Reveal cards first
  const cards = document.querySelectorAll('.card');
  revealElements(cards, 200);
  
  // Then reveal headings
  setTimeout(() => {
    const headings = document.querySelectorAll('h2');
    revealElements(headings, 100);
  }, 300);
  
  // Then reveal switch rows
  setTimeout(() => {
    const switchRows = document.querySelectorAll('.switch-row');
    revealElements(switchRows, 80);
  }, 400);
  
  // Then reveal status text
  setTimeout(() => {
    if (statusText) {
      statusText.classList.add('revealed');
      // Ensure it stays visible
      statusText.style.opacity = '1';
    }
  }, 450);
  
  // Then reveal slider groups
  setTimeout(() => {
    const sliderGroups = document.querySelectorAll('.slider-group');
    revealElements(sliderGroups, 100);
  }, 500);
  
  // Then reveal individual slider items
  setTimeout(() => {
    const sliderItems = document.querySelectorAll('.slider-item');
    revealElements(sliderItems, 60);
  }, 550);
  
  // Then reveal threshold visualization
  setTimeout(() => {
    const thresholdVisual = document.querySelector('.threshold-visual');
    if (thresholdVisual) thresholdVisual.classList.add('revealed');
  }, 600);
  
  // Then reveal hints
  setTimeout(() => {
    const hints = document.querySelectorAll('.hint');
    revealElements(hints, 50);
  }, 650);
  
  // Finally reveal action buttons
  setTimeout(() => {
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) actionButtons.classList.add('revealed');
    
    const buttons = document.querySelectorAll('.btn-save, .btn-reset, .link');
    revealElements(buttons, 50);
  }, 700);
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

toggle.addEventListener("change", () => {
  updateTexts();
});

updateSpeed.addEventListener("input", () => {
  // Only update the speed value text, not the status text
  updateSliderValue(speedValue, `${updateSpeed.value} secondes`);
});

saveBtn.addEventListener("click", saveSettings);
resetBtn.addEventListener("click", resetSettings);

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
});