let chart;
let lastPPM = null;
let pollInterval = null;
let pollingDelay = 1000;

const valueEl = document.getElementById("value");
const trendEl = document.getElementById("trend");
const qualityEl = document.getElementById("quality");
const chartCanvas = document.getElementById("chart");
const pausedOverlay = document.getElementById("paused-overlay");
const exportBtn = document.getElementById("export");
const resetBtn = document.getElementById("reset-btn");

const isLivePage = valueEl && qualityEl && chartCanvas;

/* =========================
   INIT
========================= */
if (isLivePage) {
  initLivePage();
} else {
  console.log("main.js loaded on non-live page");
}

function initLivePage() {
  if (!pausedOverlay) {
    console.warn("Paused overlay not found in DOM");
  }

  createChart();
  loadLiveSettings();
  poll();          // first fetch immediately
  startPolling();  // then interval
}

/* =========================
   PAUSE OVERLAY
========================= */
function showPausedOverlay() {
  pausedOverlay?.classList.add("active");

  valueEl.textContent = "⏸";
  valueEl.style.color = "#9ca3af";

  trendEl.textContent = "";

  qualityEl.textContent = "Analyse en pause";
  qualityEl.style.color = "#9ca3af";
  qualityEl.style.background = "rgba(255,255,255,0.08)";
}

function hidePausedOverlay() {
  pausedOverlay?.classList.remove("active");
}

/* =========================
   POLLING
========================= */
function startPolling() {
  stopPolling();
  pollInterval = setInterval(poll, pollingDelay);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

function updatePollingSpeed(seconds) {
  pollingDelay = seconds * 1000;
  startPolling();
}

/* =========================
   HELPERS
========================= */
function ppmColor(ppm) {
  if (ppm < 800) return "#4ade80";
  if (ppm < 1200) return "#facc15";
  return "#f87171";
}

function qualityText(ppm) {
  if (ppm < 800) return "Bon";
  if (ppm < 1200) return "Moyen";
  return "Mauvais";
}

async function loadLiveSettings() {
  try {
    const res = await fetch("/api/settings");
    const s = await res.json();
    updatePollingSpeed(s.update_speed || 1);
  } catch {
    updatePollingSpeed(1);
  }
}

/* =========================
   CHART
========================= */
function createChart() {
  chart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          borderWidth: 2,
          tension: 0.35,
          segment: {
            borderColor: (ctx) => ppmColor(ctx.p1.parsed.y),
          },
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 400, max: 2000 },
      },
    },
  });
}

/* =========================
   UI ANIMATIONS
========================= */
function animateValue(ppm) {
  if (lastPPM === null) {
    valueEl.textContent = `${ppm} ppm`;
    valueEl.style.color = ppmColor(ppm);
    lastPPM = ppm;
    return;
  }

  const start = lastPPM;
  const duration = 450;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (ppm - start) * eased);
    valueEl.textContent = `${current} ppm`;

    if (progress < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
  valueEl.style.color = ppmColor(ppm);

  if (lastPPM < 1200 && ppm >= 1200) {
    valueEl.classList.add("glow");
    setTimeout(() => valueEl.classList.remove("glow"), 400);
  }



  lastPPM = ppm;
}

let lastRotation = 0;

function updateTrend(prev, current) {
  if (prev === null) return;

  let targetRotation;

  if (current > prev) {
    targetRotation = -45; // ↗
  } else if (current < prev) {
    targetRotation = 45;  // ↘
  } else {
    targetRotation = 0;   // →
  }

  // force clockwise spin
  if (targetRotation <= lastRotation) {
    targetRotation += 360;
  }

  trendEl.style.transform = `rotate(${targetRotation}deg)`;
  trendEl.style.color = ppmColor(current);

  lastRotation = targetRotation;
}

function animateQuality(ppm) {
  qualityEl.textContent = qualityText(ppm);
  qualityEl.style.color = ppmColor(ppm);
  qualityEl.style.background =
    ppm < 800
      ? "rgba(74,222,128,0.15)"
      : ppm < 1200
      ? "rgba(250,204,21,0.15)"
      : "rgba(248,113,113,0.15)";
}

/* =========================
   POLL
========================= */
async function poll() {
  const res = await fetch("/api/latest");
  const data = await res.json();

  if (data.analysis_running === false) {
    showPausedOverlay();
    return;
  }

  hidePausedOverlay();

  if (data.ppm == null) {
    valueEl.textContent = "---";
    trendEl.textContent = "";
    qualityEl.textContent = "En attente de données…";
    qualityEl.style.color = "#9ca3af";
    qualityEl.style.background = "rgba(255,255,255,0.08)";
    return;
  }

  const ppm = data.ppm;
  const time = new Date().toLocaleTimeString();

  const prevPPM = lastPPM;

  updateTrend(prevPPM, ppm); // morph FIRST
  animateValue(ppm);        // updates lastPPM
  animateQuality(ppm);

  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(ppm);
  chart.update();
}

/* =========================
   BUTTONS
========================= */
exportBtn?.addEventListener("click", () => {
  let csv = "time,ppm\n";
  chart.data.labels.forEach((t, i) => {
    csv += `${t},${chart.data.datasets[0].data[i]}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "co2_history.csv";
  a.click();
});

resetBtn?.addEventListener("click", () => {
  chart.data.labels = [];
  chart.data.datasets[0].data = [];
  chart.update();
});
