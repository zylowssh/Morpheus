const toggle = document.getElementById("toggle-analysis");
const statusText = document.getElementById("status-text");

async function loadSettings() {
  const res = await fetch("/api/settings");
  const data = await res.json();

  toggle.checked = data.analysis_running;
  updateText();
}

function updateText() {
  statusText.textContent = toggle.checked
    ? "L'analyse en direct est activée"
    : "L'analyse en direct est désactivée";
}

toggle.addEventListener("change", async () => {
  await fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analysis_running: toggle.checked
    })
  });

  updateText();
});

loadSettings();
