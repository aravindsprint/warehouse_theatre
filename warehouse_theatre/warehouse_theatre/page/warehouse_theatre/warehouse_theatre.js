/* ============================================================
   Warehouse Theatre — Frappe Page  v0.5.0
   Section-column layout matching reference UI
   ============================================================ */

frappe.pages["warehouse-theatre"].on_page_load = function (wrapper) {
  frappe.ui.make_app_page({
    parent: wrapper,
    title: "Warehouse Slot Map",
    single_column: true,
  });

  // Override Frappe container to go full width
  $("<style id='wt-override'>").text(`
    .layout-main-section-wrapper,.layout-main-section,.page-content {
      padding:0 !important; margin:0 !important; max-width:none !important;
    }
    .layout-side-section { display:none !important; }
    .layout-main-section { padding:0 !important; box-shadow:none !important; }
    .page-body .container { max-width:none !important; padding:0 !important; }
  `).appendTo("head");

  $("<style id='wt-styles'>").text(WT_CSS).appendTo("head");
  $(wrapper).find(".layout-main-section").html(WT_HTML);
  WT.init();
};

/* ─── HTML ─────────────────────────────────────────────────── */
var WT_HTML = `
<div id="wt-app">

  <!-- Topbar -->
  <div id="wt-topbar">
    <div id="wt-topbar-brand">🏭 Warehouse Slot Map</div>
    <div id="wt-topbar-controls">
      <select id="wt-company-select"><option value="">All Companies</option></select>
      <input id="wt-search" placeholder="Search sections…" autocomplete="off"/>
    </div>
    <div id="wt-topbar-actions">
      <span id="wt-updated-label"></span>
      <button id="wt-refresh-btn">↺ Refresh</button>
    </div>
  </div>

  <!-- Body -->
  <div id="wt-body">

    <!-- Sidebar -->
    <div id="wt-sidebar">
      <div id="wt-group-list"></div>
    </div>

    <!-- Main -->
    <div id="wt-main">

      <!-- Empty -->
      <div id="wt-empty">
        <div class="wt-empty-icon">🏭</div>
        <div class="wt-empty-text">Select a warehouse section</div>
        <div class="wt-empty-sub" id="wt-total-label">Loading…</div>
      </div>

      <!-- Loading -->
      <div id="wt-loading" style="display:none">
        <div class="wt-spinner"></div>
        <div class="wt-loading-text">Fetching slot data…</div>
      </div>

      <!-- Error -->
      <div id="wt-error" style="display:none"></div>

      <!-- Dashboard -->
      <div id="wt-dashboard" style="display:none">

        <!-- Section header -->
        <div id="wt-sec-header">
          <div id="wt-sec-info">
            <div id="wt-sec-name"></div>
            <div id="wt-sec-breadcrumb"></div>
          </div>
          <div id="wt-sec-pills">
            <div class="wt-pill"><div class="wt-pill-val" id="wt-p-total"></div><div class="wt-pill-lbl">Total</div></div>
            <div class="wt-pill wt-pill-occ"><div class="wt-pill-val" id="wt-p-occ"></div><div class="wt-pill-lbl">Occupied</div></div>
            <div class="wt-pill wt-pill-free"><div class="wt-pill-val" id="wt-p-free"></div><div class="wt-pill-lbl">Empty</div></div>
            <div class="wt-pill wt-pill-qty"><div class="wt-pill-val" id="wt-p-qty"></div><div class="wt-pill-lbl">Total Qty</div></div>
          </div>
        </div>

        <!-- Controls -->
        <div id="wt-controls">
          <div id="wt-filter-btns">
            <button class="wt-fb active" data-f="all">All</button>
            <button class="wt-fb" data-f="occupied">Occupied</button>
            <button class="wt-fb" data-f="empty">Empty</button>
          </div>
          <div id="wt-legend">
            <span class="wt-leg"><i class="wt-legbox" style="background:#d3f9d8;border-color:#8ce99a"></i>Low</span>
            <span class="wt-leg"><i class="wt-legbox" style="background:#fff3bf;border-color:#ffe066"></i>Mid</span>
            <span class="wt-leg"><i class="wt-legbox" style="background:#ffe8cc;border-color:#ffc078"></i>High</span>
            <span class="wt-leg"><i class="wt-legbox" style="background:#ffe3e3;border-color:#ffa8a8"></i>Full</span>
            <span class="wt-leg"><i class="wt-legbox wt-legbox-empty"></i>Empty</span>
          </div>
          <div id="wt-view-btns">
            <button class="wt-vb active" data-v="floor">⊞ Map</button>
            <button class="wt-vb" data-v="table">≡ Table</button>
          </div>
        </div>

        <!-- Floor: horizontally scrollable section columns -->
        <div id="wt-floor-view">
          <div id="wt-sections-row"></div>
        </div>

        <!-- Table view -->
        <div id="wt-table-view" style="display:none">
          <table id="wt-table">
            <thead><tr>
              <th>#</th><th>Slot</th>
              <th>Actual Qty</th><th>Reserved</th><th>Available</th>
              <th>Max Cap</th><th>Fill %</th><th></th>
            </tr></thead>
            <tbody id="wt-tbody"></tbody>
          </table>
        </div>

      </div><!-- /dashboard -->
    </div><!-- /main -->
  </div><!-- /body -->
</div><!-- /app -->

<!-- Drill-down Modal -->
<div id="wt-modal-overlay" style="display:none">
  <div id="wt-modal">
    <div id="wt-modal-hdr">
      <div>
        <div id="wt-modal-title"></div>
        <div id="wt-modal-sub"></div>
      </div>
      <button id="wt-modal-close">✕</button>
    </div>
    <div id="wt-modal-body">
      <div id="wt-modal-load"><div class="wt-spinner"></div></div>
      <div id="wt-modal-content" style="display:none">
        <div id="wt-modal-stats"></div>
        <div style="overflow-x:auto">
          <table id="wt-modal-table">
            <thead><tr>
              <th>#</th><th>Item Code</th><th>Item Name</th>
              <th>Group</th><th>UOM</th>
              <th>Actual</th><th>Reserved</th><th>Available</th><th>Rate ₹</th><th>Value ₹</th>
            </tr></thead>
            <tbody id="wt-modal-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
`;

