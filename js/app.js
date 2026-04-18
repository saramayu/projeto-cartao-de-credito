(function () {
  "use strict";

  const CATEGORY_COLORS = {
    Alimentação: { bar: "#145239", pill: "#145239", pillBg: "rgba(20, 82, 57, 0.12)" },
    Transporte: { bar: "#1a6b4a", pill: "#1a6b4a", pillBg: "rgba(26, 107, 74, 0.12)" },
    Saúde: { bar: "#5eb88a", pill: "#0d3b2c", pillBg: "rgba(94, 184, 138, 0.2)" },
    Lazer: { bar: "#7dcea4", pill: "#0d3b2c", pillBg: "rgba(125, 206, 164, 0.35)" },
    Assinaturas: { bar: "#3d8f6a", pill: "#145239", pillBg: "rgba(61, 143, 106, 0.15)" },
    Casa: { bar: "#2a7558", pill: "#145239", pillBg: "rgba(42, 117, 88, 0.12)" },
    Educação: { bar: "#4a9d78", pill: "#0d3b2c", pillBg: "rgba(74, 157, 120, 0.18)" },
  };

  const MOCK_TRANSACTIONS = [
    { date: "2026-04-01", value: 215.3, description: "Pão de Açúcar — despensa da semana", category: "Alimentação" },
    { date: "2026-04-02", value: 45.0, description: "Uber — viagem à reunião", category: "Transporte" },
    { date: "2026-04-02", value: 89.9, description: "Drogaria São Paulo", category: "Saúde" },
    { date: "2026-04-03", value: 52.0, description: "Ingresso cinema multiplex", category: "Lazer" },
    { date: "2026-04-04", value: 59.9, description: "Netflix + Spotify", category: "Assinaturas" },
    { date: "2026-04-05", value: 178.4, description: "Leroy Merlin — reforma banheiro", category: "Casa" },
    { date: "2026-04-06", value: 33.5, description: "Padaria Central", category: "Alimentação" },
    { date: "2026-04-07", value: 349.0, description: "Mensalidade curso de idiomas", category: "Educação" },
    { date: "2026-04-08", value: 72.0, description: "Posto Shell — combustível", category: "Transporte" },
    { date: "2026-04-09", value: 128.4, description: "iFood — jantar fim de semana", category: "Alimentação" },
    { date: "2026-04-10", value: 220.0, description: "Plano saúde coparticipação", category: "Saúde" },
    { date: "2026-04-11", value: 95.0, description: "Bar e petiscos com amigos", category: "Lazer" },
    { date: "2026-04-12", value: 19.9, description: "Assinatura Notion", category: "Assinaturas" },
    { date: "2026-04-13", value: 45.6, description: "Conta de luz (rateio condomínio)", category: "Casa" },
    { date: "2026-04-14", value: 386.2, description: "Atacadão — compras do mês", category: "Alimentação" },
    { date: "2026-04-15", value: 16.4, description: "Estacionamento shopping", category: "Transporte" },
    { date: "2026-04-16", value: 65.0, description: "Farmácia — antialérgico e vitamina", category: "Saúde" },
    { date: "2026-04-17", value: 127.0, description: "Livro técnico — Amazon", category: "Educação" },
    { date: "2026-04-18", value: 94.5, description: "Açougue e hortifruti", category: "Alimentação" },
    { date: "2026-04-18", value: 140.0, description: "Show ao vivo", category: "Lazer" },
  ];

  let activeCategory = null;
  let searchQuery = "";
  let barChart = null;
  let lineChart = null;
  let prevCategory = undefined;

  const els = {
    kpiTotal: document.getElementById("kpiTotal"),
    kpiCount: document.getElementById("kpiCount"),
    kpiCountMeta: document.getElementById("kpiCountMeta"),
    kpiAvg: document.getElementById("kpiAvg"),
    tbody: document.getElementById("transactionsBody"),
    filterHint: document.getElementById("filterHint"),
    btnClear: document.getElementById("btnClearFilter"),
    tableBadge: document.getElementById("tableBadge"),
    searchInput: document.getElementById("searchInput"),
    kpiCards: document.querySelectorAll(".kpi"),
  };

  function formatMoney(n) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatDate(iso) {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function barColorsForLabels(labels) {
    return labels.map((l) => {
      const base = CATEGORY_COLORS[l]?.bar || "#145239";
      if (!activeCategory || l === activeCategory) return base;
      return hexToRgba(base, 0.28);
    });
  }

  function getFilteredBySearch(rows) {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      return (
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.date.includes(q) ||
        String(r.value).includes(q)
      );
    });
  }

  function getBaseRows() {
    if (!activeCategory) return MOCK_TRANSACTIONS;
    return MOCK_TRANSACTIONS.filter((t) => t.category === activeCategory);
  }

  function getDisplayRows() {
    return getFilteredBySearch(getBaseRows());
  }

  function aggregateByCategory(rows) {
    const map = {};
    Object.keys(CATEGORY_COLORS).forEach((c) => {
      map[c] = 0;
    });
    rows.forEach((r) => {
      map[r.category] = (map[r.category] || 0) + r.value;
    });
    const labels = Object.keys(CATEGORY_COLORS).filter((c) => map[c] > 0);
    const data = labels.map((c) => map[c]);
    return { labels, data };
  }

  /** Todos os dias entre a primeira e a última data (inclusive), com 0 nos dias sem gasto — melhor leitura no eixo X */
  function dailySeriesContinuous(rows) {
    if (!rows.length) {
      return { labels: ["—"], data: [0] };
    }
    const sorted = rows.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    const minIso = sorted[0].date;
    const maxIso = sorted[sorted.length - 1].date;
    const byDay = {};
    rows.forEach((r) => {
      byDay[r.date] = (byDay[r.date] || 0) + r.value;
    });
    const labels = [];
    const data = [];
    const cur = new Date(minIso + "T12:00:00");
    const end = new Date(maxIso + "T12:00:00");
    while (cur <= end) {
      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, "0");
      const day = String(cur.getDate()).padStart(2, "0");
      const iso = `${y}-${m}-${day}`;
      labels.push(
        cur.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
      );
      data.push(byDay[iso] || 0);
      cur.setDate(cur.getDate() + 1);
    }
    return { labels, data };
  }

  function pulseKpis() {
    els.kpiCards.forEach((el) => {
      el.classList.remove("kpi--pulse");
      void el.offsetWidth;
      el.classList.add("kpi--pulse");
    });
  }

  function updateKpis(rows, categoryFilterChanged) {
    const total = rows.reduce((s, r) => s + r.value, 0);
    const count = rows.length;
    const avg = count ? total / count : 0;
    els.kpiTotal.textContent = formatMoney(total);
    els.kpiCount.textContent = String(count);
    els.kpiAvg.textContent = formatMoney(avg);
    if (activeCategory) {
      els.kpiCountMeta.textContent = `Filtrado: ${activeCategory}`;
    } else {
      els.kpiCountMeta.textContent = "Transações no período";
    }
    if (categoryFilterChanged) pulseKpis();
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function renderTable(rows) {
    els.tbody.innerHTML = "";
    const sorted = rows.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    sorted.forEach((row, idx) => {
      const tr = document.createElement("tr");
      tr.classList.add("row-enter");
      tr.style.animationDelay = `${Math.min(idx * 0.035, 0.45)}s`;
      const colors = CATEGORY_COLORS[row.category] || CATEGORY_COLORS["Alimentação"];
      tr.innerHTML = `
        <td class="cell-date">${formatDate(row.date)}</td>
        <td class="cell-value">${formatMoney(row.value)}</td>
        <td class="cell-desc">${escapeHtml(row.description)}</td>
        <td><span class="cat-pill" style="--pill-bg:${colors.pillBg};--pill-fg:${colors.pill}">${escapeHtml(row.category)}</span></td>
      `;
      els.tbody.appendChild(tr);
    });
    els.tableBadge.textContent = `${sorted.length} lançamento${sorted.length !== 1 ? "s" : ""}`;
  }

  function updateFilterUi() {
    if (activeCategory) {
      els.filterHint.hidden = false;
      els.filterHint.textContent = `Filtro ativo: ${activeCategory}. Clique na mesma barra ou em "Limpar filtro" para remover.`;
      els.btnClear.disabled = false;
    } else {
      els.filterHint.hidden = true;
      els.btnClear.disabled = true;
    }
  }

  function lineChartGradient(ctx) {
    const h = ctx.canvas?.height || 280;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(94, 184, 138, 0.38)");
    g.addColorStop(0.55, "rgba(94, 184, 138, 0.12)");
    g.addColorStop(1, "rgba(94, 184, 138, 0)");
    return g;
  }

  function updateCharts() {
    const catData = aggregateByCategory(MOCK_TRANSACTIONS);
    const lineRows = getDisplayRows();
    const line = dailySeriesContinuous(lineRows);

    if (barChart) {
      barChart.data.labels = catData.labels;
      barChart.data.datasets[0].data = catData.data;
      barChart.data.datasets[0].backgroundColor = barColorsForLabels(catData.labels);
      barChart.update("active");
    }

    if (lineChart) {
      const ctx = lineChart.canvas;
      lineChart.data.labels = line.labels;
      lineChart.data.datasets[0].data = line.data;
      lineChart.data.datasets[0].backgroundColor = lineChartGradient(ctx);
      lineChart.update("active");
    }
  }

  function refresh() {
    const categoryFilterChanged =
      prevCategory !== undefined && prevCategory !== activeCategory;

    const rows = getDisplayRows();
    updateKpis(rows, categoryFilterChanged);
    renderTable(rows);
    updateFilterUi();
    updateCharts();

    prevCategory = activeCategory;
  }

  function initBarChart() {
    const ctx = document.getElementById("chartCategories");
    const catData = aggregateByCategory(MOCK_TRANSACTIONS);
    barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: catData.labels,
        datasets: [
          {
            label: "Gasto (R$)",
            data: catData.data,
            backgroundColor: barColorsForLabels(catData.labels),
            borderRadius: 12,
            borderSkipped: false,
            barThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 900,
          easing: "easeOutQuart",
        },
        onHover: (e, elements) => {
          e.native.target.style.cursor = elements.length ? "pointer" : "default";
        },
        onClick: (_, elements) => {
          if (!elements.length) return;
          const idx = elements[0].index;
          const label = barChart.data.labels[idx];
          if (activeCategory === label) {
            activeCategory = null;
          } else {
            activeCategory = label;
          }
          refresh();
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(13, 59, 44, 0.92)",
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: (c) => ` ${formatMoney(c.raw)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: "rgba(20, 82, 57, 0.08)" },
            ticks: {
              callback: (v) =>
                Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }),
            },
          },
          y: {
            grid: { display: false },
            ticks: { font: { weight: "600" } },
          },
        },
      },
    });
  }

  function initLineChart() {
    const ctx = document.getElementById("chartLine");
    const line = dailySeriesContinuous(MOCK_TRANSACTIONS);

    lineChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: line.labels,
        datasets: [
          {
            label: "Total diário",
            data: line.data,
            borderColor: "#145239",
            borderWidth: 2.5,
            backgroundColor: lineChartGradient(ctx),
            fill: "origin",
            cubicInterpolationMode: "monotone",
            spanGaps: false,
            pointRadius: 3,
            pointHoverRadius: 8,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#145239",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 8, right: 4, left: 0, bottom: 0 } },
        animation: {
          duration: 1200,
          easing: "easeOutQuart",
        },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(13, 59, 44, 0.92)",
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: (c) => ` ${formatMoney(c.raw)}`,
            },
          },
        },
        scales: {
          x: {
            offset: true,
            grid: { display: false },
            ticks: {
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12,
              font: { size: 11, weight: "500" },
              color: "#5c6560",
            },
          },
          y: {
            beginAtZero: true,
            suggestedMax: undefined,
            grid: { color: "rgba(20, 82, 57, 0.08)" },
            border: { display: false },
            ticks: {
              font: { size: 11, weight: "500" },
              color: "#5c6560",
              callback: (v) =>
                Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }),
            },
          },
        },
      },
    });
  }

  els.btnClear.addEventListener("click", () => {
    activeCategory = null;
    refresh();
  });

  els.searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    refresh();
  });

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      els.searchInput.focus();
    }
  });

  initBarChart();
  initLineChart();
  refresh();

  function resizeCharts() {
    if (barChart) barChart.resize();
    if (lineChart) lineChart.resize();
  }

  window.addEventListener("load", () => {
    resizeCharts();
    if (lineChart) {
      lineChart.data.datasets[0].backgroundColor = lineChartGradient(lineChart.canvas);
      lineChart.update();
    }
  });

  window.addEventListener("resize", () => {
    resizeCharts();
  });
})();
