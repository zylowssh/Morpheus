let chart;
let pollInterval = null;
const pollingDelay = 1000;
let paused = false;

let history = [];
let labels = [];

const valueEl = document.getElementById("value");
const qualityEl = document.getElementById("quality");
const exportBtn = document.getElementById("export");
const resetBtn = document.getElementById("reset-btn");
const errorMessage = document.getElementById("error-message");
const chartCanvas = document.getElementById("chart");

// Progressive reveal function
function revealElements(elements, delay = 100) {
  elements.forEach((element, index) => {
    setTimeout(() => {
      if (element) {
        element.classList.add('revealed');
        
        // Reveal child elements with additional delay
        const childElements = element.querySelectorAll('[class*="reveal"]');
        childElements.forEach((child, childIndex) => {
          setTimeout(() => {
            child.classList.add('revealed');
          }, childIndex * 50);
        });
      }
    }, index * delay);
  });
}

// Create chart placeholder
const chartContainer = chartCanvas.parentNode;
const placeholder = document.createElement('div');
placeholder.className = 'chart-placeholder visible';
placeholder.innerHTML = '<div class="spinner"></div>';
chartContainer.insertBefore(placeholder, chartCanvas);

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
  try {
    const res = await fetch("/api/settings");
    return await res.json();
  } catch (error) {
    console.error("Error fetching settings:", error);
    return {
      good_threshold: 800,
      bad_threshold: 1200
    };
  }
}

function createChart(good, bad) {
  // Hide placeholder and show chart
  setTimeout(() => {
    placeholder.classList.remove('visible');
    chartCanvas.classList.add('loaded');
  }, 300);
  
  chart = new Chart(chartCanvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data: history,
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: [],
        pointBorderColor: [],
        segment: {
          borderColor: ctx => ppmColor(ctx.p1.parsed.y)
        }
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 600,
        easing: "easeOutQuart"
      },
      scales: {
        y: {
          min: 400,
          max: 2000,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          }
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

  try {
    const res = await fetch("/api/latest");
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
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

    // Initialize chart if it doesn't exist yet
    if (!chart) {
      const settings = await fetchSettings();
      createChart(settings.good_threshold, settings.bad_threshold);
      
      // Animate initial value
      animateValueUpdate(ppm, color);
      animateQualityUpdate(ppm);
    } else {
      // Get the current dataset
      const dataset = chart.data.datasets[0];
      const currentLength = dataset.data.length;
      
      // Animate the new point
      animateNewChartPoint(currentLength, ppm, color, time);
      
      // Update chart data
      chart.data.labels.push(time);
      dataset.data.push(ppm);
      dataset.pointBackgroundColor.push(color);
      dataset.pointBorderColor.push(color);

      // Update chart with animation for the new point only
      chart.update();
      
      // Smooth value update
      updateValueWithAnimation(ppm, color);
      updateQualityWithAnimation(ppm);
    }

    if (ppm >= 1200) {
      valueEl.classList.add("glow");
    } else {
      valueEl.classList.remove("glow");
    }
    
    // Hide error message if it was showing
    if (errorMessage.style.display === 'block') {
      errorMessage.style.display = 'none';
    }
    
  } catch (error) {
    console.error("Error polling data:", error);
    
    // Show error message with animation
    errorMessage.textContent = "Impossible de récupérer les données. Reconnexion...";
    errorMessage.style.display = 'block';
    
    // Show placeholder if chart doesn't exist
    if (!chart && placeholder) {
      placeholder.classList.add('visible');
    }
  }
}

function animateNewChartPoint(index, ppm, color, time) {
  // Create a temporary canvas context for the point animation
  if (!chart || !chart.ctx) return;
  
  const ctx = chart.ctx;
  const meta = chart.getDatasetMeta(0);
  const point = meta.data[index];
  
  if (!point) return;
  
  // Animate the point appearance
  const originalRadius = point.options.radius || 3;
  let radius = 0;
  let animationFrame;
  
  function animate() {
    radius += 0.5;
    
    // Draw the animated point
    ctx.save();
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
    
    if (radius < originalRadius) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrame);
    }
  }
  
  // Start animation
  animate();
}

function animateValueUpdate(ppm, color) {
  valueEl.style.opacity = '0';
  valueEl.style.transform = 'scale(0.9)';
  
  setTimeout(() => {
    valueEl.textContent = `${ppm} ppm`;
    valueEl.style.color = color;
    valueEl.style.opacity = '1';
    valueEl.style.transform = 'scale(1)';
    valueEl.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }, 100);
}

