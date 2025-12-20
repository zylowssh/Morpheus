let chart;
let lastPPM = null;
let pollInterval;
const pollingDelay = 1000;

const valueEl = document.getElementById("value");
const trendEl = document.getElementById("trend");
const qualityEl = document.getElementById("quality");
const chartCanvas = document.getElementById("chart");
const exportBtn = document.getElementById("export");
const resetBtn = document.getElementById("reset-btn");
const errorMessage = document.getElementById("error-message");

const isLivePage = valueEl && qualityEl && chartCanvas;

/* Helpers */
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

/* Chart */
function createChart() {
  chart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        data: [],
        borderWidth: 2,
        tension: 0.35,
        segment: {
          borderColor: ctx => ppmColor(ctx.p1.parsed.y)
        }
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 400, max: 2000 }
      }
    }
  });
}

/* Animate value */
function animateValue(ppm) {
  if (lastPPM === null) {
    valueEl.textContent = `${ppm} ppm`;
    valueEl.style.color = ppmColor(ppm);
    lastPPM = ppm;
    return;
  }

  const diff = Math.abs(ppm - lastPPM);
  const start = lastPPM;
  const duration = 450;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (ppm - start) * eased);
    valueEl.textContent = `${current} ppm`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);

  valueEl.style.color = ppmColor(ppm);

  /* 🔥 Glow ONLY on meaningful jump */
  if (diff >= 50) {
    valueEl.classList.add("glow");
    setTimeout(() => valueEl.classList.remove("glow"), 350);
  }

  lastPPM = ppm;
}

function updateTrend(ppm) {
  if (lastPPM === null || !trendEl) return;

  if (ppm > lastPPM) {
    trendEl.textContent = "↑";
  } else if (ppm < lastPPM) {
    trendEl.textContent = "↓";
  } else {
    trendEl.textContent = "→";
  }
}

/* Animate quality */
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

/* Poll */
async function poll() {
  try {
    const res = await fetch("/api/latest");
    const data = await res.json();

    const ppm = data.ppm;
    const time = new Date().toLocaleTimeString();

    animateValue(ppm);
    updateTrend(ppm);
    animateQuality(ppm);

    chart.data.labels.push(time);
    chart.data.datasets[0].data.push(ppm);
    chart.update();

    errorMessage.style.display = "none";
  } catch (err) {
    console.error("Polling error:", err);
    errorMessage.style.display = "block";
    errorMessage.textContent = "Impossible de récupérer les données";
    }
}

/* Buttons */
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

/* Init */
if (isLivePage) {
  createChart();
  poll();
  pollInterval = setInterval(poll, pollingDelay);
}
