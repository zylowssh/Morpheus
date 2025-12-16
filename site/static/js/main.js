let chart = null;
const maxPoints = 50;

async function updateData() {
  const latest = await fetch("/api/latest").then(r => r.json());

  const valueEl = document.getElementById("value");
  const qualityEl = document.getElementById("quality");

  if (latest.paused) {
    qualityEl.textContent = "En pause";
    qualityEl.className = "quality";
    return;
  }

  valueEl.textContent = `${latest.ppm} ppm`;
  qualityEl.textContent = latest.quality;

  const cls =
    latest.quality === "Bon" ? "good" :
    latest.quality === "Moyen" ? "medium" : "bad";

  valueEl.className = `value ${cls}`;
  qualityEl.className = `quality ${cls}`;

  const history = await fetch("/api/history").then(r => r.json());

  const labels = history.map((_, i) => i + 1);
  const data = history.map(x => x.ppm);

  if (!chart) {
    chart = new Chart(document.getElementById("chart"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "CO₂ (ppm)",
          data,
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 500 }
      }
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update("active");
  }
}

updateData();
setInterval(updateData, 2000);
