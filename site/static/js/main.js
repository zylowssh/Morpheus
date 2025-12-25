/* =====================================================
   GLOBAL STATE
===================================================== */
let chart;
let lastPPM = null;
let lastRotation = 0;
let pollInterval = null;
let lastQualityPPM = null;

let goodThreshold = 800;
let mediumThreshold = 1200;
let badThreshold = 1200;

let prevGoodThreshold = goodThreshold;
let prevBadThreshold = badThreshold;

let bgFade = 1;
let currentVisualPPM = null;
let analysisRunning = true;

let pollingDelay = 1000;
// let historyOffset = 0;
// let autoScroll = true;
// let fullHistory = [];

const MAX_POINTS = 25;

/* =====================================================
   DOM REFERENCES
===================================================== */
// const historyScroll = document.getElementById("history-scroll");

const valueEl = document.getElementById("value");
const trendEl = document.getElementById("trend");
const qualityEl = document.getElementById("quality");
const chartCanvas = document.getElementById("chart");

const pausedOverlay = document.getElementById("paused-overlay");
const exportBtn = document.getElementById("export");
const resetBtn = document.getElementById("reset-btn");

const navCenter = document.querySelector(".nav-center");
const underline = document.querySelector(".nav-underline");
const links = navCenter?.querySelectorAll("a");

const isLivePage = !!(valueEl && qualityEl && chartCanvas);
const isOverviewPage = !!document.querySelector(".air-health");

/* =====================================================
   UTILITIES
===================================================== */
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function forceLayout(el) {
  el.getBoundingClientRect();
}

/* =====================================================
   HISTORY SCROLL
===================================================== */
// if (historyScroll) {
//   historyScroll.addEventListener("input", () => {
//     historyOffset = Number(historyScroll.value);
//     autoScroll = historyOffset >= fullHistory.length - MAX_POINTS;
//     updateChartWindow();
//   });
// }

/* =====================================================
   NAVBAR
===================================================== */
function initNavbar() {
  if (!navCenter || !underline) return;

  const path = window.location.pathname;

  function getActiveLink() {
    return [...links].find((link) => link.getAttribute("href") === path);
  }

  function moveUnderline(el) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = navCenter.getBoundingClientRect();
    underline.style.width = `${r.width}px`;
    underline.style.left = `${r.left - p.left}px`;
    underline.style.opacity = "1";
  }

  const active = getActiveLink();
  if (active) {
    active.classList.add("active");
    requestAnimationFrame(() => moveUnderline(active));
  }

  links.forEach((l) =>
    l.addEventListener("mouseenter", () => moveUnderline(l))
  );

  navCenter.addEventListener("mouseleave", () =>
    moveUnderline(getActiveLink())
  );

  window.addEventListener("resize", () => moveUnderline(getActiveLink()));
}

/* =====================================================
   INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initGlobalState();
});

/* =====================================================
   SYSTEM STATE
===================================================== */
function startSystemStateWatcher() {
  setInterval(async () => {
    try {
      const state = await loadSystemState();
      updateNavAnalysisState(state.analysis_running);
    } catch {
      console.warn("Failed to refresh system state");
    }
  }, 2000);
}

function initGlobalState() {
  refreshSystemState();
  setInterval(refreshSystemState, 2000);
}

async function refreshSystemState() {
  try {
    const state = await loadSystemState();
    updateNavAnalysisState(state.analysis_running);

    // 🔒 DO NOT touch live polling here
    // analysisRunning is managed by poll()
  } catch {
    console.warn("State sync failed");
  }
}

function updateNavAnalysisState(isRunning) {
  const nav = document.getElementById("nav-analysis");
  const label = document.getElementById("nav-analysis-label");
  if (!nav || !label) return;

  nav.classList.remove("is-running", "is-paused");

  if (isRunning) {
    nav.classList.add("is-running");
    label.textContent = "Analyse active";
  } else {
    nav.classList.add("is-paused");
    label.textContent = "Analyse en pause";
  }
}

async function loadSystemState() {
  const res = await fetch("/api/settings");
  return await res.json();
}

/* =====================================================
   SETTINGS
===================================================== */
async function loadSharedSettings() {
  try {
    const res = await fetch("/api/settings");
    const s = await res.json();

    goodThreshold = s.good_threshold;
    badThreshold = s.bad_threshold;
    mediumThreshold = badThreshold;
  } catch {
    console.warn("Failed to load shared settings");
  }
}