function updateValueWithAnimation(ppm, color) {
  const oldValue = parseInt(valueEl.textContent) || ppm;
  const diff = Math.abs(ppm - oldValue);

  const duration = 400;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    const current = Math.round(oldValue + (ppm - oldValue) * eased);
    valueEl.textContent = `${current} ppm`;
    valueEl.style.color = color;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      valueEl.textContent = `${ppm} ppm`;
    }
  }

  requestAnimationFrame(animate);

  // Pulse only if change is significant
  if (diff >= 50) {
    valueEl.classList.add("glow");
    setTimeout(() => valueEl.classList.remove("glow"), 300);
  }
}


function animateQualityUpdate(ppm) {
  qualityEl.style.opacity = '0';
  qualityEl.style.transform = 'translateY(10px)';
  
  setTimeout(() => {
    qualityEl.textContent = qualityText(ppm);
    qualityEl.style.opacity = '1';
    qualityEl.style.transform = 'translateY(0)';
    qualityEl.style.transition = 'all 0.4s ease-out';
    
    // Update quality color
    qualityEl.style.background = ppm < 800 
      ? 'rgba(74, 222, 128, 0.15)' 
      : ppm < 1200 
        ? 'rgba(250, 204, 21, 0.15)' 
        : 'rgba(248, 113, 113, 0.15)';
    qualityEl.style.color = ppmColor(ppm);
  }, 150);
}

function updateQualityWithAnimation(ppm) {
  const newQuality = qualityText(ppm);
  const newColor = ppmColor(ppm);
  const newBackground = ppm < 800 
    ? 'rgba(74, 222, 128, 0.15)' 
    : ppm < 1200 
      ? 'rgba(250, 204, 21, 0.15)' 
      : 'rgba(248, 113, 113, 0.15)';
  
  
  // Update content
  qualityEl.textContent = newQuality;
  qualityEl.style.background = newBackground;
  qualityEl.style.color = newColor;
  
  // Remove animation class after it completes
  setTimeout(() => {
    qualityEl.classList.remove('slide-up');
  }, 400);
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
    if (chart) {
      chart.data.labels = [];
      chart.data.datasets[0].data = [];
      chart.data.datasets[0].pointBackgroundColor = [];
      chart.data.datasets[0].pointBorderColor = [];
      chart.update();
    }
    startPolling();
  }
}

/* Reset button */
resetBtn.addEventListener("click", () => {
  // Add animation to reset button
  resetBtn.classList.add('btn-loading');
  resetBtn.disabled = true;
  
  setTimeout(() => {
    history.length = 0;
    labels.length = 0;
    if (chart) {
      chart.data.labels = [];
      chart.data.datasets[0].data = [];
      chart.data.datasets[0].pointBackgroundColor = [];
      chart.data.datasets[0].pointBorderColor = [];
      chart.update();
    }
    
    resetBtn.classList.remove('btn-loading');
    resetBtn.disabled = false;
  }, 500);
});

/* CSV Export */
exportBtn.addEventListener("click", () => {
  // Add loading state to export button
  exportBtn.classList.add('btn-loading');
  exportBtn.disabled = true;
  
  setTimeout(() => {
    let csv = "time,ppm\n";
    labels.forEach((l, i) => {
      csv += `${l},${history[i]}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "co2_history.csv";
    a.click();
    
    // Restore button state
    setTimeout(() => {
      exportBtn.classList.remove('btn-loading');
      exportBtn.disabled = false;
    }, 300);
  }, 800);
});

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  // Reveal cards and elements in order
  const cards = document.querySelectorAll('.card');
  revealElements(cards, 200);
  
  // Reveal headings after cards
  setTimeout(() => {
    const headings = document.querySelectorAll('h2');
    revealElements(headings, 100);
  }, 300);
  
  // Reveal value and quality
  setTimeout(() => {
    if (valueEl) valueEl.classList.add('revealed');
    if (qualityEl) qualityEl.classList.add('revealed');
  }, 400);
  
  // Reveal buttons and links
  setTimeout(() => {
    const buttons = document.querySelectorAll('.btn-export, .link');
    revealElements(buttons, 50);
  }, 500);
  
  // Initial value animation - FIXED: No space before "Chargement..."
  setTimeout(() => {
    valueEl.textContent = "Chargement...";
    valueEl.style.opacity = '0.7';
    valueEl.classList.add('loading-pulse');
  }, 300);
  
  // Initialize everything
  (async () => {
    try {
      const settings = await fetchSettings();
      if (!chart) {
        // Small delay for visual polish
        setTimeout(() => {
          createChart(settings.good_threshold, settings.bad_threshold);
          startPolling();
        }, 500);
      }
    } catch (error) {
      console.error("Initialization error:", error);
      // Create chart with default values if settings fetch fails
      setTimeout(() => {
        createChart(800, 1200);
        startPolling();
      }, 500);
    } finally {
      // Remove loading pulse
      setTimeout(() => {
        valueEl.classList.remove('loading-pulse');
        valueEl.style.opacity = '1';
      }, 800);
    }
  })();
});