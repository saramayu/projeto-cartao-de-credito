(function () {
  "use strict";

  const AUTH_SESSION_KEY = "findash_auth_ok";
  const DASHBOARD_PASSWORD = "1234";
  const CSV_FILENAME = "fatura_categorizada.csv";
  const CSV_FALLBACK_CONTENT = `data,valor,descricao,categoria
01/10/2025,"408,18",NIKE STORE,Vestuário
01/10/2025,"160,78",SEPHORA,Beleza
01/10/2025,"176,20",HAVAIANAS,Vestuário
02/10/2025,"649,07",BOOKING.COM,Viagens
02/10/2025,"197,87",SUSHI KAI,Alimentação
03/10/2025,"357,42",OUTBACK,Alimentação
03/10/2025,"477,77",CARREFOUR,Supermercado
03/10/2025,"94,91",RAPPI *PEDIDO,Alimentação
03/10/2025,"237,12",OUTBACK STEAKHOUSE,Alimentação
04/10/2025,"667,91",LEROY MERLIN,Casa e Reforma
04/10/2025,"261,46",SERRALHERIA PROGRESSO,Casa e Reforma
04/10/2025,"170,27",PICPAY *TRANSFERENCIA,Transferências
04/10/2025,"1112,96",TOK STOK,Móveis e Decoração
04/10/2025,"35,78",CLUB BENFEITORIA,Assinaturas
05/10/2025,"64,04",APPLE.COM/BILL,Assinaturas
05/10/2025,"368,88",OUTBACK,Alimentação
05/10/2025,"298,14",C&A MODAS,Vestuário
05/10/2025,"105,19",PICPAY *TRANSFERENCIA,Transferências
05/10/2025,"448,14",OBRAMAX,Casa e Reforma
05/10/2025,"36,88",CLUB BENFEITORIA,Assinaturas
05/10/2025,"219,22",NATURA,Beleza
06/10/2025,"47,65",GIRAFFAS,Alimentação
07/10/2025,"523,47",ZARA BRASIL,Vestuário
07/10/2025,"701,55",OTICA CAROL,Saúde
07/10/2025,"33,90",DISNEY PLUS,Assinaturas
07/10/2025,"190,42",SERRALHERIA PROGRESSO,Casa e Reforma
08/10/2025,"2370,15",DECOLAR.COM,Viagens
08/10/2025,"111,38",DROGARIA SAO PAULO,Farmácia
08/10/2025,"1587,85",AIRBNB * RESERVA,Viagens
08/10/2025,"150,02",SHOPEE *COMPRA,Compras Online
08/10/2025,"267,53",BOTICARIO,Beleza
08/10/2025,"343,14",ASSAI ATACADISTA,Supermercado
08/10/2025,"31,74",IFOOD *RESTAURANTE,Alimentação
08/10/2025,"410,70",ENEL PAGAMENTO,Contas e Utilidades
09/10/2025,"43,66",99 POP *VIAGEM,Transporte
10/10/2025,"320,70",PICPAY *TRANSFERENCIA,Transferências
10/10/2025,"91,38",ACOUGUE BOI BRANCO,Supermercado
11/10/2025,"17,32",APPLE.COM/BILL,Assinaturas
12/10/2025,"46,09",SUBWAY,Alimentação
13/10/2025,"543,72",NIKE STORE,Vestuário
13/10/2025,"189,93",PETZ,Pet
13/10/2025,"19,90",KINDLE UNLIMITED,Assinaturas
14/10/2025,"99,24",POSTO IPIRANGA,Combustível
14/10/2025,"93,11",LIVRARIA CULTURA,Livros
14/10/2025,"80,03",DOMINOS PIZZA,Alimentação
14/10/2025,"24,69",STARBUCKS,Alimentação
15/10/2025,"81,41",SARAIVA MEGASTORE,Livros
15/10/2025,"93,91",MADERO,Alimentação
16/10/2025,"140,35",HORTIFRUTI NATURAL,Supermercado
17/10/2025,"118,05",VIVO *MENSALIDADE,Contas e Utilidades
18/10/2025,"145,85",HAVAIANAS,Vestuário
18/10/2025,"46,78",UBER *TRIP,Transporte
18/10/2025,"170,63",MADERO,Alimentação
18/10/2025,"65,20",DROGASIL,Farmácia
19/10/2025,"475,62",BOOKING.COM,Viagens
19/10/2025,"69,52",SALON LINE,Beleza
20/10/2025,"153,96",HAVAIANAS,Vestuário
20/10/2025,"1109,62",AIRBNB * RESERVA,Viagens
21/10/2025,"24,90",GOOGLE *YOUTUBE,Assinaturas
21/10/2025,"443,03",OTICA CAROL,Saúde
21/10/2025,"109,06",DROGASIL,Farmácia
21/10/2025,"40,00",TIM *RECARGA,Contas e Utilidades
21/10/2025,"20,62",PEDAGIO CCR,Transporte
21/10/2025,"295,35",OBRAMAX,Casa e Reforma
21/10/2025,"115,43",EXTRA SUPERMERCADO,Supermercado
21/10/2025,"33,90",DISNEY PLUS,Assinaturas
22/10/2025,"59,43",GIRAFFAS,Alimentação
22/10/2025,"45,57",RAPPI *PEDIDO,Alimentação
23/10/2025,"150,24",ASSAI ATACADISTA,Supermercado
23/10/2025,"19,07",CABIFY,Transporte
23/10/2025,"55,66",BURGER KING,Alimentação
24/10/2025,"67,54",TIM *RECARGA,Contas e Utilidades
24/10/2025,"380,15",CARREFOUR,Supermercado
25/10/2025,"115,47",EXTRA SUPERMERCADO,Supermercado
25/10/2025,"34,39",CABIFY,Transporte
25/10/2025,"91,15",PANVEL FARMACIAS,Farmácia
25/10/2025,"264,97",SERRALHERIA PROGRESSO,Casa e Reforma
26/10/2025,"29,79",APPLE.COM/BILL,Assinaturas
27/10/2025,"303,80",TOK STOK,Móveis e Decoração
27/10/2025,"590,58",GOL LINHAS AEREAS,Viagens
28/10/2025,"97,09",IFOOD *RESTAURANTE,Alimentação
28/10/2025,"772,41",TOK STOK,Móveis e Decoração
28/10/2025,"791,06",ZARA BRASIL,Vestuário
28/10/2025,"527,93",PONTOFRIO.COM,Compras Online
29/10/2025,"186,94",OTICA CAROL,Saúde
29/10/2025,"356,49",POSTO IPIRANGA,Combustível
30/10/2025,"55,49",PETZ,Pet`;

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
    let text = "";
    try {
      const res = await fetch(CSV_FILENAME, { cache: "no-store" });
      if (!res.ok) throw new Error(res.statusText || String(res.status));
      text = await res.text();
    } catch (_) {
      // Fallback para ambientes sem servidor HTTP (ex.: file://)
      text = CSV_FALLBACK_CONTENT;
    }
    transactions = parseCsvToTransactions(text);
    if (!transactions.length) {
      transactions = parseCsvToTransactions(CSV_FALLBACK_CONTENT);
    }
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

    await loadTransactionsFromCsv();

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
