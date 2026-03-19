# Warehouse Theatre

> Theatre-style warehouse storage capacity dashboard for ERPNext / Frappe

## Features

| Feature | Description |
|---|---|
| 🎭 Theatre seat grid | Each square = one storage location |
| 📊 6-stat summary | Total slots, occupied, empty, fill %, total qty, reserved qty |
| 📏 Capacity bar | True fill % using max_storage_capacity custom field |
| 🔍 Item drill-down | Click any warehouse row → see all items inside |
| 🗂 Group sidebar | All warehouse groups live from ERPNext with search |
| 🏢 Workspace shortcut | Auto-added to Frappe desk via fixture |

## Installation

```bash
cd /home/frappe/frappe-bench/apps
# clone or unzip the app here, then:

bench --site erp.pranera.in install-app warehouse_theatre
bench --site erp.pranera.in migrate
bench build --app warehouse_theatre
bench --site erp.pranera.in clear-cache
```

Access at: https://erp.pranera.in/warehouse-theatre

## Push to GitHub

```bash
cd /home/frappe/frappe-bench/apps/warehouse_theatre
git init
git add .
git commit -m "feat: initial warehouse theatre app"
git remote add origin https://github.com/YOUR_ORG/warehouse_theatre.git
git push -u origin main
```

Export fixtures after UI changes:
```bash
bench --site erp.pranera.in export-fixtures --app warehouse_theatre
```

## Max Capacity Setup

After install, a `Max Storage Capacity` field appears on the Warehouse form (added via Custom Field fixture). Fill it to enable the capacity bar and true fill %.  
If left at 0, falls back to slot-based occupancy %.

## Structure

```
warehouse_theatre/
├── .gitignore
├── setup.py
├── warehouse_theatre/
│   ├── hooks.py
│   ├── fixtures/
│   │   ├── Custom Field.json   ← max_storage_capacity on Warehouse
│   │   └── Workspace.json      ← desk shortcut
│   └── warehouse_theatre/
│       ├── api.py              ← get_warehouse_groups, get_group_bins,
│       │                          get_warehouse_items, get_summary
│       └── page/warehouse_theatre/
│           ├── warehouse_theatre.json
│           ├── warehouse_theatre.html
│           └── warehouse_theatre.js   ← full UI, no build step
```

## API

| Method | Args | Returns |
|---|---|---|
| get_warehouse_groups | — | Groups with leaf_count, total_capacity |
| get_group_bins | parent_warehouse | bins, total_warehouses, group_capacity |
| get_warehouse_items | warehouse | Items with actual/reserved/available qty |
| get_summary | — | Overall totals |

Roles: Stock User, Stock Manager, System Manager, Warehouse User
