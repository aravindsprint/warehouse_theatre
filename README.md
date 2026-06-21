# 🏭 Warehouse Theatre

> Theatre-style 3D & 2D warehouse storage visualization for ERPNext — built with Vue 3 + Three.js

![ERPNext](https://img.shields.io/badge/ERPNext-v15-blue) ![Vue 3](https://img.shields.io/badge/Vue-3.x_CDN-brightgreen) ![Three.js](https://img.shields.io/badge/Three.js-r128-orange) ![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **3D View** — interactive Three.js shelf rack visualization with orbit, pan & zoom
- **2D Floor View** — section grid with slot tiles, level rows (L3→L2→L1), fill colors
- **Live Stock Data** — real-time qty, UOM fill % and stock value from ERPNext bins
- **Item Search** — filter warehouses by item code or item name across all views
- **Detail Panel** — right slide-in panel with UOM fill bars, item list, and all levels
- **Item Modal** — full item table with actual qty, reserved, available, rate and stock value
- **Configure Stack Levels** — add/remove Bin levels (L1, L2, L3) per slot
- **Floor Plan Editor** — drag-and-drop row/column layout editor for the 3D view
- **Dark / Light theme** — toggle with one click
- **PWA Support** — installable on desktop and mobile, offline-capable via service worker
- **Mobile Responsive** — hamburger sidebar, touch orbit/zoom in 3D, compact topbar

---

## 🏗️ Warehouse Hierarchy

The app requires this exact 4-level warehouse hierarchy using the `wt_warehouse_type` custom field:

```
Building  (wt_warehouse_type = 'Building')   ← optional grouping
    └── Floor  (wt_warehouse_type = 'Floor') ← appears in sidebar
            └── Slot  (wt_warehouse_type = 'Slot')  ← 3D rack / 2D tile
                    └── Bin  (wt_warehouse_type = 'Bin')   ← shelf level (L1, L2, L3)
```

Stock is tracked at the **Bin** level. Each Bin maps to one physical shelf level.

---

## 📦 Installation

```bash
# From your frappe-bench directory
bench get-app git@github.com:aravindsprint/warehouse_theatre.git
bench --site your-site.com install-app warehouse_theatre
bench --site your-site.com migrate
bench build --app warehouse_theatre
bench restart
```

---

## ⚙️ Setup

### 1. Custom Fields
The app automatically creates these custom fields on the **Warehouse** doctype via fixtures:

| Field | Type | Purpose |
|-------|------|---------|
| `wt_warehouse_type` | Select | Building / Floor / Slot / Bin |
| `wt_row` | Int | Row position in floor plan |
| `wt_col` | Int | Column position in floor plan |
| `wt_row_gap` | Float | Gap after this row in 3D view |
| `wt_uom_capacities` | Table | Per-UOM max capacity for fill % |

### 2. Set Warehouse Types
Go to **Stock → Warehouse** and set `wt_warehouse_type` for each warehouse:

```
PT/SASTRI          → Building
PT/SASTRI/G1       → Floor
PT/SASTRI/G1/A01   → Slot
PT/SASTRI/G1/A01-L1 → Bin
PT/SASTRI/G1/A01-L2 → Bin
```

### 3. Set UOM Capacities (optional)
Open any **Bin** warehouse → fill the **WT UOM Capacities** table to enable fill % bars.

---

## 🚀 Usage

### Access via ERPNext Desk
Navigate to: **`/app/warehouse-theatre`**

### Access as standalone PWA
Navigate to: **`/warehouse-theatre`**

On mobile/desktop browsers you'll see an **"Add to Home Screen"** prompt.

---

## 🗂️ Project Structure

```
warehouse_theatre/
├── hooks.py                          ← app registration, apps screen icon
├── setup.py / pyproject.toml
└── warehouse_theatre/
    ├── hooks.py                      ← add_to_apps_screen, website_route_rules
    ├── modules.txt
    ├── fixtures/
    │   └── Custom Field.json         ← wt_warehouse_type, wt_row, wt_col etc.
    ├── public/
    │   ├── js/wt-vue.js              ← Vue 3 app (all components, Three.js engine)
    │   ├── images/logo.svg           ← app icon for /apps screen
    │   ├── images/favicon.svg
    │   ├── manifest.json             ← PWA manifest
    │   └── sw.js                     ← service worker
    ├── warehouse_theatre/
    │   └── api/api.py                ← all Frappe whitelisted API methods
    ├── warehouse_theatre_module/
    │   └── page/warehouse_theatre/
    │       ├── warehouse_theatre.js  ← Frappe page loader
    │       └── warehouse_theatre.json
    └── www/
        ├── warehouse-theatre.html    ← standalone PWA page
        └── warehouse-theatre.py     ← auth guard
```

---

## 🔌 API Reference

All methods are under `warehouse_theatre.warehouse_theatre.api.api`:

| Method | Description |
|--------|-------------|
| `get_warehouse_groups` | Returns all Floor warehouses for the sidebar |
| `get_slots` | Returns Slot warehouses with levels and stock data |
| `save_slot_position` | Updates wt_row, wt_col, wt_row_gap for floor plan |
| `save_stack_config` | Creates/disables Bin levels for a Slot |
| `save_uom_capacity` | Saves per-UOM capacity for a Bin |
| `check_app_permission` | Permission check for /apps screen |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vue 3 (CDN, no build step) |
| 3D Engine | Three.js r128 |
| Backend | Frappe / ERPNext v15 |
| PWA | Service Worker + Web Manifest |
| Styling | Inline CSS with CSS variables (dark/light) |

---

## 📱 Mobile Support

The app is fully responsive for tablets and phones:
- **☰ Hamburger menu** — slides in the warehouse group sidebar
- **Touch gestures** — pinch to zoom, drag to orbit in 3D view
- **2D view** — 2-column section grid fits all screen sizes
- **PWA** — install to home screen, works offline with cached data

---

## 🏢 Publisher

**Pranera Services** — [aravind_g@pss.com](mailto:aravind_g@pss.com)

---

## 📄 License

MIT
