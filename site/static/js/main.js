let chart;
let lastPPM = null;
let pollInterval = null;
let goodThreshold = 800;
let mediumThreshold = 1200;
let badThreshold = 1200;
let prevGoodThreshold = goodThreshold;
let prevBadThreshold = badThreshold;
let bgFade = 1;
let currentVisualPPM = null;
let pollingDelay = 1000;

const valueEl = document.getElementById("value");
const trendEl = document.getElementById("trend");
const qualityEl = document.getElementById("quality");
const chartCanvas = document.getElementById("chart");
const pausedOverlay = document.getElementById("paused-overlay");
const exportBtn = document.getElementById("export");
const resetBtn = document.getElementById("reset-btn");

const navCenter = document.querySelector(".nav-center");
const underline = document.querySelector(".nav-underline");
const links = navCenter.querySelectorAll("a");

const isLivePage = valueEl && qualityEl && chartCanvas;


function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

if (navCenter && underline) {
  const links = navCenter.querySelectorAll("a");
  const path = window.location.pathname;

  function getActiveLink() {
    return [...links].find(link => {
      const href = link.getAttribute("href");
      return href === "/" ? path === "/" : path.startsWith(href);
    });
  }

  function moveUnderline(el) {
    if (!el) return;

    const linkRect = el.getBoundingClientRect();
    const parentRect = navCenter.getBoundingClientRect();

    underline.style.width = `${linkRect.width}px`;
    underline.style.left = `${linkRect.left - parentRect.left}px`;
    underline.style.opacity = "1";
  }

  // ✅ Set active on load
  const active = getActiveLink();
  if (active) {
    active.classList.add("active");
    requestAnimationFrame(() => moveUnderline(active));
  }

  // Hover behavior
  links.forEach(link => {
    link.addEventListener("mouseenter", () => moveUnderline(link));
  });

  // ✅ Snap back to active when leaving nav
  navCenter.addEventListener("mouseleave", () => {
    moveUnderline(getActiveLink());
  });

  // Keep aligned on resize
  window.addEventListener("resize", () => {
    moveUnderline(getActiveLink());
  });
}

const zoneBackgroundPlugin = {
  id: "zoneBackground",
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;

    const { top, bottom, left, right } = chartArea;
    const y = scales.y;

    const good =
      prevGoodThreshold + (goodThreshold - prevGoodThreshold) * bgFade;
    const bad =
      prevBadThreshold + (badThreshold - prevBadThreshold) * bgFade;

    const yGood = y.getPixelForValue(good);
    const yBad  = y.getPixelForValue(bad);

    const gradient = ctx.createLinearGradient(0, top, 0, bottom);

    // normalize
    const gStop = (yGood - top) / (bottom - top);
    const bStop = (yBad  - top) / (bottom - top);

    // 🔥 COLLAPSED (no middle zone)
    if (good === bad){
      gradient.addColorStop(0, "rgba(248,113,113,0.20)");
      gradient.addColorStop(bStop, "rgba(248,113,113,0.15)");

      gradient.addColorStop(bStop, "rgba(74,222,128,0.18)");
      gradient.addColorStop(1, "rgba(74,222,128,0.12)");
    } 
    // 🔥 NORMAL (3 zones)
    else {
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
  // collapsed → 2 zones only
  if (goodThreshold === badThreshold) {
    return ppm < goodThreshold ? "#4ade80" : "#f87171";
  }

  // normal
  if (ppm < goodThreshold) return "#4ade80";
  if (ppm < badThreshold)  return "#facc15";
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
  const green  = [74, 222, 128];
  const yellow = [250, 204, 21];
  const red    = [248, 113, 113];

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

async function loadLiveSettings() {
  const res = await fetch("/api/settings");
  const s = await res.json();

  prevGoodThreshold = goodThreshold;
  prevBadThreshold  = badThreshold;

  goodThreshold = Math.min(s.good_threshold, 2000 - 50);
  badThreshold  = Math.min(s.bad_threshold, 2000);

  updatePollingSpeed(s.update_speed || 1);

  bgFade = 0;

  const start = performance.now();
  const duration = 500;

  function animateFade(time) {
    const t = Math.min((time - start) / duration, 1);
    bgFade = easeOutCubic(t);
    chart.update("none"); // redraw without restarting animations

    if (t < 1) requestAnimationFrame(animateFade);
  }

  requestAnimationFrame(animateFade);
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
          label: "CO₂",
          data: [],
          borderWidth: 3,
          borderCapStyle: "round",
          borderJoinStyle: "round",
          tension: 0.35,

          // 👇 CONTRASTING CURVE AREA
          fill: true,
          backgroundColor: "rgba(11,13,18,0.30)",

          // 👇 color per segment
          borderColor: "#9ca3af",
          segment: {
            borderColor: ctx => {
              const v = ctx.p1?.parsed?.y;
              return v == null ? "#9ca3af" : ppmColor(v);
            },
          },

          pointBorderWidth: 2,
          pointBorderColor: "#0b0d12",
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: ctx => {
            const v = ctx.parsed?.y;
            return v == null ? "#9ca3af" : ppmColor(v);
          },
        },
      ],
    },
    options: {
      responsive: true,
      animation: {
        duration: 450,
        easing: "easeOutQuart",
      },
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          min: 400,
          max: 2000,
          grid: {
            color: "rgba(255,255,255,0.06)",
          },
        },
        x: {
          grid: {
            color: "rgba(255,255,255,0.04)",
          },
        },
      },
    }
  });
}

function gradientBackground(ctx) {
  const chart = ctx.chart;
  const { ctx: canvasCtx, chartArea } = chart;

  if (!chartArea) return null;

  const { top, bottom } = chartArea;

  const gradient = canvasCtx.createLinearGradient(0, top, 0, bottom);

  // Normalize thresholds to chart scale
  const goodStop = 1 - (goodThreshold - 400) / (2000 - 400);
  const badStop  = 1 - (badThreshold - 400) / (2000 - 400);

  gradient.addColorStop(0, "rgba(248,113,113,0.35)");   // 🔴 top
  gradient.addColorStop(badStop, "rgba(248,113,113,0.20)");

  gradient.addColorStop(badStop, "rgba(250,204,21,0.22)");
  gradient.addColorStop(goodStop, "rgba(250,204,21,0.18)");

  gradient.addColorStop(goodStop, "rgba(74,222,128,0.20)");
  gradient.addColorStop(1, "rgba(74,222,128,0.05)");

  return gradient;
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

  if (ppm >= badThreshold) {
    valueEl.classList.add("danger");
  } else {
    valueEl.classList.remove("danger");
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