/* =====================================================
   PAGE BOOTSTRAP
===================================================== */
(async () => {
  await loadSharedSettings();
  const state = await loadSystemState();
  updateNavAnalysisState(state.analysis_running);

  startSystemStateWatcher();

  if (isLivePage) initLivePage();
  if (isOverviewPage) {
    loadOverviewStats();
    setInterval(loadOverviewStats, 5000);
  }
})();

/* =====================================================
   LIVE PAGE INIT
===================================================== */
async function initLivePage() {
  analysisRunning = true;
  createChart();
  //   loadInitialHistory();
  loadLiveSettings();
  poll();
  startPolling();
}

/* =====================================================
   PAUSE OVERLAY
===================================================== */
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

/* =====================================================
   POLLING
===================================================== */
function startPolling() {
  if (!analysisRunning) return;
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

/* =====================================================
   HELPERS
===================================================== */
function ppmColor(ppm) {
  if (goodThreshold === badThreshold) {
    return ppm < goodThreshold ? "#4ade80" : "#f87171";
  }

  if (ppm < goodThreshold) return "#4ade80";
  if (ppm < badThreshold) return "#facc15";
  return "#f87171";
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(c1, c2, t) {
  return `rgb(
    ${Math.round(lerp(c1[0], c2[0], t))},
    ${Math.round(lerp(c1[1], c2[1], t))},
    ${Math.round(lerp(c1[2], c2[2], t))}
  )`;
}

function ppmColorSmooth(ppm) {
  const green = [74, 222, 128];
  const yellow = [250, 204, 21];
  const red = [248, 113, 113];

  if (ppm <= goodThreshold) return `rgb(${green})`;

  if (ppm <= badThreshold) {
    const t = (ppm - goodThreshold) / (badThreshold - goodThreshold);
    return lerpColor(green, yellow, t);
  }

  const t = Math.min((ppm - badThreshold) / badThreshold, 1);
  return lerpColor(yellow, red, t);
}

function qualityText(ppm) {
  if (goodThreshold === badThreshold) {
    return ppm < goodThreshold ? "Bon" : "Mauvais";
  }

  if (ppm < goodThreshold) return "Bon";
  if (ppm < badThreshold) return "Moyen";
  return "Mauvais";
}

/* =====================================================
   LIVE SETTINGS
===================================================== */
async function loadLiveSettings() {
  const res = await fetch("/api/settings");
  const s = await res.json();

  prevGoodThreshold = goodThreshold;
  prevBadThreshold = badThreshold;

  goodThreshold = Math.min(s.good_threshold, 2000 - 50);
  badThreshold = Math.min(s.bad_threshold, 2000);

  updatePollingSpeed(s.update_speed || 1);

  bgFade = 0;

  const start = performance.now();
  const duration = 500;

  function animateFade(time) {
    const t = Math.min((time - start) / duration, 1);
    bgFade = easeOutCubic(t);
    chart.update("none");
    if (t < 1) requestAnimationFrame(animateFade);
  }

  requestAnimationFrame(animateFade);
}

/* =====================================================
   CHART PLUGIN
===================================================== */
const zoneBackgroundPlugin = {
  id: "zoneBackground",
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;

    const { top, bottom, left, right } = chartArea;
    const y = scales.y;

    const good =
      prevGoodThreshold + (goodThreshold - prevGoodThreshold) * bgFade;
    const bad = prevBadThreshold + (badThreshold - prevBadThreshold) * bgFade;

    const yGood = y.getPixelForValue(good);
    const yBad = y.getPixelForValue(bad);

    const gradient = ctx.createLinearGradient(0, top, 0, bottom);
    const gStop = (yGood - top) / (bottom - top);
    const bStop = (yBad - top) / (bottom - top);

    if (good === bad) {
      gradient.addColorStop(0, "rgba(248,113,113,0.20)");
      gradient.addColorStop(bStop, "rgba(248,113,113,0.15)");
      gradient.addColorStop(bStop, "rgba(74,222,128,0.18)");
      gradient.addColorStop(1, "rgba(74,222,128,0.12)");
    } else {
      gradient.addColorStop(0, "rgba(248,113,113,0.20)");
      gradient.addColorStop(bStop, "rgba(248,113,113,0.15)");
      gradient.addColorStop(bStop, "rgba(250,204,21,0.18)");
      gradient.addColorStop(gStop, "rgba(250,204,21,0.15)");
      gradient.addColorStop(gStop, "rgba(74,222,128,0.18)");
      gradient.addColorStop(1, "rgba(74,222,128,0.12)");
    }

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(left, top, right - left, bottom - top);
    ctx.restore();
  },
};

Chart.register(zoneBackgroundPlugin);

/* =====================================================
   HISTORY
===================================================== */
// async function loadInitialHistory() {
//   const res = await fetch("/api/history/latest/1000");
//   const data = await res.json();

//   fullHistory = data.map((d) => ({
//     ppm: d.ppm,
//     timestamp: d.timestamp,
//   }));
//}

/* =====================================================
   CHART
===================================================== */
function createChart() {
  chart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "CO₂",
          data: [],
          normalized: true,
          borderWidth: 3,
          tension: 0.35,
          fill: true,
          backgroundColor: "rgba(11,13,18,0.30)",
          borderColor: "#9ca3af",

          animations: {
            y: {
              from: (ctx) => {
                if (!ctx || ctx.parsed == null) return undefined;

                const data = ctx.chart.data.datasets[0].data;
                const i = ctx.dataIndex;

                if (i === data.length - 1 && data.length > 1) {
                  return data[i - 1];
                }

                return ctx.parsed.y;
              },
              duration: 400,
              easing: "easeOutCubic",
            },

            // 🔥 THIS IS THE CRITICAL FIX
            fill: {
              duration: 0,
            },
          },

          segment: {
            borderColor: (ctx) => {
              const v = ctx.p1?.parsed?.y;
              return v == null ? "#9ca3af" : ppmColor(v);
            },
          },
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBorderColor: "#0b0d12",
          pointBackgroundColor: (ctx) => {
            const v = ctx.parsed?.y;
            return v == null ? "#9ca3af" : ppmColor(v);
          },
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 0 },
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          min: 400,
          max: 2000,
          animation: false,
          grid: { color: "rgba(255,255,255,0.06)" },
        },
        x: {
          animation: false,
          grid: { color: "rgba(255,255,255,0.04)" },
        },
      },
    },
  });
}

