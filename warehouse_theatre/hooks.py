from . import __version__ as app_version

app_name = "warehouse_theatre"
app_title = "Warehouse Theatre"
app_publisher = "Pranera Services"
app_description = "Theatre-style warehouse storage capacity visualization for ERPNext"
app_icon = "octicon octicon-package"
app_color = "#378ADD"
app_email = "aravind_g@pss.com"
app_license = "MIT"
app_version = "0.0.1"

fixtures = [
    {"dt": "Module Def", "filters": [["app_name", "=", "warehouse_theatre"]]},
    {"dt": "Page",       "filters": [["module",   "=", "Warehouse Theatre"]]},
    {"dt": "Custom Field", "filters": [["module", "=", "Warehouse Theatre"]]},
]
