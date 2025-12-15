let chart = null;
const maxPoints = 50;

async function updateData() {
  const latest = await fetch("/api/latest").then(r => r.json());
  const history = await fetch("/api/history").then(r => r.json());

  const valueEl = document.getElementById("value");
  const qualityEl = document.getElementById("quality");

  valueEl.textContent = `${latest.ppm} ppm`;
  qualityEl.textContent = latest.quality;

  const cls =
    latest.quality === "Bon" ? "good" :
    latest.quality === "Moyen" ? "medium" : "bad";

  valueEl.className = `value ${cls}`;
  qualityEl.className = `quality ${cls}`;

  // Keep only the last `maxPoints`
  const dataPoints = history.slice(-maxPoints);
  const labels = dataPoints.map((_, i) => i + 1);
  const data = dataPoints.map(x => x.ppm);

  if (!chart) {
    chart = new Chart(document.getElementById("chart"), {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "CO₂ (ppm)",
          data,
          borderColor: "rgba(74, 222, 128, 1)",
          backgroundColor: "rgba(74, 222, 128, 0.2)",
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 500,
          easing: 'easeOutQuart'
        },
        scales: {
          y: {
            beginAtZero: false
          }
        },
        plugins: {
          legend: {
            display: true,
            labels: { color: "#e5e7eb" }
          }
        }
      }
    });
  } else {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update('active'); // smooth update without resetting points
  }
}

updateData();
setInterval(updateData, 2000);
