from . import __version__ as app_version

app_name        = "warehouse_theatre"
app_title       = "Warehouse Theatre"
app_publisher   = "Pranera Services"
app_description = "Theatre-style warehouse storage capacity visualization for ERPNext"
app_email       = "aravind_g@pss.com"
app_license     = "MIT"
app_version     = "0.0.1"

add_to_apps_screen = [
    {
        "name": "warehouse_theatre",
        "logo": "/assets/warehouse_theatre/images/logo.svg",
        "title": "Warehouse Theatre",
        "route": "/warehouse-theatre",
        "has_permission": "warehouse_theatre.warehouse_theatre.api.api.check_app_permission",
    }
]

website_route_rules = [
    {"from_route": "/warehouse-theatre/<path:app_path>", "to_route": "warehouse-theatre"},
]

fixtures = ["Custom Field"]
