import frappe


@frappe.whitelist()
def get_companies():
	"""Return all companies for the company filter dropdown."""
	return frappe.db.get_all("Company", fields=["name", "abbr"], order_by="name asc")


@frappe.whitelist()
def get_warehouse_groups(company=None):
	"""
	Return all group warehouses that directly contain leaf (non-group) warehouses.
	Optionally filter by company (uses warehouse abbr suffix e.g. '- PSS').
	"""
	company_filter = ""
	if company:
		abbr = frappe.db.get_value("Company", company, "abbr")
		if abbr:
			company_filter = f"AND w.name LIKE '%%- {abbr}'"

	data = frappe.db.sql(
		f"""
		SELECT
			w.name                              AS id,
			w.warehouse_name                    AS name,
			w.parent_warehouse                  AS parent_id,
			pw.warehouse_name                   AS parent_name,
			COUNT(c.name)                       AS leaf_count,
			COALESCE(w.max_storage_capacity, 0) AS max_storage_capacity
		FROM `tabWarehouse` w
		LEFT JOIN `tabWarehouse` pw ON pw.name = w.parent_warehouse
		INNER JOIN `tabWarehouse` c
			ON c.parent_warehouse = w.name
			AND c.is_group = 0
		WHERE w.is_group = 1
		{company_filter}
		GROUP BY w.name
		ORDER BY leaf_count DESC
		""",
		as_dict=True,
	)
	return data


@frappe.whitelist()
def get_group_bins(parent_warehouse):
	"""
	Return bin totals for all leaf warehouses directly under *parent_warehouse*.
	Groups slots by row prefix (derived from warehouse_name pattern).
	"""
	if not parent_warehouse:
		frappe.throw("parent_warehouse is required")

	bins = frappe.db.sql(
		"""
		SELECT
			w.name                               AS warehouse,
			w.warehouse_name,
			COALESCE(w.max_storage_capacity, 0)  AS max_capacity,
			COALESCE(SUM(b.actual_qty),   0)     AS actual_qty,
			COALESCE(SUM(b.reserved_qty), 0)     AS reserved_qty,
			COALESCE(SUM(b.ordered_qty),  0)     AS ordered_qty,
			COALESCE(SUM(b.projected_qty),0)     AS projected_qty
		FROM `tabWarehouse` w
		LEFT JOIN `tabBin` b ON b.warehouse = w.name
		WHERE
			w.parent_warehouse = %s
			AND w.is_group = 0
			AND w.disabled = 0
		GROUP BY w.name
		ORDER BY w.warehouse_name ASC
		""",
		(parent_warehouse,),
		as_dict=True,
	)

	total_warehouses = frappe.db.count(
		"Warehouse",
		{"parent_warehouse": parent_warehouse, "is_group": 0, "disabled": 0},
	)

	group_max = frappe.db.get_value("Warehouse", parent_warehouse, "max_storage_capacity") or 0

	return {
		"bins": bins,
		"total_warehouses": int(total_warehouses or 0),
		"group_max_capacity": float(group_max),
	}


@frappe.whitelist()
def get_warehouse_items(warehouse):
	"""Drill-down: all items with stock in a single warehouse."""
	if not frappe.db.exists("Warehouse", warehouse):
		frappe.throw("Invalid warehouse")

	frappe.has_permission("Warehouse", throw=True)

	items = frappe.db.sql(
		"""
		SELECT
			b.item_code,
			i.item_name,
			i.stock_uom,
			i.item_group,
			b.actual_qty,
			b.reserved_qty,
			(b.actual_qty - b.reserved_qty)  AS available_qty,
			b.valuation_rate,
			b.stock_value
		FROM `tabBin` b
		INNER JOIN `tabItem` i ON i.name = b.item_code
		WHERE
			b.warehouse = %s
			AND b.actual_qty != 0
		ORDER BY b.actual_qty DESC
		""",
		(warehouse,),
		as_dict=True,
	)
	return items


@frappe.whitelist()
def save_max_capacity(warehouse, max_capacity):
	"""Inline-edit: persist max_storage_capacity for a warehouse."""
	frappe.has_permission("Warehouse", "write", throw=True)
	frappe.db.set_value("Warehouse", warehouse, "max_storage_capacity", _flt(max_capacity))
	frappe.db.commit()
	return {"ok": True}


@frappe.whitelist()
def get_summary():
	"""Overall stock summary across all active leaf warehouses."""
	data = frappe.db.sql(
		"""
		SELECT
			COUNT(DISTINCT w.name)            AS total_warehouses,
			COALESCE(SUM(b.actual_qty),   0)  AS total_actual_qty,
			COALESCE(SUM(b.reserved_qty), 0)  AS total_reserved_qty,
			COALESCE(SUM(b.stock_value),  0)  AS total_stock_value
		FROM `tabWarehouse` w
		LEFT JOIN `tabBin` b ON b.warehouse = w.name
		WHERE w.is_group = 0 AND w.disabled = 0
		""",
		as_dict=True,
	)
	return data[0] if data else {}


def _flt(val):
	try:
		return float(val)
	except (TypeError, ValueError):
		return 0.0