/* ─── CSS ───────────────────────────────────────────────────── */
var WT_CSS = `
/* ── Base ── */
#wt-app { display:flex; flex-direction:column; height:calc(100vh - 57px); background:#f4f5f7; font-family:-apple-system,"Inter","Segoe UI",sans-serif; font-size:13px; color:#1a202c; }
#wt-app * { box-sizing:border-box; margin:0; padding:0; }

/* ── Topbar ── */
#wt-topbar {
  display:flex; align-items:center; gap:12px;
  background:#1a202c; color:#fff; padding:0 16px; height:48px; flex-shrink:0;
}
#wt-topbar-brand { font-size:14px; font-weight:700; white-space:nowrap; margin-right:4px; }
#wt-topbar-controls { display:flex; gap:8px; flex:1; max-width:460px; }
#wt-topbar-actions { display:flex; align-items:center; gap:10px; margin-left:auto; }
#wt-company-select, #wt-search {
  height:30px; padding:0 10px; border-radius:6px; font-size:12px; outline:none;
  border:1px solid rgba(255,255,255,0.18); background:rgba(255,255,255,0.1); color:#fff; flex:1;
}
#wt-company-select option { background:#1a202c; }
#wt-search::placeholder { color:rgba(255,255,255,0.35); }
#wt-company-select:focus, #wt-search:focus { border-color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.15); }
#wt-updated-label { font-size:10px; color:rgba(255,255,255,0.4); white-space:nowrap; }
#wt-refresh-btn {
  height:28px; padding:0 12px; border-radius:6px; font-size:12px; cursor:pointer; font-weight:500;
  background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.22); color:#fff;
}
#wt-refresh-btn:hover { background:rgba(255,255,255,0.2); }

/* ── Body ── */
#wt-body { display:flex; flex:1; overflow:hidden; }

/* ── Sidebar ── */
#wt-sidebar {
  width:200px; min-width:200px; background:#fff;
  border-right:1px solid #e2e8f0; overflow-y:auto; flex-shrink:0;
}
#wt-sidebar::-webkit-scrollbar { width:3px; }
#wt-sidebar::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:10px; }
.wt-parent-label {
  display:block; padding:10px 12px 3px;
  font-size:9px; font-weight:700; letter-spacing:1.5px; color:#cbd5e0; text-transform:uppercase;
}
.wt-group-item {
  display:block; padding:9px 12px 8px; cursor:pointer;
  border-left:3px solid transparent; border-bottom:1px solid #f7fafc; transition:background 0.1s;
}
.wt-group-item:hover { background:#f7fafc; }
.wt-group-item.active { background:#ebf8ff; border-left-color:#3182ce; }
.wt-gname { font-size:12px; font-weight:600; color:#2d3748; display:block; margin-bottom:2px; }
.wt-group-item.active .wt-gname { color:#2b6cb0; }
.wt-gmeta { font-size:10px; color:#a0aec0; display:block; }

/* ── Main ── */
#wt-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

/* ── States ── */
#wt-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:8px; }
.wt-empty-icon { font-size:44px; }
.wt-empty-text { font-size:15px; color:#718096; }
.wt-empty-sub { font-size:12px; color:#a0aec0; }
#wt-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:12px; }
.wt-spinner { width:28px; height:28px; border:2.5px solid #e2e8f0; border-top-color:#3182ce; border-radius:50%; animation:wt-spin 0.7s linear infinite; }
.wt-loading-text { font-size:12px; color:#718096; }
@keyframes wt-spin { to { transform:rotate(360deg); } }
#wt-error { margin:16px; padding:12px 16px; background:#fff5f5; border:1px solid #fed7d7; border-radius:8px; color:#c53030; }

/* ── Dashboard ── */
#wt-dashboard { display:flex; flex-direction:column; flex:1; overflow:hidden; }

/* ── Section header ── */
#wt-sec-header {
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:12px 20px; background:#fff; border-bottom:1px solid #e2e8f0; flex-shrink:0;
}
#wt-sec-name { font-size:22px; font-weight:800; color:#1a202c; letter-spacing:-0.5px; }
#wt-sec-breadcrumb { font-size:11px; color:#a0aec0; margin-top:2px; }
#wt-sec-pills { display:flex; gap:6px; flex-shrink:0; }
.wt-pill {
  display:flex; flex-direction:column; align-items:center;
  padding:6px 16px; border-radius:10px; background:#f7fafc; min-width:70px;
}
.wt-pill-val { font-size:22px; font-weight:800; color:#2d3748; line-height:1.1; }
.wt-pill-lbl { font-size:9px; color:#a0aec0; font-weight:700; letter-spacing:0.5px; margin-top:1px; }
.wt-pill-occ  .wt-pill-val { color:#dd6b20; }
.wt-pill-free .wt-pill-val { color:#276749; }
.wt-pill-qty  .wt-pill-val { color:#2b6cb0; font-size:18px; }

/* ── Controls ── */
#wt-controls {
  display:flex; align-items:center; gap:10px; padding:8px 20px;
  background:#fff; border-bottom:1px solid #edf2f7; flex-shrink:0; flex-wrap:wrap;
}
#wt-filter-btns, #wt-view-btns { display:flex; gap:3px; }
.wt-fb, .wt-vb {
  padding:4px 12px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer;
  border:1px solid #e2e8f0; background:#f7fafc; color:#718096; transition:all 0.12s;
}
.wt-fb:hover, .wt-vb:hover { background:#edf2f7; }
.wt-fb.active { background:#2b6cb0; border-color:#2b6cb0; color:#fff; }
.wt-vb.active { background:#1a202c; border-color:#1a202c; color:#fff; }
#wt-legend { display:flex; gap:10px; flex:1; flex-wrap:wrap; align-items:center; }
.wt-leg { display:flex; align-items:center; gap:5px; font-size:11px; color:#718096; }
.wt-legbox { display:inline-block; width:16px; height:16px; border-radius:5px; border:1.5px solid; flex-shrink:0; }
.wt-legbox-empty {
  background:repeating-linear-gradient(-45deg, #e2e8f0 0px, #e2e8f0 2px, #f7fafc 2px, #f7fafc 6px);
  border-color:#cbd5e0;
}

/* ── Floor view: horizontal scroll of section columns ── */
#wt-floor-view {
  flex:1; overflow-y:auto; padding:20px;
}
#wt-floor-view::-webkit-scrollbar { width:5px; }
#wt-floor-view::-webkit-scrollbar-thumb { background:#cbd5e0; border-radius:10px; }

/* 4-column wrapping grid */
#wt-sections-row {
  display:grid;
  grid-template-columns:repeat(4, 1fr);
  gap:16px;
  align-items:start;
}

/* ── Section column card ── */
.wt-sec-card {
  background:#fff; border-radius:14px; padding:14px 12px;
  border:2px solid #e2e8f0; width:100%;
  box-shadow:0 1px 3px rgba(0,0,0,0.06);
  transition:border-color 0.15s, box-shadow 0.15s;
}
.wt-sec-card:hover { border-color:#bee3f8; box-shadow:0 4px 12px rgba(49,130,206,0.12); }
.wt-sec-card-hdr {
  display:flex; justify-content:space-between; align-items:flex-start;
  margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #edf2f7;
}
.wt-sec-card-name { font-size:12px; font-weight:800; color:#2d3748; line-height:1.3; max-width:110px; word-break:break-word; }
.wt-sec-card-count {
  font-size:10px; font-weight:700; color:#718096;
  background:#f7fafc; border-radius:6px; padding:2px 6px; white-space:nowrap; flex-shrink:0;
}
.wt-sec-card-count.red    { background:#fff5f5; color:#c53030; }
.wt-sec-card-count.orange { background:#fffaf0; color:#c05621; }
.wt-sec-card-count.green  { background:#f0fff4; color:#276749; }

/* ── Slot grid inside section card: 2 columns ── */
.wt-slot-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:6px;
}

/* ── Slot cell ── */
.wt-slot {
  border-radius:10px; padding:8px 4px 6px;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  min-height:54px; cursor:pointer; text-align:center;
  transition:transform 0.1s, box-shadow 0.1s; position:relative; overflow:hidden;
  border:1.5px solid #e2e8f0;
}
.wt-slot:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.12); z-index:1; }
.wt-slot-name { font-size:11px; font-weight:800; line-height:1.2; word-break:break-all; }
.wt-slot-qty  { font-size:9px; margin-top:3px; line-height:1; font-weight:600; }
.wt-slot-bar  { position:absolute; bottom:0; left:0; right:0; height:3px; }

/* Empty: hatched */
.wt-slot.empty {
  background:repeating-linear-gradient(-45deg, #f0f4f8 0px, #f0f4f8 3px, #fff 3px, #fff 8px);
  border-color:#e2e8f0;
}
.wt-slot.empty .wt-slot-name { color:#cbd5e0; }
.wt-slot.empty .wt-slot-qty  { color:#e2e8f0; }

/* Occupied states */
.wt-slot.low  { background:#d3f9d8; border-color:#8ce99a; }
.wt-slot.low  .wt-slot-name { color:#276749; }
.wt-slot.low  .wt-slot-qty  { color:#40c057; }

.wt-slot.mid  { background:#fff3bf; border-color:#ffe066; }
.wt-slot.mid  .wt-slot-name { color:#7b6002; }
.wt-slot.mid  .wt-slot-qty  { color:#c99a00; }

.wt-slot.high { background:#ffe8cc; border-color:#ffc078; }
.wt-slot.high .wt-slot-name { color:#7c3d0c; }
.wt-slot.high .wt-slot-qty  { color:#e8590c; }

.wt-slot.full { background:#ffe3e3; border-color:#ffa8a8; }
.wt-slot.full .wt-slot-name { color:#c53030; }
.wt-slot.full .wt-slot-qty  { color:#e53e3e; }

/* ── Table view ── */
#wt-table-view { flex:1; overflow-y:auto; }
#wt-table { width:100%; border-collapse:collapse; font-size:12px; }
#wt-table thead tr { background:#f7fafc; position:sticky; top:0; z-index:2; }
#wt-table th { padding:9px 12px; font-size:10px; font-weight:700; color:#718096; letter-spacing:0.5px; border-bottom:2px solid #e2e8f0; text-align:left; white-space:nowrap; }
#wt-table th:nth-child(n+3) { text-align:right; }
#wt-table td { padding:8px 12px; border-bottom:1px solid #edf2f7; color:#4a5568; }
#wt-table td:nth-child(n+3) { text-align:right; font-variant-numeric:tabular-nums; }
#wt-table tbody tr:hover { background:#f7fafc; cursor:pointer; }
.wt-fill-wrap { display:flex; align-items:center; gap:5px; justify-content:flex-end; }
.wt-fill-bar  { height:5px; border-radius:3px; min-width:2px; }
.wt-btn-items { padding:3px 9px; border-radius:5px; border:1px solid #e2e8f0; background:#fff; font-size:11px; color:#3182ce; cursor:pointer; font-weight:600; }
.wt-btn-items:hover { background:#ebf8ff; }
.wt-cap-span { cursor:pointer; border-bottom:1px dashed #cbd5e0; color:#a0aec0; }
.wt-cap-span:hover { color:#3182ce; border-color:#3182ce; }
.wt-cap-inp { width:68px; border:1px solid #3182ce; border-radius:4px; padding:2px 5px; font-size:12px; outline:none; text-align:right; }

/* ── Modal ── */
#wt-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:99999; display:flex; align-items:center; justify-content:center; }
#wt-modal { background:#fff; border-radius:12px; width:93vw; max-width:1020px; max-height:88vh; display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,0.2); overflow:hidden; }
#wt-modal-hdr { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid #e2e8f0; background:#f7fafc; flex-shrink:0; }
#wt-modal-title { font-size:15px; font-weight:700; color:#1a202c; }
#wt-modal-sub { font-size:11px; color:#718096; margin-top:2px; }
#wt-modal-close { background:#edf2f7; border:none; border-radius:6px; padding:4px 10px; font-size:13px; cursor:pointer; color:#4a5568; }
#wt-modal-close:hover { background:#e2e8f0; }
#wt-modal-body { flex:1; overflow-y:auto; padding:16px 18px; }
#wt-modal-load { display:flex; justify-content:center; padding:40px; }
#wt-modal-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:8px; margin-bottom:14px; }
.wt-mstat { background:#f7fafc; border-radius:8px; padding:10px 12px; }
.wt-mstat-l { font-size:9px; font-weight:700; color:#a0aec0; letter-spacing:0.5px; margin-bottom:3px; }
.wt-mstat-v { font-size:18px; font-weight:700; color:#1a202c; }
#wt-modal-table { width:100%; border-collapse:collapse; font-size:12px; }
#wt-modal-table thead tr { background:#f7fafc; }
#wt-modal-table th { padding:8px 10px; font-size:10px; font-weight:700; color:#718096; border-bottom:2px solid #e2e8f0; text-align:left; white-space:nowrap; }
#wt-modal-table th:nth-child(n+6) { text-align:right; }
#wt-modal-table td { padding:7px 10px; border-bottom:1px solid #edf2f7; color:#4a5568; }
#wt-modal-table td:nth-child(n+6) { text-align:right; font-variant-numeric:tabular-nums; }
#wt-modal-table tbody tr:hover { background:#f7fafc; }
`;

