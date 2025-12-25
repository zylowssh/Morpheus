let analyticsChart;
let analyticsSource = "aerium";
let currentData = [];

const avgEl = document.getElementById("m-avg");
const minEl = document.getElementById("m-min");
const maxEl = document.getElementById("m-max");
const badEl = document.getElementById("m-bad");

const aeriumBtn = document.getElementById("use-aerium");
const csvBtn = document.getElementById("use-csv");
const csvUpload = document.getElementById("csv-upload");
const csvInput = document.getElementById("csv-file");
const rangeSelect = document.getElementById("aerium-range");

const GOOD = 800;
const BAD = 1200;

/* ===============================
   SOURCE SWITCH
=============================== */
aeriumBtn.onclick = () => {
  aeriumBtn.classList.add("active");
  csvBtn.classList.remove("active");
  csvUpload.classList.add("hidden");
  loadAerium();
};

csvBtn.onclick = () => {
  csvBtn.classList.add("active");
  aeriumBtn.classList.remove("active");
  csvUpload.classList.remove("hidden");
};

document.querySelector(".csv-drop")?.addEventListener("click", () => {
  document.getElementById("csv-file")?.click();
});

/* ===============================
   ANALYSIS
=============================== */
function analyze(data) {
  if (!data.length) return;

  const values = data.map(d => d.ppm);
  const avg = Math.round(values.reduce((a,b)=>a+b,0) / values.length);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const bad = values.filter(v => v >= BAD).length;

  avgEl.textContent = avg + " ppm";
  minEl.textContent = min + " ppm";
  maxEl.textContent = max + " ppm";
  badEl.textContent = bad + " min";

  drawChart(data);
}

/* ===============================
   CHART
=============================== */
function drawChart(data) {
  const labels = data.map(d =>
    new Date(d.timestamp).toLocaleString()
  );
  const values = data.map(d => d.ppm);

  if (!analyticsChart) {
    analyticsChart = new Chart(
      document.getElementById("analytics-chart"),
      {
        type: "line",
        data: {
          labels,
          datasets: [{
            data: values,
            borderWidth: 3,
            tension: 0.35,
            borderColor: "#4ade80",
            fill: false
          }]
        },
        options: {
          animation: false,
          plugins: { legend: { display: false } },
          scales: { y: { min: 400, max: 2000 } }
        }
      }
    );
  } else {
    analyticsChart.data.labels = labels;
    analyticsChart.data.datasets[0].data = values;
    analyticsChart.update("none");
  }
}

/* ===============================
   AERIUM DATA
=============================== */
async function loadAerium() {
  const range = rangeSelect.value;
  const res = await fetch(`/api/history/${range}`);
  const data = await res.json();

  currentData = data;
  analyze(data);
}

rangeSelect.onchange = loadAerium;

/* ===============================
   CSV IMPORT (TEMP)
=============================== */
csvInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: res => {
      const parsed = res.data
        .map(r => ({
          timestamp: r.timestamp || r.time || r.date,
          ppm: Number(r.ppm || r.co2 || r.value)
        }))
        .filter(d => d.timestamp && !isNaN(d.ppm));

      currentData = parsed;
      analyze(parsed);
    }
  });
};

/* INIT */
loadAerium();
