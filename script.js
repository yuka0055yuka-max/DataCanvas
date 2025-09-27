let chart;

document.addEventListener("DOMContentLoaded", () => {
  // イベント登録
  document.getElementById("addRowBtn").addEventListener("click", () => addRow());
  document.getElementById("renderBtn").addEventListener("click", renderFromTable);
  document.getElementById("csvInput").addEventListener("change", importCSV);
  document.getElementById("txtInput").addEventListener("change", importTXT);
  document.getElementById("exportBtn").addEventListener("click", exportToTXT);

  // PWA登録
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(err => console.error("SW登録失敗:", err));
  }
});

function addRow(x = "", y = "") {
  const tbody = document.querySelector("#dataTable tbody");
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input type="text" value="${x}"></td>
    <td><input type="number" value="${y}"></td>
    <td><button class="deleteBtn">🗑️</button></td>
  `;
  tbody.appendChild(row);

  // 削除ボタンにイベント追加
  row.querySelector(".deleteBtn").addEventListener("click", () => row.remove());
}

function renderFromTable() {
  const rows = document.querySelectorAll("#dataTable tbody tr");
  const labels = [];
  const data = [];

  rows.forEach(row => {
    const x = row.cells[0].querySelector("input").value;
    const y = Number(row.cells[1].querySelector("input").value);
    if (x && !isNaN(y)) {
      labels.push(x);
      data.push(y);
    }
  });

  const type = document.getElementById("chartType").value;
  const xLabel = document.getElementById("xLabel").value;
  const yLabel = document.getElementById("yLabel").value;

  if (chart) chart.destroy();

  const config = {
    type: type === "stacked" ? "bar" : type,
    data: {
      labels: labels,
      datasets: [{
        label: yLabel,
        data: data,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `${xLabel} vs ${yLabel}`
        }
      },
      scales: type === "stacked" ? {
        x: { stacked: true },
        y: { stacked: true }
      } : {}
    }
  };

  chart = new Chart(document.getElementById("myChart"), config);
  showStats(data);
}

function showStats(data) {
  if (data.length === 0) {
    document.getElementById("stats").textContent = "データがありません";
    return;
  }
  const avg = (data.reduce((a, b) => a + b, 0) / data.length).toFixed(2);
  const min = Math.min(...data);
  const max = Math.max(...data);
  document.getElementById("stats").textContent =
    `平均: ${avg} / 最小: ${min} / 最大: ${max}`;
}

function importCSV() {
  const file = document.getElementById("csvInput").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const lines = e.target.result.trim().split("\n");
    document.querySelector("#dataTable tbody").innerHTML = "";
    lines.forEach(line => {
      const [x, y] = line.split(",");
      addRow(x.trim(), y.trim());
    });
    renderFromTable();
  };
  reader.readAsText(file);
}

function importTXT() {
  const file = document.getElementById("txtInput").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const lines = e.target.result.trim().split("\n");
    document.querySelector("#dataTable tbody").innerHTML = "";
    lines.forEach(line => {
      const [x, y] = line.split(",");
      addRow(x.trim(), y.trim());
    });
    renderFromTable();
  };
  reader.readAsText(file);
}

function exportToTXT() {
  const rows = document.querySelectorAll("#dataTable tbody tr");
  let content = "";
  rows.forEach(row => {
    const x = row.cells[0].querySelector("input").value;
    const y = row.cells[1].querySelector("input").value;
    content += `${x},${y}\n`;
  });
  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "graph-data.txt";
  link.click();
}
