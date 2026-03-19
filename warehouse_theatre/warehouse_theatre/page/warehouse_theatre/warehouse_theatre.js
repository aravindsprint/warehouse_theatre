/* ============================================================
   Warehouse Theatre — Frappe Page  v0.3.0
   Full-width floor map, compact named slot cards
   ============================================================ */

frappe.pages["warehouse-theatre"].on_page_load = function (wrapper) {
  frappe.ui.make_app_page({
    parent: wrapper,
    title: "Warehouse Slot Map",
    single_column: true,
  });

  // ── Force full-width: bust Frappe's container padding ──
  $("<style id='wt-global-override'>").text(`
    .layout-main-section-wrapper,
    .layout-main-section,
    .page-content,
    .page-head + .layout-main { padding:0 !important; margin:0 !important; max-width:none !important; }
    .page-wrapper .layout-main { padding-top:0 !important; }
    .layout-side-section { display:none !important; }
    .layout-main-section { padding:0 !important; }
    .page-body .container { max-width:none !important; padding:0 !important; }
  `).appendTo("head");

  $("<style id='wt-styles'>").text(WT_CSS).appendTo("head");
  $(wrapper).find(".layout-main-section").html(WT_HTML);
  WT.init();
};

/* ─── HTML ──────────────────────────────────────────────────── */
var WT_HTML = `
<div id="wt-app">
  <!-- Topbar -->
  <div id="wt-topbar">
    <div id="wt-topbar-left">
      <span id="wt-topbar-title">🏭 Warehouse Slot Map</span>
    </div>
    <div id="wt-topbar-center">
      <select id="wt-company-select"><option value="">All Companies</option></select>
      <input id="wt-search" placeholder="Search sections…" autocomplete="off"/>
    </div>
    <div id="wt-topbar-right">
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

      <div id="wt-empty">
        <div style="font-size:40px;margin-bottom:10px">🏭</div>
        <div style="font-size:14px;color:#6c757d;margin-bottom:4px">Select a section</div>
        <div style="font-size:11px;color:#adb5bd" id="wt-total-label">Loading…</div>
      </div>

      <div id="wt-loading" style="display:none">
        <div class="wt-spinner"></div>
        <div style="font-size:12px;color:#868e96;margin-top:10px">Fetching…</div>
      </div>

      <div id="wt-error" style="display:none"></div>

      <div id="wt-dashboard" style="display:none">

        <!-- Section header strip -->
        <div id="wt-sec-header">
          <div id="wt-sec-left">
            <div id="wt-sec-name"></div>
            <div id="wt-sec-sub"></div>
          </div>
          <div id="wt-sec-stats">
            <div class="wt-pill wt-pill-total"><span id="wt-sp-total"></span><em>Total</em></div>
            <div class="wt-pill wt-pill-occ"><span id="wt-sp-occ"></span><em>Occupied</em></div>
            <div class="wt-pill wt-pill-empty"><span id="wt-sp-empty"></span><em>Empty</em></div>
            <div class="wt-pill wt-pill-qty"><span id="wt-sp-qty"></span><em>Total Qty</em></div>
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
            <span class="wt-leg"><i class="wt-legdot" style="background:#ebfbee;border-color:#8ce99a"></i>Low</span>
            <span class="wt-leg"><i class="wt-legdot" style="background:#fff9db;border-color:#ffe066"></i>Mid</span>
            <span class="wt-leg"><i class="wt-legdot" style="background:#fff4e6;border-color:#ffc078"></i>High</span>
            <span class="wt-leg"><i class="wt-legdot" style="background:#fff5f5;border-color:#ffa8a8"></i>Full</span>
            <span class="wt-leg"><i class="wt-legdot" style="background:#f8f9fa;border-color:#dee2e6"></i>Empty</span>
          </div>
          <div id="wt-view-btns">
            <button class="wt-vb active" data-v="floor">⊞ Map</button>
            <button class="wt-vb" data-v="table">≡ Table</button>
          </div>
        </div>

        <!-- Floor map -->
        <div id="wt-floor-view">
          <div id="wt-rows-container"></div>
        </div>

        <!-- Table -->
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

<!-- Modal -->
<div id="wt-modal-overlay" style="display:none">
  <div id="wt-modal">
    <div id="wt-modal-hdr">
      <div><div id="wt-modal-title"></div><div id="wt-modal-sub"></div></div>
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

/* ─── CSS ────────────────────────────────────────────────────── */
var WT_CSS = `
#wt-app { display:flex; flex-direction:column; height:calc(100vh - 57px); background:#f0f2f5; font-family:-apple-system,"Inter","Segoe UI",sans-serif; font-size:13px; color:#212529; }
#wt-app * { box-sizing:border-box; margin:0; padding:0; }

