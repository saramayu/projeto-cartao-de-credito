(function () {
  "use strict";

  const AUTH_SESSION_KEY = "findash_auth_ok";
  const DASHBOARD_PASSWORD = "1234";
  const CSV_FILENAME = "fatura_categorizada.csv";

  /** Cores por categoria (CSV); fallback aplicado para categorias novas */
  const CATEGORY_PRESET = {
    Alimentação: { bar: "#145239", pill: "#145239", pillBg: "rgba(20, 82, 57, 0.12)" },
    Transporte: { bar: "#1a6b4a", pill: "#1a6b4a", pillBg: "rgba(26, 107, 74, 0.12)" },
    Saúde: { bar: "#5eb88a", pill: "#0d3b2c", pillBg: "rgba(94, 184, 138, 0.2)" },
    Assinaturas: { bar: "#3d8f6a", pill: "#145239", pillBg: "rgba(61, 143, 106, 0.15)" },
    "Casa e Reforma": { bar: "#2a7558", pill: "#145239", pillBg: "rgba(42, 117, 88, 0.12)" },
    Educação: { bar: "#4a9d78", pill: "#0d3b2c", pillBg: "rgba(74, 157, 120, 0.18)" },
    Vestuário: { bar: "#256950", pill: "#0d3b2c", pillBg: "rgba(37, 105, 80, 0.14)" },
    Beleza: { bar: "#6daa94", pill: "#0d3b2c", pillBg: "rgba(109, 170, 148, 0.22)" },
    Viagens: { bar: "#0d4a35", pill: "#fff", pillBg: "rgba(13, 74, 53, 0.85)" },
    Supermercado: { bar: "#2f6b52", pill: "#145239", pillBg: "rgba(47, 107, 82, 0.12)" },
    Transferências: { bar: "#4d8070", pill: "#0d3b2c", pillBg: "rgba(77, 128, 112, 0.15)" },
    "Móveis e Decoração": { bar: "#1e5c45", pill: "#145239", pillBg: "rgba(30, 92, 69, 0.12)" },
    "Compras Online": { bar: "#5a9d85", pill: "#0d3b2c", pillBg: "rgba(90, 157, 133, 0.18)" },
    Farmácia: { bar: "#7dcea4", pill: "#0d3b2c", pillBg: "rgba(125, 206, 164, 0.28)" },
    "Contas e Utilidades": { bar: "#3a7d62", pill: "#145239", pillBg: "rgba(58, 125, 98, 0.14)" },
    Pet: { bar: "#8fbcaa", pill: "#0d3b2c", pillBg: "rgba(143, 188, 170, 0.35)" },
    Combustível: { bar: "#356b56", pill: "#145239", pillBg: "rgba(53, 107, 86, 0.14)" },
    Livros: { bar: "#4a8f72", pill: "#0d3b2c", pillBg: "rgba(74, 143, 114, 0.16)" },
    Lazer: { bar: "#7dcea4", pill: "#0d3b2c", pillBg: "rgba(125, 206, 164, 0.35)" },
  };

  const BAR_FALLBACK = [
    "#145239",
    "#1a6b4a",
    "#2a7558",
    "#3d8f6a",
    "#4a9d78",
    "#5eb88a",
    "#6daa94",
    "#7dcea4",
    "#0d4a35",
    "#256950",
  ];

  let transactions = [];
  let activeCategory = null;
  let searchQuery = "";
  let barChart = null;
  let lineChart = null;
  let prevCategory = undefined;
  let dashboardStarted = false;
  let eventsBound = false;

  const appRoot = document.getElementById("appRoot");

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
    authGate: document.getElementById("authGate"),
    authForm: document.getElementById("authForm"),
    authPassword: document.getElementById("authPassword"),
    authError: document.getElementById("authError"),
  };

  function hasDataLabelsPlugin() {
    return typeof ChartDataLabels !== "undefined";
  }

  function registerDataLabelsPlugin() {
    if (!hasDataLabelsPlugin()) return;
    if (Chart.registry.getPlugin("datalabels")) return;
    Chart.register(ChartDataLabels);
  }

  function hashString(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }

  function getCategoryStyle(name) {
    if (CATEGORY_PRESET[name]) return CATEGORY_PRESET[name];
    const bar = BAR_FALLBACK[hashString(name) % BAR_FALLBACK.length];
    return { bar, pill: "#0d3b2c", pillBg: hexToRgba(bar, 0.2) };
  }

  function formatMoney(n) {
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatMoneyChart(n) {
    return Number(n).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: Number(n) % 1 === 0 ? 0 : 2,
      minimumFractionDigits: 0,
    });
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

  function parseDateBR(ddmmyyyy) {
    const [d, m, y] = ddmmyyyy.trim().split("/");
    if (!y || !m || !d) return null;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  function parseValorBR(raw) {
    let s = String(raw).trim().replace(/^"|"$/g, "");
    if (!s) return 0;
    if (s.includes(".") && s.includes(",")) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else if (s.includes(",")) {
      s = s.replace(",", ".");
    }
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 0;
  }

  /** Uma linha de dados: DD/MM/AAAA,"valor",descrição,categoria */
  function parseTransactionLine(line) {
    const i1 = line.indexOf(",");
    if (i1 === -1) return null;
    const dateStr = line.slice(0, i1).trim();
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return null;
    let rest = line.slice(i1 + 1);
    if (rest[0] !== '"') return null;
    const endQuote = rest.indexOf('",', 1);
    if (endQuote === -1) return null;
    const valorStr = rest.slice(1, endQuote);
    rest = rest.slice(endQuote + 2);
    const lastComma = rest.lastIndexOf(",");
    if (lastComma === -1) return null;
    const description = rest.slice(0, lastComma).trim();
    const category = rest.slice(lastComma + 1).trim();
    const iso = parseDateBR(dateStr);
    if (!iso || !description || !category) return null;
    return {
      date: iso,
      value: parseValorBR(valorStr),
      description,
      category,
    };
  }

  function parseCsvToTransactions(text) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseTransactionLine(lines[i]);
      if (row) out.push(row);
    }
    return out;
  }

  async function loadTransactionsFromCsv() {
    const res = await fetch(CSV_FILENAME, { cache: "no-store" });
    if (!res.ok) throw new Error(res.statusText || String(res.status));
    const text = await res.text();
    transactions = parseCsvToTransactions(text);
    if (!transactions.length) throw new Error("Nenhuma transação no CSV");
  }

  function setBarChartWrapHeight() {
    const wrap = document.getElementById("chartCategoriesWrap");
    if (!wrap) return;
    const { labels } = aggregateByCategory(transactions);
    const h = Math.min(980, Math.max(260, labels.length * 28 + 120));
    wrap.style.height = `${h}px`;
  }

  function barColorsForLabels(labels) {
    return labels.map((l) => {
      const base = getCategoryStyle(l).bar;
      if (!activeCategory || l === activeCategory) return base;
      return hexToRgba(base, 0.28);
    });
  }

  function rowMatchesSearch(r, q) {
    const hay = [
      r.description,
      r.category,
      r.date,
      formatDate(r.date),
      String(r.value),
      formatMoney(r.value),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }

  function getFilteredBySearch(rows) {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => rowMatchesSearch(r, q));
  }

  function getBaseRows() {
    if (!activeCategory) return transactions;
    return transactions.filter((t) => t.category === activeCategory);
  }

  function getDisplayRows() {
    return getFilteredBySearch(getBaseRows());
  }

  function aggregateByCategory(rows) {
    const map = {};
    rows.forEach((r) => {
      map[r.category] = (map[r.category] || 0) + r.value;
    });
    const entries = Object.entries(map).filter(([, v]) => v > 0);
    entries.sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map((e) => e[0]),
      data: entries.map((e) => e[1]),
    };
  }

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
      tr.style.animationDelay = `${Math.min(idx * 0.02, 0.4)}s`;
      const colors = getCategoryStyle(row.category);
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

  function barDatalabelsOptions() {
    if (!hasDataLabelsPlugin()) return {};
    return {
      datalabels: {
        color: "#0d3b2c",
        font: { weight: "700", size: 11, family: "'DM Sans', system-ui, sans-serif" },
        anchor: "end",
        align: "right",
        offset: 6,
        clamp: true,
        clip: false,
        formatter: (v) => formatMoney(Number(v)),
      },
    };
  }

  function lineDatalabelsOptions() {
    if (!hasDataLabelsPlugin()) return {};
    return {
      datalabels: {
        color: "#0d3b2c",
        font: { weight: "600", size: 10, family: "'DM Sans', system-ui, sans-serif" },
        align: "top",
        anchor: "center",
        offset: 10,
        clamp: true,
        clip: false,
        padding: { top: 4, right: 6, bottom: 4, left: 6 },
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "rgba(20, 82, 57, 0.14)",
        borderRadius: 8,
        borderWidth: 1,
        formatter: (v) => {
          const n = Number(v);
          if (n <= 0) return "";
          return formatMoneyChart(n);
        },
      },
    };
  }

  function updateCharts() {
    const catData = aggregateByCategory(transactions);
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
    const catData = aggregateByCategory(transactions);
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
        layout: { padding: { right: 8 } },
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
          ...barDatalabelsOptions(),
        },
        scales: {
          x: {
            grace: "14%",
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
    const line = dailySeriesContinuous(transactions);

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
        layout: { padding: { top: 28, right: 6, left: 2, bottom: 2 } },
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
          ...lineDatalabelsOptions(),
        },
        scales: {
          x: {
            offset: true,
            grid: { display: false },
            ticks: {
              maxRotation: 45,
              minRotation: 0,
              autoSkip: true,
              maxTicksLimit: 16,
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

  function resizeCharts() {
    if (barChart) barChart.resize();
    if (lineChart) lineChart.resize();
  }

  function bindDashboardEvents() {
    if (eventsBound) return;
    eventsBound = true;

    els.btnClear.addEventListener("click", () => {
      activeCategory = null;
      refresh();
    });

    els.searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      refresh();
    });

    document.addEventListener("keydown", onGlobalKeydown);

    window.addEventListener("load", () => {
      resizeCharts();
      if (lineChart) {
        lineChart.data.datasets[0].backgroundColor = lineChartGradient(lineChart.canvas);
        lineChart.update();
      }
    });

    window.addEventListener("resize", resizeCharts);
  }

  function onGlobalKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      els.searchInput.focus();
    }
  }

  async function startDashboard() {
    if (dashboardStarted) return;

    appRoot.classList.remove("app--locked");
    appRoot.removeAttribute("aria-hidden");

    registerDataLabelsPlugin();

    try {
      await loadTransactionsFromCsv();
    } catch (e) {
      console.error(e);
      alert(
        "Não foi possível carregar fatura_categorizada.csv. Abra o projeto por um servidor HTTP local (por exemplo: na pasta do projeto, execute `npx serve` ou `python -m http.server`) para que o arquivo CSV seja encontrado."
      );
      els.kpiTotal.textContent = "—";
      els.kpiCount.textContent = "—";
      els.kpiAvg.textContent = "—";
      els.tableBadge.textContent = "—";
      bindDashboardEvents();
      dashboardStarted = true;
      return;
    }

    dashboardStarted = true;
    setBarChartWrapHeight();
    initBarChart();
    initLineChart();
    refresh();
    bindDashboardEvents();
  }

  function initAuthGate() {
    const gate = els.authGate;
    const form = els.authForm;
    const input = els.authPassword;
    const err = els.authError;

    if (sessionStorage.getItem(AUTH_SESSION_KEY) === "1") {
      gate.hidden = true;
      gate.setAttribute("aria-hidden", "true");
      void startDashboard();
      return;
    }

    gate.hidden = false;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      err.hidden = true;
      if (input.value === DASHBOARD_PASSWORD) {
        sessionStorage.setItem(AUTH_SESSION_KEY, "1");
        gate.hidden = true;
        gate.setAttribute("aria-hidden", "true");
        input.value = "";
        void startDashboard();
      } else {
        err.hidden = false;
        input.select();
      }
    });
  }

  initAuthGate();
})();
