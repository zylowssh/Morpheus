let chart;
const maxPoints = 50;
let lastRunningState = null;

/* ---------- Background zones ---------- */
const zonePlugin = {
  id: "zones",
  beforeDraw(chart) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;

    const { left, right, top, bottom } = chartArea;
    const y = scales.y;

    ctx.save();

    // Green
    ctx.fillStyle = "rgba(74,222,128,0.15)";
    ctx.fillRect(left, y.getPixelForValue(800), right - left, bottom - y.getPixelForValue(800));

    // Yellow
    ctx.fillStyle = "rgba(250,204,21,0.15)";
    ctx.fillRect(left, y.getPixelForValue(1200), right - left, y.getPixelForValue(800) - y.getPixelForValue(1200));

    // Red
    ctx.fillStyle = "rgba(248,113,113,0.15)";
    ctx.fillRect(left, top, right - left, y.getPixelForValue(1200) - top);

    ctx.restore();
  }
};

/* ---------- Paused overlay ---------- */
const pauseOverlay = {
  id: "pauseOverlay",
  afterDraw(chart) {
    if (!chart.paused) return;

    const { ctx, chartArea } = chart;
    const { left, right, top, bottom } = chartArea;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(left, top, right - left, bottom - top);

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "600 18px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Analyse en pause", (left + right) / 2, (top + bottom) / 2);

    ctx.restore();
  }
};

/* ---------- Init ---------- */
function initChart() {
  const ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    plugins: [zonePlugin, pauseOverlay],
    data: {
      labels: [],
      datasets: [
        {
          label: "CO₂ (ppm)",
          data: [],
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 3
        },
        {
          label: "Seuil bon (800)",
          data: [],
          borderColor: "#4ade80",
          borderDash: [6, 6],
          pointRadius: 0,
          animation: false
        },
        {
          label: "Seuil mauvais (1200)",
          data: [],
          borderColor: "#f87171",
          borderDash: [6, 6],
          pointRadius: 0,
          animation: false
        }
      ]
    },
    options: {
      responsive: true,
      animation: {
        duration: 400,
        easing: "easeOutQuart"
      },
      scales: {
        y: {
          min: 400,
          max: 2000
        }
      }
    }
  });
}

/* ---------- Load persisted history ---------- */
async function loadHistory() {
  const history = await fetch("/api/history").then(r => r.json());

  history.forEach((h, i) => {
    chart.data.labels.push(i + 1);
    chart.data.datasets[0].data.push(h.ppm);
  });

  updateThresholds();
  chart.update();
}

/* ---------- Threshold sync ---------- */
function updateThresholds() {
  const len = chart.data.labels.length;
  chart.data.datasets[1].data = new Array(len).fill(800);
  chart.data.datasets[2].data = new Array(len).fill(1200);
}

/* ---------- Reset ---------- */
function resetChart() {
  chart.data.labels = [];
  chart.data.datasets[0].data = [];
  updateThresholds();
  chart.update();
}

/* ---------- Main loop ---------- */
async function updateData() {
  const settings = await fetch("/api/settings").then(r => r.json());
  const running = settings.analysis_running;

  chart.paused = !running;

  if (lastRunningState === false && running === true) {
    resetChart(); // restart → fresh curve
  }

  lastRunningState = running;

  const latest = await fetch("/api/latest").then(r => r.json());

  /* ---- UI always updates ---- */
  const valueEl = document.getElementById("value");
  const qualityEl = document.getElementById("quality");

  valueEl.textContent = `${latest.ppm} ppm`;
  qualityEl.textContent = latest.quality;

  const color =
    latest.ppm < 800 ? "#4ade80" :
    latest.ppm < 1200 ? "#facc15" :
    "#f87171";

  valueEl.style.color = color;
  qualityEl.style.color = color;

  if (!running) {
    chart.update("none"); // redraw overlay only
    return;
  }

  /* ---- Append point ---- */
  chart.data.labels.push(chart.data.labels.length + 1);
  chart.data.datasets[0].data.push(latest.ppm);

  if (chart.data.labels.length > maxPoints) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  updateThresholds();

  chart.data.datasets[0].borderColor = color;
  chart.data.datasets[0].pointBackgroundColor = color;

  chart.options.elements = {
    line: {
      shadowBlur: latest.ppm > 1200 ? 12 : 0,
      shadowColor: latest.ppm > 1200 ? "rgba(248,113,113,0.8)" : "transparent"
    }
  };

  chart.update("active");
}

/* ---------- CSV export ---------- */
function exportCSV() {
  const data = chart.data.datasets[0].data;
  const csv = "index,ppm\n" + data.map((v, i) => `${i + 1},${v}`).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "co2_history.csv";
  a.click();
}

/* ---------- Boot ---------- */
initChart();
loadHistory();
setInterval(updateData, 2000);
document.getElementById("export")?.addEventListener("click", exportCSV);