/* =====================================================
   CHART WINDOW
===================================================== */
// function updateChartWindow(animated = false) {
//   if (!chart) return;

//   const maxOffset = Math.max(0, fullHistory.length - MAX_POINTS);

//   if (autoScroll) {
//     historyOffset = maxOffset;
//   }

//   historyOffset = Math.max(0, Math.min(historyOffset, maxOffset));

//   const slice = fullHistory.slice(historyOffset, historyOffset + MAX_POINTS);

// 🔥 IMPORTANT: mutate arrays instead of replacing references
//   chart.data.labels.length = 0;
//   chart.data.datasets[0].data.length = 0;

//   slice.forEach((d) => {
//     chart.data.labels.push(new Date(d.timestamp).toLocaleTimeString());
//     chart.data.datasets[0].data.push(d.ppm);
//   });

//   chart.update(animated ? undefined : "none");

//   if (historyScroll) {
//     historyScroll.max = maxOffset;
//     historyScroll.value = historyOffset;
//   }
// }

/* =====================================================
   UI ANIMATIONS
===================================================== */
function animateValue(ppm) {
  if (lastPPM === null) {
    valueEl.textContent = `${ppm} ppm`;
    valueEl.style.color = ppmColor(ppm);
    lastPPM = ppm;
    return;
  }

  const start = lastPPM;
  const startTime = performance.now();
  const duration = 450;

  function frame(time) {
    const t = Math.min((time - startTime) / duration, 1);
    const eased = easeOutCubic(t);
    const current = Math.round(start + (ppm - start) * eased);
    valueEl.textContent = `${current} ppm`;
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
  valueEl.style.color = ppmColor(ppm);

  lastPPM = ppm;
}

function updateTrend(prev, current) {
  if (prev === null) return;

  let target = current > prev ? -45 : current < prev ? 45 : 0;
  if (target <= lastRotation) target += 360;

  trendEl.style.transform = `rotate(${target}deg)`;
  trendEl.style.color = ppmColor(current);
  lastRotation = target;
}

function animateQuality(ppm) {
  if (!qualityEl) return;

  const color = ppmColor(ppm);
  const label = qualityText(ppm);

  qualityEl.textContent = label;
  qualityEl.style.color = color;
  qualityEl.style.background = color + "22";
  qualityEl.style.border = `1px solid ${color}55`;
  qualityEl.style.boxShadow = `0 0 12px ${color}33`;

  // ⚠️ flash when crossing bad threshold
  if (
    lastQualityPPM !== null &&
    lastQualityPPM < badThreshold &&
    ppm >= badThreshold
  ) {
    qualityEl.classList.add("blink-warning");
    setTimeout(() => qualityEl.classList.remove("blink-warning"), 900);
  }

  lastQualityPPM = ppm;
}

/* =====================================================
   POLL
===================================================== */
async function poll() {
  const res = await fetch("/api/latest", {
    cache: "no-store",
  });
  const data = await res.json();

  /* ⏸ PAUSE HANDLING */
  if (data.analysis_running === false) {
    analysisRunning = false;

    updateNavAnalysisState(false);
    stopPolling(); // 🔥 stop polling loop

    if (isLivePage) {
      showPausedOverlay();
    }

    return;
  }

  /* ▶️ RESUME HANDLING */
  if (!analysisRunning && data.analysis_running === true) {
    analysisRunning = true;
    updateNavAnalysisState(true);
    startPolling(); // 🔥 resume polling
  }

  if (!analysisRunning) return;

  if (isLivePage) hidePausedOverlay();

  if (!data || data.ppm == null) return;

  const ppm = data.ppm;
  console.log("New PPM", ppm);

  /* LIVE PAGE UPDATES */
  if (isLivePage) {
    updateTrend(lastPPM, ppm);
    animateValue(ppm);
    animateQuality(ppm);

    const timeLabel = new Date(
      data.timestamp ?? Date.now()
    ).toLocaleTimeString();

    // 1️⃣ add new point
    chart.data.labels.push(timeLabel);
    chart.data.datasets[0].data.push(ppm);

    // 🔥 no layout animation, dataset animation still runs
    chart.update({ duration: 0 });

    if (chart.data.labels.length > MAX_POINTS) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();

      chart.update("none");
    }
  }
}