/* ─── App Logic ─────────────────────────────────────────────── */
var WT = {
  API:   "warehouse_theatre.warehouse_theatre.api.",
  state: { groups:[], selected:null, bins:[], total:0, filter:"all", view:"floor" },

  _call: function(method, args) {
    return new Promise(function(resolve, reject) {
      frappe.call({
        method: WT.API + method, args: args || {},
        callback: function(r) { r.exc ? reject(new Error(r.exc)) : resolve(r.message); },
        error: reject,
      });
    });
  },

  init: function() {
    this._loadCompanies();
    this._loadGroups();
    this._bindEvents();
  },

  /* ── Companies ── */
  _loadCompanies: function() {
    this._call("get_companies").then(function(data) {
      var opts = '<option value="">All Companies</option>';
      (data||[]).forEach(function(c){ opts += '<option value="'+WT._esc(c.name)+'">'+WT._esc(c.name)+'</option>'; });
      $("#wt-company-select").html(opts);
    });
  },

  /* ── Groups ── */
  _loadGroups: function(company) {
    this._call("get_warehouse_groups", { company: company||"" }).then(function(data) {
      WT.state.groups = data || [];
      WT._renderSidebar(WT.state.groups);
      var slots = WT.state.groups.reduce(function(s,g){ return s+(g.leaf_count||0); },0);
      $("#wt-total-label").text(WT.state.groups.length+" sections · "+slots.toLocaleString("en-IN")+" total slots");
    });
  },

  /* ── Sidebar ── */
  _renderSidebar: function(groups) {
    var $list = $("#wt-group-list").empty();
    var byParent = {};
    groups.forEach(function(g) {
      var k = g.parent_name || "Root";
      if (!byParent[k]) byParent[k] = [];
      byParent[k].push(g);
    });
    Object.entries(byParent).forEach(function([parent, gs]) {
      $list.append('<span class="wt-parent-label">'+WT._esc(parent)+'</span>');
      gs.forEach(function(g) {
        var act = WT.state.selected && WT.state.selected.id === g.id;
        var $el = $('<div class="wt-group-item'+(act?" active":"")+'">'
          +'<span class="wt-gname">'+WT._esc(g.name)+'</span>'
          +'<span class="wt-gmeta">'+(g.leaf_count||0)+' slots</span></div>');
        $el.on("click", function(){ WT._select(g); });
        $list.append($el);
      });
    });
  },

  _select: function(group) {
    WT.state.selected = group;
    WT.state.filter = "all";
    $(".wt-fb").removeClass("active"); $(".wt-fb[data-f='all']").addClass("active");
    WT._loadBins(group.id);
  },

  /* ── Bins ── */
  _loadBins: function(pw) {
    WT._show("loading");
    WT._call("get_group_bins", { parent_warehouse: pw }).then(function(data) {
      WT.state.bins  = data.bins || [];
      WT.state.total = data.total_warehouses || 0;
      WT._show("dashboard");
      WT._render();
      $("#wt-updated-label").text("Updated "+new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    }).catch(function(e){ WT._show("error"); $("#wt-error").text("⚠ "+e.message); });
  },

  /* ── Render ── */
  _render: function() {
    var bins  = WT.state.bins;
    var total = WT.state.total;
    var occ   = bins.filter(function(b){ return parseFloat(b.actual_qty)>0; }).length;
    var free  = total - occ;
    var qty   = bins.reduce(function(s,b){ return s+(parseFloat(b.actual_qty)||0); },0);
    var g     = WT.state.selected;

    $("#wt-sec-name").text(g ? g.name : "");
    $("#wt-sec-breadcrumb").text((g && g.parent_name ? g.parent_name+" › " : "")+occ+" occupied · "+free+" empty");
    $("#wt-p-total").text(total);
    $("#wt-p-occ").text(occ);
    $("#wt-p-free").text(free);
    $("#wt-p-qty").text(WT._snum(qty));

    $(".wt-group-item.active .wt-gmeta").text(occ+"/"+total+" occupied");

    if (WT.state.view==="floor") WT._renderFloor(bins);
    else                         WT._renderTable(bins);
  },

  /* ── Floor map: sections as columns ── */
  _renderFloor: function(bins) {
    var filter = WT.state.filter;
    var disp = bins;
    if (filter==="occupied") disp = bins.filter(function(b){ return parseFloat(b.actual_qty)>0; });
    if (filter==="empty")    disp = bins.filter(function(b){ return !(parseFloat(b.actual_qty)>0); });

    // Group by row/section prefix → these become the columns
    var cols = {}, order = [];
    disp.forEach(function(b) {
      var k = WT._colKey(b.warehouse_name || b.warehouse);
      if (!cols[k]) { cols[k]=[]; order.push(k); }
      cols[k].push(b);
    });

    var html = "";
    order.forEach(function(colKey) {
      var cb   = cols[colKey];
      var cocc = cb.filter(function(b){ return parseFloat(b.actual_qty)>0; }).length;
      var pct  = cb.length>0 ? Math.round((cocc/cb.length)*100) : 0;
      var cntCls = pct>=80?"red":pct>=50?"orange":"green";

      html += '<div class="wt-sec-card">';
      html += '<div class="wt-sec-card-hdr">';
      html += '<div class="wt-sec-card-name">'+WT._esc(colKey)+'</div>';
      html += '<div class="wt-sec-card-count '+cntCls+'">'+cocc+'/'+cb.length+'</div>';
      html += '</div>';
      html += '<div class="wt-slot-grid">';

      cb.forEach(function(b) {
        var actual = parseFloat(b.actual_qty)||0;
        var maxCap = parseFloat(b.max_capacity)||0;
        var fp     = maxCap>0 ? Math.min(100,Math.round((actual/maxCap)*100)) : (actual>0?50:0);
        var sc     = actual===0?"empty":fp>=90?"full":fp>=70?"high":fp>=40?"mid":"low";
        var barClr = actual===0?"transparent":fp>=90?"#e53e3e":fp>=70?"#e8590c":fp>=40?"#c99a00":"#40c057";
        var sname  = WT._sname(b.warehouse_name||b.warehouse);
        var qty    = actual>0 ? WT._snum(actual) : "—";
        var tip    = (b.warehouse_name||b.warehouse)+(actual>0?"\nQty: "+WT._fmt(actual):"\nEmpty");

        html += '<div class="wt-slot '+sc+'" data-wh="'+WT._esc(b.warehouse)+'" title="'+WT._esc(tip)+'">';
        html += '<div class="wt-slot-name">'+WT._esc(sname)+'</div>';
        html += '<div class="wt-slot-qty">'+qty+'</div>';
        html += '<div class="wt-slot-bar" style="background:'+barClr+'"></div>';
        html += '</div>';
      });

      html += '</div></div>'; // /slot-grid /sec-card
    });

    if (!html) html = '<div style="padding:40px;color:#a0aec0;font-size:13px">No slots match the current filter</div>';
    $("#wt-sections-row").html(html);

    $("#wt-sections-row").off("click",".wt-slot").on("click",".wt-slot",function(){
      var wh=$(this).data("wh"); if(wh) WT._openModal(wh);
    });
  },

  /* ── Table view ── */
  _renderTable: function(bins) {
    var filter = WT.state.filter;
    var rows = bins;
    if (filter==="occupied") rows = bins.filter(function(b){ return parseFloat(b.actual_qty)>0; });
    if (filter==="empty")    rows = bins.filter(function(b){ return !(parseFloat(b.actual_qty)>0); });

    var html = rows.slice(0,300).map(function(b,i){
      var a=parseFloat(b.actual_qty)||0, r=parseFloat(b.reserved_qty)||0;
      var av=a-r, mc=parseFloat(b.max_capacity)||0;
      var fp=mc>0?Math.min(100,Math.round((a/mc)*100)):null;
      var fc=fp!==null?(fp>=90?"#e53e3e":fp>=70?"#e8590c":fp>=40?"#c99a00":"#40c057"):"#e2e8f0";
      var fillCell=fp!==null
        ?'<div class="wt-fill-wrap"><div class="wt-fill-bar" style="width:'+Math.max(2,fp*0.5)+'px;background:'+fc+'"></div><span style="color:'+fc+';font-weight:700">'+fp+'%</span></div>'
        :'<span style="color:#e2e8f0">—</span>';
      var capCell=mc>0
        ?'<span class="wt-cap-span" data-wh="'+WT._esc(b.warehouse)+'">'+WT._fmt(mc)+'</span>'
        :'<span class="wt-cap-span" data-wh="'+WT._esc(b.warehouse)+'" style="color:#cbd5e0">Set</span>';
      return '<tr data-wh="'+WT._esc(b.warehouse)+'">'
        +'<td style="color:#cbd5e0;text-align:center;width:36px">'+(i+1)+'</td>'
        +'<td style="font-weight:600;color:#1a202c;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+WT._esc(b.warehouse)+'">'+WT._esc(b.warehouse_name||b.warehouse)+'</td>'
        +'<td style="color:'+(a>0?"#2b6cb0":"#e2e8f0")+';font-weight:700">'+(a>0?WT._fmt(a):"—")+'</td>'
        +'<td style="color:'+(r>0?"#c05621":"#e2e8f0")+'">'+(r>0?WT._fmt(r):"—")+'</td>'
        +'<td style="color:'+(av>0?"#276749":"#e2e8f0")+'">'+(a>0?WT._fmt(av):"—")+'</td>'
        +'<td>'+capCell+'</td>'
        +'<td>'+fillCell+'</td>'
        +'<td><button class="wt-btn-items" data-wh="'+WT._esc(b.warehouse)+'">Items</button></td>'
        +'</tr>';
    }).join("");
    if(!html) html='<tr><td colspan="8" style="text-align:center;padding:30px;color:#a0aec0">No slots match filter</td></tr>';
    $("#wt-tbody").html(html);

    $("#wt-tbody").off("click","tr").on("click","tr",function(e){
      if($(e.target).is(".wt-btn-items,.wt-cap-span,.wt-cap-inp")) return;
      var wh=$(this).data("wh"); if(wh) WT._openModal(wh);
    });
    $("#wt-tbody").off("click",".wt-btn-items").on("click",".wt-btn-items",function(e){
      e.stopPropagation(); WT._openModal($(this).data("wh"));
    });
    $("#wt-tbody").off("click",".wt-cap-span").on("click",".wt-cap-span",function(e){
      e.stopPropagation();
      var wh=$(this).data("wh"), cur=parseFloat($(this).text())||0;
      var $inp=$('<input class="wt-cap-inp" type="number" min="0" value="'+cur+'">');
      $(this).replaceWith($inp); $inp.focus().select();
      function save(){
        var v=parseFloat($inp.val())||0;
        WT._call("save_max_capacity",{warehouse:wh,max_capacity:v}).then(function(){
          var b=WT.state.bins.find(function(x){return x.warehouse===wh;});
          if(b) b.max_capacity=v;
          WT._renderTable(WT.state.bins);
          frappe.show_alert({message:"Saved",indicator:"green"},2);
        }).catch(function(){ WT._renderTable(WT.state.bins); });
      }
      $inp.on("keydown",function(e){ if(e.key==="Enter")save(); if(e.key==="Escape")WT._renderTable(WT.state.bins); }).on("blur",save);
    });
  },

  /* ── Modal ── */
  _openModal: function(wh) {
    var bin=WT.state.bins.find(function(b){return b.warehouse===wh;});
    var whName=bin?(bin.warehouse_name||wh):wh;
    var actual=bin?parseFloat(bin.actual_qty)||0:0;
    $("#wt-modal-title").text(whName);
    $("#wt-modal-sub").text(actual>0?"Actual Qty: "+WT._fmt(actual):"Empty warehouse");
    $("#wt-modal-load").show(); $("#wt-modal-content").hide();
    $("#wt-modal-overlay").show();
    WT._call("get_warehouse_items",{warehouse:wh}).then(function(items){
      WT._renderModal(items);
    }).catch(function(e){
      $("#wt-modal-tbody").html('<tr><td colspan="10" style="color:#c53030;padding:16px">Error: '+e.message+'</td></tr>');
      $("#wt-modal-load").hide(); $("#wt-modal-content").show();
    });
  },

  _renderModal: function(items) {
    var tq=items.reduce(function(s,i){return s+(parseFloat(i.actual_qty)||0);},0);
    var tv=items.reduce(function(s,i){return s+(parseFloat(i.stock_value)||0);},0);
    $("#wt-modal-stats").html([
      {l:"ITEMS",v:items.length,c:"#1a202c"},
      {l:"TOTAL QTY",v:WT._fmt(tq),c:"#2b6cb0"},
      {l:"STOCK VALUE",v:"₹"+WT._fmtC(tv),c:"#276749"},
    ].map(function(s){return '<div class="wt-mstat"><div class="wt-mstat-l">'+s.l+'</div><div class="wt-mstat-v" style="color:'+s.c+'">'+s.v+'</div></div>';}).join(""));
    var html=items.map(function(it,i){
      var a=parseFloat(it.actual_qty)||0, r=parseFloat(it.reserved_qty)||0, av=parseFloat(it.available_qty)||0;
      return '<tr>'
        +'<td style="color:#cbd5e0;text-align:center">'+(i+1)+'</td>'
        +'<td><a href="/app/item/'+encodeURIComponent(it.item_code)+'" target="_blank" style="color:#2b6cb0;font-weight:700">'+WT._esc(it.item_code)+'</a></td>'
        +'<td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+WT._esc(it.item_name||"")+'</td>'
        +'<td>'+WT._esc(it.item_group||"")+'</td>'
        +'<td>'+WT._esc(it.stock_uom||"")+'</td>'
        +'<td style="font-weight:700;color:#2b6cb0">'+WT._fmt(a)+'</td>'
        +'<td style="color:'+(r>0?"#c05621":"#cbd5e0")+'">'+(r>0?WT._fmt(r):"—")+'</td>'
        +'<td style="color:'+(av>0?"#276749":"#cbd5e0")+'">'+WT._fmt(av)+'</td>'
        +'<td style="color:#718096">'+WT._fmt(parseFloat(it.valuation_rate)||0)+'</td>'
        +'<td style="color:#276749;font-weight:700">'+WT._fmtC(parseFloat(it.stock_value)||0)+'</td>'
        +'</tr>';
    }).join("");
    if(!html) html='<tr><td colspan="10" style="text-align:center;padding:24px;color:#a0aec0">No items with stock</td></tr>';
    $("#wt-modal-tbody").html(html);
    $("#wt-modal-load").hide(); $("#wt-modal-content").show();
  },

  /* ── Events ── */
  _bindEvents: function() {
    $(document).on("input","#wt-search",function(){
      var q=$(this).val().toLowerCase();
      WT._renderSidebar(q ? WT.state.groups.filter(function(g){ return g.name.toLowerCase().includes(q)||(g.parent_name||"").toLowerCase().includes(q); }) : WT.state.groups);
    });
    $(document).on("change","#wt-company-select",function(){ WT._loadGroups($(this).val()); });
    $(document).on("click","#wt-refresh-btn",function(){ if(WT.state.selected) WT._loadBins(WT.state.selected.id); });
    $(document).on("click",".wt-fb",function(){
      $(".wt-fb").removeClass("active"); $(this).addClass("active");
      WT.state.filter=$(this).data("f");
      if(WT.state.bins.length){ if(WT.state.view==="floor") WT._renderFloor(WT.state.bins); else WT._renderTable(WT.state.bins); }
    });
    $(document).on("click",".wt-vb",function(){
      $(".wt-vb").removeClass("active"); $(this).addClass("active");
      WT.state.view=$(this).data("v");
      if(WT.state.view==="floor"){ $("#wt-floor-view").show();$("#wt-table-view").hide(); if(WT.state.bins.length) WT._renderFloor(WT.state.bins); }
      else { $("#wt-floor-view").hide();$("#wt-table-view").show(); if(WT.state.bins.length) WT._renderTable(WT.state.bins); }
    });
    $(document).on("click","#wt-modal-close",function(){ $("#wt-modal-overlay").hide(); });
    $(document).on("click","#wt-modal-overlay",function(e){ if(e.target.id==="wt-modal-overlay") $("#wt-modal-overlay").hide(); });
    $(document).on("keydown",function(e){ if(e.key==="Escape") $("#wt-modal-overlay").hide(); });
  },

  /* ── Helpers ── */
  _show: function(s){
    $("#wt-empty,#wt-loading,#wt-error,#wt-dashboard").hide();
    if(s==="loading")   $("#wt-loading").show();
    if(s==="dashboard") $("#wt-dashboard").show();
    if(s==="error")     $("#wt-error").show();
    if(s==="empty")     $("#wt-empty").show();
  },

  /* derive column key from warehouse name — becomes section card title */
  _colKey: function(name) {
    var clean = name.replace(/\s*-\s*[A-Z]{2,5}$/, "").trim();
    // e.g. "A401" → "A" group, "BOX-1" → "BOX", "LM/1001A" → "LM/10"
    var m = clean.match(/^([A-Za-z\/]+?)[-_\/]?\d/);
    if (m) return m[1].replace(/\/$/,"");
    // fallback: first word
    return clean.split(/[\s\-_\/]/)[0] || clean.substring(0,5);
  },

  /* short display name inside the slot card */
  _sname: function(name) {
    var clean = name.replace(/\s*-\s*[A-Z]{2,5}$/, "").trim();
    // If already short, show as-is
    if (clean.length <= 8) return clean;
    // Try to show last meaningful part (e.g. "LM/1001A" → "1001A")
    var parts = clean.split(/[\s\/\-_]+/);
    var last = parts[parts.length-1] || clean;
    return last.length<=8 ? last : last.substring(0,7)+"…";
  },

  _snum: function(n){ n=parseFloat(n)||0; if(n>=1e6) return (n/1e6).toFixed(1)+"M"; if(n>=1000) return (n/1000).toFixed(1)+"K"; return n.toLocaleString("en-IN",{maximumFractionDigits:1}); },
  _fmt:  function(n){ return (parseFloat(n)||0).toLocaleString("en-IN",{maximumFractionDigits:2}); },
  _fmtC: function(n){ return (parseFloat(n)||0).toLocaleString("en-IN",{maximumFractionDigits:0}); },
  _esc:  function(s){ return frappe.utils.escape_html(String(s||"")); },
};