/* Topbar */
#wt-topbar {
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  background:#1a1a2e; color:#fff; padding:0 16px; height:46px; flex-shrink:0;
  border-bottom:2px solid #2c2c54;
}
#wt-topbar-title { font-size:14px; font-weight:700; letter-spacing:0.3px; white-space:nowrap; }
#wt-topbar-center { display:flex; align-items:center; gap:8px; flex:1; max-width:500px; }
#wt-company-select {
  height:30px; padding:0 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.2);
  background:rgba(255,255,255,0.08); color:#fff; font-size:12px; outline:none; cursor:pointer;
  flex:1; min-width:0;
}
#wt-company-select option { background:#1a1a2e; color:#fff; }
#wt-search {
  height:30px; padding:0 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.2);
  background:rgba(255,255,255,0.08); color:#fff; font-size:12px; outline:none; flex:1; min-width:0;
}
#wt-search::placeholder { color:rgba(255,255,255,0.35); }
#wt-search:focus, #wt-company-select:focus { border-color:rgba(255,255,255,0.5); background:rgba(255,255,255,0.12); }
#wt-topbar-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
#wt-updated-label { font-size:10px; color:rgba(255,255,255,0.4); white-space:nowrap; }
#wt-refresh-btn {
  height:28px; padding:0 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.25);
  background:rgba(255,255,255,0.1); color:#fff; font-size:12px; cursor:pointer;
}
#wt-refresh-btn:hover { background:rgba(255,255,255,0.18); }

/* Body */
#wt-body { display:flex; flex:1; overflow:hidden; }