/* =====================================================
   BUTTONS
===================================================== */
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

/* =====================================================
   AIR HEALTH (OVERVIEW)
===================================================== */
function updateAirHealth(avgPPM) {
  const card = document.querySelector(".air-health");
  const status = document.getElementById("air-status");

  if (!card || !status) return;

  card.className = "card air-health";

  if (avgPPM < goodThreshold) {
    card.classList.add("good");
    status.textContent = "Excellent";
  } else if (avgPPM < badThreshold) {
    card.classList.add("medium");
    status.textContent = "Acceptable";
  } else {
    card.classList.add("bad");
    status.textContent = "Mauvais";
  }
}

/* =====================================================
   OVERVIEW STATS
===================================================== */
async function loadOverviewStats() {
  const avgEl = document.getElementById("avg-ppm");
  const maxEl = document.getElementById("max-ppm");
  const badEl = document.getElementById("bad-time");
  const statusEl = document.getElementById("air-status");
  const subEl = document.getElementById("air-sub");
  const airCard = document.querySelector(".air-health");
  const analysisEl = document.getElementById("analysis-status");
  const analysisWidget = document.getElementById("analysis-widget");
  const thresholdsEl = document.getElementById("co2-thresholds");

  if (!airCard || !statusEl) return;

  try {
    const settings = await loadSystemState();
    updateNavAnalysisState(settings.analysis_running);

    /* ⏸ ANALYSIS PAUSED */
    if (!settings.analysis_running) {
      airCard.classList.remove("good", "medium", "bad");
      airCard.classList.add("paused");

      statusEl.textContent = "Analyse en pause";
      subEl.textContent = "Aucune donnée en cours";

      if (analysisEl) {
        analysisEl.textContent = "Pause";
        analysisWidget?.classList.remove("good");
        analysisWidget?.classList.add("paused");
      }

      if (avgEl) avgEl.textContent = "—";
      if (maxEl) maxEl.textContent = "—";
      if (badEl) badEl.textContent = "—";

      thresholdsEl.textContent = `${settings.good_threshold} / ${settings.bad_threshold} ppm`;

      updateCO2Thermo?.(0);
      return;
    }

    /* ▶️ ANALYSIS RUNNING */
    airCard.classList.remove("paused");
    analysisWidget?.classList.remove("paused");
    analysisWidget?.classList.add("good");

    if (analysisEl) {
      analysisEl.textContent = "Active";
    }

    thresholdsEl.textContent = `${settings.good_threshold} / ${settings.bad_threshold} ppm`;

    /* LIVE SNAPSHOT */
    const liveRes = await fetch("/api/latest");
    const live = await liveRes.json();

    if (live?.ppm != null) {
      updateAirHealth(live.ppm);
      updateCO2Thermo(live.ppm);
      animateSubValue(live.ppm, subEl);
    }

    /* TODAY HISTORY */
    const res = await fetch("/api/history/today");
    const data = await res.json();
    if (!data.length) return;

    const values = data.map((d) => d.ppm);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    const max = Math.max(...values);
    const badMinutes = values.filter((v) => v >= badThreshold).length;

    if (avgEl) avgEl.textContent = `${avg} ppm`;
    if (maxEl) maxEl.textContent = `${max} ppm`;
    if (badEl) badEl.textContent = `${badMinutes} min`;
  } catch (e) {
    console.error("Overview stats failed", e);
  }
}

