let chart;
let pollInterval = null;
const pollingDelay = 1000; // ✅ 1 second polling
let paused = false;

let history = [];
let labels = [];

const valueEl = document.getElementById("value");
const qualityEl = document.getElementById("quality");
const exportBtn = document.getElementById("export");
const resetBtn = document.getElementById("reset-btn");

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

async function fetchSettings() {
  const res = await fetch("/api/settings");
  return res.json();
}

function createChart(good, bad) {
  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: history,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: [], // ✅ per-point color
        pointBorderColor: [],
        segment: {
          borderColor: ctx => ppmColor(ctx.p1.parsed.y)
        }
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 450,
        easing: "easeOutQuart"
      },
      scales: {
        y: {
          min: 400,
          max: 2000
        }
      },
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            good: {
              type: "line",
              yMin: good,
              yMax: good,
              borderDash: [6, 6],
              borderColor: "#4ade80"
            },
            bad: {
              type: "line",
              yMin: bad,
              yMax: bad,
              borderDash: [6, 6],
              borderColor: "#f87171"
            }
          }
        }
      }
    }
  });
}

async function poll() {
  if (paused) return;

  const res = await fetch("/api/latest");
  const data = await res.json();

  if (data.paused) {
    setPaused(true);
    return;
  }

  const ppm = data.ppm;
  const time = new Date().toLocaleTimeString();
  const color = ppmColor(ppm);

  labels.push(time);
  history.push(ppm);

  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(ppm);

  // ✅ color the point itself
  chart.data.datasets[0].pointBackgroundColor.push(color);
  chart.data.datasets[0].pointBorderColor.push(color);

  chart.update(); // smooth animation preserved

  valueEl.textContent = `${ppm} ppm`;
  qualityEl.textContent = qualityText(ppm);
  valueEl.style.color = color;

  if (ppm >= 1200) {
    valueEl.classList.add("glow");
  } else {
    valueEl.classList.remove("glow");
  }
}

function startPolling() {
  clearInterval(pollInterval);
  pollInterval = setInterval(poll, pollingDelay);
}

function stopPolling() {
  clearInterval(pollInterval);
}

function setPaused(state) {
  paused = state;

  if (paused) {
    stopPolling();
    valueEl.textContent = "Analyse en pause";
    qualityEl.style.display = "none";
    valueEl.style.color = "#9ca3af";
  } else {
    history.length = 0;
    labels.length = 0;
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.data.datasets[0].pointBackgroundColor = [];
    chart.data.datasets[0].pointBorderColor = [];
    chart.update();
    startPolling();
  }
}

/* ✅ Reset button (clears & recenters) */
resetBtn.addEventListener("click", () => {
  history.length = 0;
  labels.length = 0;
  chart.data.labels = [];
  chart.data.datasets[0].data = [];
  chart.data.datasets[0].pointBackgroundColor = [];
  chart.data.datasets[0].pointBorderColor = [];
  chart.update();
});

/* ✅ CSV Export */
exportBtn.addEventListener("click", () => {
  let csv = "time,ppm\n";
  labels.forEach((l, i) => {
    csv += `${l},${history[i]}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "co2_history.csv";
  a.click();
});

/* INIT */
(async () => {
  const settings = await fetchSettings();
  createChart(settings.good_threshold, settings.bad_threshold);
  startPolling();
})();