/* Sidebar */
#wt-sidebar {
  width:210px; min-width:210px; background:#fff; border-right:1px solid #e9ecef;
  overflow-y:auto; flex-shrink:0;
}
#wt-sidebar::-webkit-scrollbar { width:3px; }
#wt-sidebar::-webkit-scrollbar-thumb { background:#dee2e6; border-radius:10px; }
.wt-parent-label {
  padding:10px 12px 3px; font-size:9px; font-weight:700;
  letter-spacing:1.5px; color:#ced4da; text-transform:uppercase; display:block;
}
.wt-group-item {
  display:block; padding:8px 12px; cursor:pointer; border-left:3px solid transparent;
  border-bottom:1px solid #f8f9fa; transition:background 0.1s;
}
.wt-group-item:hover { background:#f8f9fa; }
.wt-group-item.active { background:#e7f5ff; border-left-color:#1971c2; }
.wt-gname { font-size:12px; font-weight:600; color:#343a40; display:block; }
.wt-group-item.active .wt-gname { color:#1971c2; }
.wt-gmeta { font-size:10px; color:#adb5bd; margin-top:1px; display:block; }

/* Main */
#wt-main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }

/* States */
#wt-empty, #wt-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; }
.wt-spinner { width:28px; height:28px; border:2.5px solid #e9ecef; border-top-color:#1971c2; border-radius:50%; animation:wt-spin 0.7s linear infinite; }
@keyframes wt-spin { to { transform:rotate(360deg); } }
#wt-error { margin:16px; padding:12px 16px; background:#fff5f5; border:1px solid #ffc9c9; border-radius:8px; color:#c92a2a; font-size:13px; }

/* Dashboard */
#wt-dashboard { display:flex; flex-direction:column; flex:1; overflow:hidden; }

/* Section header */
#wt-sec-header {
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  padding:10px 16px; background:#fff; border-bottom:1px solid #e9ecef; flex-shrink:0;
}
#wt-sec-name { font-size:18px; font-weight:700; color:#1a1a2e; line-height:1.2; }
#wt-sec-sub { font-size:11px; color:#868e96; margin-top:2px; }
#wt-sec-stats { display:flex; gap:6px; flex-shrink:0; }
.wt-pill { display:flex; flex-direction:column; align-items:center; padding:5px 14px; border-radius:8px; background:#f8f9fa; min-width:64px; }
.wt-pill span { font-size:20px; font-weight:700; color:#343a40; line-height:1.1; }
.wt-pill em { font-size:9px; color:#adb5bd; font-style:normal; font-weight:600; letter-spacing:0.5px; margin-top:1px; }
.wt-pill-occ span { color:#e67700; }
.wt-pill-empty span { color:#2f9e44; }
.wt-pill-qty span { color:#1971c2; }

/* Controls */
#wt-controls {
  display:flex; align-items:center; gap:10px; padding:7px 16px;
  background:#fff; border-bottom:1px solid #f1f3f5; flex-shrink:0; flex-wrap:wrap;
}
#wt-filter-btns, #wt-view-btns { display:flex; gap:3px; }
.wt-fb, .wt-vb {
  padding:4px 11px; border-radius:5px; font-size:11px; font-weight:600; cursor:pointer;
  border:1px solid #dee2e6; background:#f8f9fa; color:#6c757d; transition:all 0.1s;
}
.wt-fb:hover, .wt-vb:hover { background:#e9ecef; }
.wt-fb.active { background:#1971c2; border-color:#1971c2; color:#fff; }
.wt-vb.active { background:#1a1a2e; border-color:#1a1a2e; color:#fff; }
#wt-legend { display:flex; gap:10px; flex:1; flex-wrap:wrap; }
.wt-leg { display:flex; align-items:center; gap:4px; font-size:10px; color:#868e96; }
.wt-legdot { display:inline-block; width:12px; height:12px; border-radius:3px; border:1.5px solid; flex-shrink:0; }

/* Floor view */
#wt-floor-view { flex:1; overflow-y:auto; padding:12px 16px; }
#wt-floor-view::-webkit-scrollbar { width:4px; }
#wt-floor-view::-webkit-scrollbar-thumb { background:#dee2e6; border-radius:10px; }

/* Row group */
.wt-row-group { margin-bottom:14px; }
.wt-row-hdr {
  display:flex; align-items:center; gap:8px;
  padding:4px 8px; background:#f8f9fa; border-radius:5px;
  margin-bottom:6px; border-left:3px solid #dee2e6;
}
.wt-row-hdr.green  { border-left-color:#51cf66; }
.wt-row-hdr.orange { border-left-color:#f59f00; }
.wt-row-hdr.red    { border-left-color:#fa5252; }
.wt-row-key  { font-size:11px; font-weight:700; color:#343a40; }
.wt-row-pct  { font-size:10px; font-weight:600; padding:1px 7px; border-radius:10px; margin-left:auto; }
.wt-row-pct.green  { background:#ebfbee; color:#2f9e44; }
.wt-row-pct.orange { background:#fff9db; color:#e67700; }
.wt-row-pct.red    { background:#fff5f5; color:#c92a2a; }
.wt-row-cnt  { font-size:10px; color:#adb5bd; }

/* Slot grid — auto-fill columns, uses ALL available width */
.wt-slot-grid {
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(64px, 1fr));
  gap:5px;
}

/* Slot card */
.wt-slot {
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:5px 3px; border-radius:5px; cursor:pointer;
  border:1.5px solid #dee2e6; background:#fff;
  transition:transform 0.1s, box-shadow 0.1s;
  min-height:46px; text-align:center; position:relative; overflow:hidden;
}
.wt-slot:hover { transform:translateY(-2px); box-shadow:0 3px 10px rgba(0,0,0,0.12); z-index:1; }
.wt-slot-name { font-size:9.5px; font-weight:700; color:#495057; line-height:1.2; word-break:break-all; max-width:100%; }
.wt-slot-qty  { font-size:9px; color:#868e96; margin-top:2px; }
.wt-slot-bar  { position:absolute; bottom:0; left:0; height:3px; border-radius:0 0 3px 3px; }

.wt-slot.empty { background:#f8f9fa; border-color:#e9ecef; }
.wt-slot.empty .wt-slot-name { color:#ced4da; }
.wt-slot.empty .wt-slot-qty  { color:#e9ecef; }

.wt-slot.low  { background:#f4fcf5; border-color:#a9e34b; }
.wt-slot.low  .wt-slot-name { color:#2f9e44; }
.wt-slot.low  .wt-slot-qty  { color:#69db7c; }

.wt-slot.mid  { background:#fffce8; border-color:#ffe066; }
.wt-slot.mid  .wt-slot-name { color:#e67700; }
.wt-slot.mid  .wt-slot-qty  { color:#f59f00; }

.wt-slot.high { background:#fff4e6; border-color:#ffc078; }
.wt-slot.high .wt-slot-name { color:#d9480f; }
.wt-slot.high .wt-slot-qty  { color:#fd7e14; }

.wt-slot.full { background:#fff5f5; border-color:#ffa8a8; }
.wt-slot.full .wt-slot-name { color:#c92a2a; }
.wt-slot.full .wt-slot-qty  { color:#fa5252; }

/* Table view */
#wt-table-view { flex:1; overflow-y:auto; padding:0; }
#wt-table { width:100%; border-collapse:collapse; font-size:12px; }
#wt-table thead tr { background:#f8f9fa; position:sticky; top:0; z-index:2; }
#wt-table th { padding:9px 12px; text-align:left; font-size:10px; font-weight:700; color:#868e96; letter-spacing:0.5px; border-bottom:2px solid #e9ecef; white-space:nowrap; }
#wt-table th:nth-child(n+3) { text-align:right; }
#wt-table td { padding:7px 12px; border-bottom:1px solid #f1f3f5; }
#wt-table td:nth-child(n+3) { text-align:right; font-variant-numeric:tabular-nums; }
#wt-table tbody tr:hover { background:#f8f9fa; cursor:pointer; }
.wt-fill-wrap { display:flex; align-items:center; gap:5px; justify-content:flex-end; }
.wt-fill-bar  { height:5px; border-radius:3px; min-width:2px; flex-shrink:0; }
.wt-btn-items { padding:3px 9px; border-radius:5px; border:1px solid #dee2e6; background:#fff; font-size:11px; color:#1971c2; cursor:pointer; font-weight:600; }
.wt-btn-items:hover { background:#e7f5ff; }
.wt-cap-span { cursor:pointer; border-bottom:1px dashed #ced4da; color:#868e96; }
.wt-cap-span:hover { color:#1971c2; border-color:#1971c2; }
.wt-cap-inp { width:68px; border:1px solid #1971c2; border-radius:4px; padding:2px 5px; font-size:12px; outline:none; text-align:right; }

/* Modal */
#wt-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:99999; display:flex; align-items:center; justify-content:center; }
#wt-modal { background:#fff; border-radius:10px; width:93vw; max-width:1020px; max-height:88vh; display:flex; flex-direction:column; box-shadow:0 16px 50px rgba(0,0,0,0.2); overflow:hidden; }
#wt-modal-hdr { display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-bottom:1px solid #e9ecef; background:#f8f9fa; flex-shrink:0; }
#wt-modal-title { font-size:15px; font-weight:700; color:#1a1a2e; }
#wt-modal-sub   { font-size:11px; color:#868e96; margin-top:2px; }
#wt-modal-close { background:#e9ecef; border:none; border-radius:5px; padding:4px 9px; font-size:13px; cursor:pointer; color:#495057; }
#wt-modal-close:hover { background:#dee2e6; }
#wt-modal-body  { flex:1; overflow-y:auto; padding:14px 18px; }
#wt-modal-load  { display:flex; justify-content:center; padding:40px; }
#wt-modal-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(100px,1fr)); gap:7px; margin-bottom:14px; }
.wt-mstat { background:#f8f9fa; border-radius:7px; padding:9px 12px; }
.wt-mstat-l { font-size:9px; font-weight:700; color:#adb5bd; letter-spacing:0.5px; margin-bottom:3px; }
.wt-mstat-v { font-size:17px; font-weight:700; color:#1a1a2e; }
#wt-modal-table { width:100%; border-collapse:collapse; font-size:12px; }
#wt-modal-table thead tr { background:#f8f9fa; }
#wt-modal-table th { padding:7px 10px; font-size:10px; font-weight:700; color:#868e96; border-bottom:2px solid #e9ecef; white-space:nowrap; text-align:left; }
#wt-modal-table th:nth-child(n+6) { text-align:right; }
#wt-modal-table td { padding:6px 10px; border-bottom:1px solid #f1f3f5; color:#495057; }
#wt-modal-table td:nth-child(n+6) { text-align:right; font-variant-numeric:tabular-nums; }
#wt-modal-table tbody tr:hover { background:#f8f9fa; }
`;

/* ─── App Logic ─────────────────────────────────────────────── */
var WT = {
  API: "warehouse_theatre.warehouse_theatre.api.",
  state: { groups:[], selected:null, bins:[], total:0, filter:"all", view:"floor" },

  _call: function(method, args) {
    return new Promise(function(resolve, reject) {
      frappe.call({
        method: WT.API + method, args: args || {},
        callback: function(r) { r.exc ? reject(new Error(r.exc)) : resolve(r.message); },
        error: reject
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
      var html = '<option value="">All Companies</option>';
      (data || []).forEach(function(c) {
        html += '<option value="'+frappe.utils.escape_html(c.name)+'">'+frappe.utils.escape_html(c.name)+'</option>';
      });
      $("#wt-company-select").html(html);
    });
  },

  /* ── Groups ── */
  _loadGroups: function(company) {
    this._call("get_warehouse_groups", { company: company || "" }).then(function(data) {
      WT.state.groups = data || [];
      WT._renderSidebar(WT.state.groups);
      var slots = WT.state.groups.reduce(function(s,g){ return s+(g.leaf_count||0); }, 0);
      $("#wt-total-label").text(WT.state.groups.length + " sections · " + slots.toLocaleString("en-IN") + " slots");
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
      $list.append('<span class="wt-parent-label">'+frappe.utils.escape_html(parent)+'</span>');
      gs.forEach(function(g) {
        var act = WT.state.selected && WT.state.selected.id === g.id;
        var $el = $('<div class="wt-group-item'+(act?" active":"")+'" data-id="'+frappe.utils.escape_html(g.id)+'">'
          +'<span class="wt-gname">'+frappe.utils.escape_html(g.name)+'</span>'
          +'<span class="wt-gmeta">'+(g.leaf_count||0)+' slots</span>'
          +'</div>');
        $el.on("click", function(){ WT._selectGroup(g); });
        $list.append($el);
      });
    });
  },

  _selectGroup: function(group) {
    WT.state.selected = group;
    WT.state.filter = "all";
    $(".wt-fb").removeClass("active"); $(".wt-fb[data-f='all']").addClass("active");
    WT._loadBins(group.id);
  },

  /* ── Bins ── */
  _loadBins: function(pw) {
    WT._show("loading");
    WT._call("get_group_bins", { parent_warehouse: pw }).then(function(data) {
      WT.state.bins = data.bins || [];
      WT.state.total = data.total_warehouses || 0;
      WT._show("dashboard");
      WT._render();
      $("#wt-updated-label").text("Updated " + new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    }).catch(function(e) {
      WT._show("error"); $("#wt-error").text("⚠ "+e.message);
    });
  },

  /* ── Render ── */
  _render: function() {
    var bins = WT.state.bins;
    var total = WT.state.total;
    var occ   = bins.filter(function(b){ return parseFloat(b.actual_qty)>0; }).length;
    var empty = total - occ;
    var qty   = bins.reduce(function(s,b){ return s+(parseFloat(b.actual_qty)||0); }, 0);
    var g = WT.state.selected;

    $("#wt-sec-name").text(g ? g.name : "");
    $("#wt-sec-sub").text((g && g.parent_name ? g.parent_name+" › " : "") + occ+" occupied · "+empty+" empty");
    $("#wt-sp-total").text(total);
    $("#wt-sp-occ").text(occ);
    $("#wt-sp-empty").text(empty);
    $("#wt-sp-qty").text(WT._snum(qty));

    // refresh active view
    if (WT.state.view === "floor") WT._renderFloor(bins);
    else WT._renderTable(bins);

    // sync sidebar meta
    $(".wt-group-item.active .wt-gmeta").text(occ+" occupied / "+total+" slots");
  },

  /* ── Floor map ── */
  _renderFloor: function(bins) {
    var filter = WT.state.filter;
    var disp = bins;
    if (filter === "occupied") disp = bins.filter(function(b){ return parseFloat(b.actual_qty)>0; });
    if (filter === "empty")    disp = bins.filter(function(b){ return !(parseFloat(b.actual_qty)>0); });

    // Group by row
    var rows = {}, order = [];
    disp.forEach(function(b) {
      var k = WT._rowKey(b.warehouse_name || b.warehouse);
      if (!rows[k]) { rows[k]=[]; order.push(k); }
      rows[k].push(b);
    });

    var html = "";
    order.forEach(function(k) {
      var rb = rows[k];
      var rocc = rb.filter(function(b){ return parseFloat(b.actual_qty)>0; }).length;
      var pct  = rb.length > 0 ? Math.round((rocc/rb.length)*100) : 0;
      var cls  = pct>=80?"red":pct>=50?"orange":"green";

      html += '<div class="wt-row-group">';
      html += '<div class="wt-row-hdr '+cls+'">';
      html += '<span class="wt-row-key">'+frappe.utils.escape_html(k)+'</span>';
      html += '<span class="wt-row-cnt">'+rb.length+' slots</span>';
      html += '<span class="wt-row-pct '+cls+'">'+rocc+'/'+rb.length+' · '+pct+'%</span>';
      html += '</div><div class="wt-slot-grid">';

      rb.forEach(function(b) {
        var actual = parseFloat(b.actual_qty)||0;
        var maxCap = parseFloat(b.max_capacity)||0;
        var fp     = maxCap>0 ? Math.min(100,Math.round((actual/maxCap)*100)) : (actual>0?50:0);
        var sc     = actual===0?"empty":fp>=90?"full":fp>=70?"high":fp>=40?"mid":"low";
        var barClr = actual===0?"#dee2e6":fp>=90?"#fa5252":fp>=70?"#fd7e14":fp>=40?"#f59f00":"#51cf66";
        var barW   = actual===0?0:Math.max(8, fp);
        var sname  = WT._sname(b.warehouse_name||b.warehouse);
        var qty    = actual>0 ? WT._snum(actual) : "—";
        var tip    = (b.warehouse_name||b.warehouse)+(actual>0?"\nQty: "+WT._fmt(actual):"\nEmpty");

        html += '<div class="wt-slot '+sc+'" data-wh="'+frappe.utils.escape_html(b.warehouse)+'" title="'+frappe.utils.escape_html(tip)+'">';
        html += '<div class="wt-slot-name">'+frappe.utils.escape_html(sname)+'</div>';
        html += '<div class="wt-slot-qty">'+qty+'</div>';
        html += '<div class="wt-slot-bar" style="width:'+barW+'%;background:'+barClr+'"></div>';
        html += '</div>';
      });

      html += '</div></div>';
    });

    if (!html) html = '<div style="text-align:center;padding:40px;color:#adb5bd;font-size:13px">No slots match filter</div>';
    $("#wt-rows-container").html(html);

    $("#wt-rows-container").off("click",".wt-slot").on("click",".wt-slot",function(){
      var wh=$(this).data("wh"); if(wh) WT._openModal(wh);
    });
  },

  /* ── Table view ── */
  _renderTable: function(bins) {
    var filter = WT.state.filter;
    var rows = bins;
    if (filter==="occupied") rows = bins.filter(function(b){return parseFloat(b.actual_qty)>0;});
    if (filter==="empty")    rows = bins.filter(function(b){return !(parseFloat(b.actual_qty)>0);});

    var html = rows.slice(0,300).map(function(b,i){
      var actual=parseFloat(b.actual_qty)||0, res=parseFloat(b.reserved_qty)||0;
      var avail=actual-res, maxCap=parseFloat(b.max_capacity)||0;
      var fp=maxCap>0?Math.min(100,Math.round((actual/maxCap)*100)):null;
      var fc=fp!==null?(fp>=90?"#fa5252":fp>=70?"#fd7e14":fp>=40?"#f59f00":"#51cf66"):"#dee2e6";
      var fillCell=fp!==null
        ?'<div class="wt-fill-wrap"><div class="wt-fill-bar" style="width:'+Math.max(2,fp*0.5)+'px;background:'+fc+'"></div><span style="color:'+fc+';font-weight:600">'+fp+'%</span></div>'
        :'<span style="color:#dee2e6">—</span>';
      var capCell=maxCap>0
        ?'<span class="wt-cap-span" data-wh="'+frappe.utils.escape_html(b.warehouse)+'">'+WT._fmt(maxCap)+'</span>'
        :'<span class="wt-cap-span" data-wh="'+frappe.utils.escape_html(b.warehouse)+'" style="color:#ced4da">Set</span>';
      return '<tr data-wh="'+frappe.utils.escape_html(b.warehouse)+'">'
        +'<td style="color:#ced4da;text-align:center;width:36px">'+(i+1)+'</td>'
        +'<td style="font-weight:600;color:#1a1a2e;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+frappe.utils.escape_html(b.warehouse)+'">'+frappe.utils.escape_html(b.warehouse_name||b.warehouse)+'</td>'
        +'<td style="color:'+(actual>0?"#1971c2":"#dee2e6")+';font-weight:600">'+(actual>0?WT._fmt(actual):"—")+'</td>'
        +'<td style="color:'+(res>0?"#e67700":"#dee2e6")+'">'+(res>0?WT._fmt(res):"—")+'</td>'
        +'<td style="color:'+(avail>0?"#2f9e44":"#dee2e6")+'">'+(actual>0?WT._fmt(avail):"—")+'</td>'
        +'<td>'+capCell+'</td>'
        +'<td>'+fillCell+'</td>'
        +'<td><button class="wt-btn-items" data-wh="'+frappe.utils.escape_html(b.warehouse)+'">Items</button></td>'
        +'</tr>';
    }).join("");

    if(!html) html='<tr><td colspan="8" style="text-align:center;padding:30px;color:#adb5bd">No slots match filter</td></tr>';
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
          var bin=WT.state.bins.find(function(b){return b.warehouse===wh;});
          if(bin) bin.max_capacity=v;
          WT._renderTable(WT.state.bins);
          frappe.show_alert({message:"Saved",indicator:"green"},2);
        }).catch(function(){ WT._renderTable(WT.state.bins); });
      }
      $inp.on("keydown",function(e){if(e.key==="Enter")save();if(e.key==="Escape")WT._renderTable(WT.state.bins);}).on("blur",save);
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
      $("#wt-modal-tbody").html('<tr><td colspan="10" style="color:#c92a2a;padding:16px">Error: '+e.message+'</td></tr>');
      $("#wt-modal-load").hide(); $("#wt-modal-content").show();
    });
  },

  _renderModal: function(items) {
    var tq=items.reduce(function(s,i){return s+(parseFloat(i.actual_qty)||0);},0);
    var tv=items.reduce(function(s,i){return s+(parseFloat(i.stock_value)||0);},0);
    $("#wt-modal-stats").html([
      {l:"ITEMS",v:items.length,c:"#1a1a2e"},
      {l:"TOTAL QTY",v:WT._fmt(tq),c:"#1971c2"},
      {l:"STOCK VALUE",v:"₹"+WT._fmtC(tv),c:"#2f9e44"}
    ].map(function(s){return '<div class="wt-mstat"><div class="wt-mstat-l">'+s.l+'</div><div class="wt-mstat-v" style="color:'+s.c+'">'+s.v+'</div></div>';}).join(""));
    var html=items.map(function(it,i){
      var a=parseFloat(it.actual_qty)||0, r=parseFloat(it.reserved_qty)||0, av=parseFloat(it.available_qty)||0;
      return '<tr>'
        +'<td style="color:#ced4da;text-align:center">'+(i+1)+'</td>'
        +'<td><a href="/app/item/'+encodeURIComponent(it.item_code)+'" target="_blank" style="color:#1971c2;font-weight:600">'+frappe.utils.escape_html(it.item_code)+'</a></td>'
        +'<td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+frappe.utils.escape_html(it.item_name||"")+'">'+frappe.utils.escape_html(it.item_name||"")+'</td>'
        +'<td>'+frappe.utils.escape_html(it.item_group||"")+'</td>'
        +'<td>'+frappe.utils.escape_html(it.stock_uom||"")+'</td>'
        +'<td style="font-weight:600;color:#1971c2">'+WT._fmt(a)+'</td>'
        +'<td style="color:'+(r>0?"#e67700":"#dee2e6")+'">'+(r>0?WT._fmt(r):"—")+'</td>'
        +'<td style="color:'+(av>0?"#2f9e44":"#dee2e6")+'">'+WT._fmt(av)+'</td>'
        +'<td style="color:#868e96">'+WT._fmt(parseFloat(it.valuation_rate)||0)+'</td>'
        +'<td style="color:#2f9e44;font-weight:600">'+WT._fmtC(parseFloat(it.stock_value)||0)+'</td>'
        +'</tr>';
    }).join("");
    if(!html) html='<tr><td colspan="10" style="text-align:center;padding:24px;color:#adb5bd">No items with stock</td></tr>';
    $("#wt-modal-tbody").html(html);
    $("#wt-modal-load").hide(); $("#wt-modal-content").show();
  },

  /* ── Events ── */
  _bindEvents: function() {
    $(document).on("input","#wt-search",function(){
      var q=$(this).val().toLowerCase();
      WT._renderSidebar(q?WT.state.groups.filter(function(g){return g.name.toLowerCase().includes(q)||(g.parent_name||"").toLowerCase().includes(q);}):WT.state.groups);
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
    if(s==="loading") $("#wt-loading").show();
    if(s==="dashboard") $("#wt-dashboard").show();
    if(s==="error") $("#wt-error").show();
    if(s==="empty") $("#wt-empty").show();
  },

  _rowKey: function(name) {
    var clean = name.replace(/\s*-\s*[A-Z]{2,5}$/, "").trim();
    // Named pattern: BOX-1..BOX-12 → BOX, LM/1001A..LM/1006L → LM/10xx, etc.
    var m = clean.match(/^([A-Za-z\/]+?)[-_]?(\d+)/);
    if (m) {
      var pfx = m[1];
      var num = parseInt(m[2]);
      if (num > 999) {
        var decade = Math.floor(num / 100) * 100;
        return pfx + " " + decade + "–" + (decade + 99);
      }
      if (num > 99) {
        var decade = Math.floor(num / 10) * 10;
        return pfx + " " + (decade+1) + "–" + (decade + 10);
      }
      return pfx + " " + Math.floor(num/10)*10 + "s";
    }
    return clean.substring(0,6).toUpperCase();
  },

  _sname: function(name) {
    var clean = name.replace(/\s*-\s*[A-Z]{2,5}$/, "").trim();
    return clean.length > 9 ? clean.substring(0,8)+"…" : clean;
  },

  _snum: function(n) {
    n=parseFloat(n)||0;
    if(n>=1000000) return (n/1000000).toFixed(1)+"M";
    if(n>=1000)    return (n/1000).toFixed(1)+"K";
    return n.toLocaleString("en-IN",{maximumFractionDigits:1});
  },

  _fmt:  function(n){ return (parseFloat(n)||0).toLocaleString("en-IN",{maximumFractionDigits:2}); },
  _fmtC: function(n){ return (parseFloat(n)||0).toLocaleString("en-IN",{maximumFractionDigits:0}); },
};