if (isOverviewPage) {
  loadOverviewStats();
}

/* =====================================================
   SUB VALUE ANIMATION
===================================================== */
let lastSubPPM = null;

function animateSubValue(ppm, el) {
  if (!el) return;

  if (lastSubPPM === null) {
    el.textContent = `CO₂ actuel · ${ppm} ppm`;
    el.style.color = ppmColor(ppm);
    lastSubPPM = ppm;
    return;
  }

  const start = lastSubPPM;
  const duration = 500;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = easeOutCubic(progress);
    const current = Math.round(start + (ppm - start) * eased);

    el.textContent = `CO₂ actuel · ${current} ppm`;

    if (progress < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
  el.style.color = ppmColor(ppm);

  if (lastSubPPM < badThreshold && ppm >= badThreshold) {
    el.classList.add("blink-warning");
    setTimeout(() => el.classList.remove("blink-warning"), 900);
  }

  lastSubPPM = ppm;
}

/* =====================================================
   EXPORT DAILY CSV
===================================================== */
document
  .getElementById("export-day-csv")
  ?.addEventListener("click", async () => {
    const res = await fetch("/api/history/today");
    const data = await res.json();

    let csv = "time,ppm\n";
    data.forEach((d) => {
      const time = new Date(d.timestamp).toLocaleTimeString();
      csv += `${time},${d.ppm}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rapport_journalier.csv";
    a.click();
  });

/* =====================================================
   EXPORT DAILY PDF (PLACEHOLDER)
===================================================== */
document.getElementById("export-day-pdf")?.addEventListener("click", () => {
  window.open("/api/report/daily/pdf", "_blank");
});

/* =====================================================
   CO2 THERMOMETER
===================================================== */
function updateCO2Thermo(value) {
  const fill = document.getElementById("co2-fill");
  const label = document.getElementById("co2-mini-value");

  if (!fill || !label) return;

  const max = 2000;
  const percent = Math.min(value / max, 1) * 100;

  fill.style.height = percent + "%";
  label.textContent = value + " ppm";

  if (value < 800) {
    fill.style.background = "var(--good)";
  } else if (value < 1200) {
    fill.style.background = "var(--medium)";
  } else {
    fill.style.background = "var(--bad)";
  }
}

/* =====================================================
   CSV ANALYTICS IMPORT
===================================================== */
if (document.getElementById("csv-file")) {
  document.getElementById("use-csv").onclick = () => {
    document.getElementById("csv-upload").classList.remove("hidden");
  };

  document.getElementById("use-aerium").onclick = () => {
    document.getElementById("csv-upload").classList.add("hidden");
  };

  document.getElementById("csv-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const rows = reader.result.split("\n").slice(1);
      const data = rows
        .map((r) => r.split(","))
        .filter((r) => r.length >= 2)
        .map(([t, ppm]) => ({ timestamp: t, ppm: Number(ppm) }))
        .filter((d) => !isNaN(d.ppm));

      renderAnalytics(data);
    };
    reader.readAsText(file);
  });
}
