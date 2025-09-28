# Trump Administration Dashboards Server

A unified HTTP server to serve all three Trump Administration dashboards locally, solving CORS issues when loading JSON data files.

## Quick Start

```bash
# Serve all dashboards (opens browser automatically)
python server.py

# Serve a specific dashboard
python server.py --dashboard immigration
python server.py --dashboard promises  
python server.py --dashboard economic

# Use different port or disable auto-browser
python server.py --port 8001
python server.py --no-browser
```

## Available Dashboards

| Dashboard | URL Path | Description |
|-----------|----------|-------------|
| **Immigration Enforcement** | `/trump_admin/immigration_enforcement/` | ICE detention statistics and border apprehensions |
| **Campaign Promises Tracker** | `/trump_admin/promises_tracker/` | Real-time tracking of Trump's 2024 campaign promises |
| **Economic Policy Dashboard** | `/trump_admin/economic_policy/` | Stock performance, tariffs, and economic indicators |

## Why This Server is Needed

All three dashboards use `fetch()` to load local JSON data files:
- Immigration: `data/ice_detention_data.json`, `data/cbp_apprehensions_data.json`
- Promises: `promises.json`
- Economic: `integrated_economic_dashboard.json`, `tariff_data_clean.json`, etc.

Modern browsers block `fetch()` requests to local files (CORS policy), so an HTTP server is required to serve the files properly.

## Features

- ✅ **CORS Headers**: Enables local JSON file loading
- ✅ **Multiple Dashboards**: Serves all three from one server
- ✅ **Auto Browser**: Opens browser automatically
- ✅ **Flexible Ports**: Use any available port
- ✅ **Clean Logging**: Minimal, informative output

## Command Line Options

```
--dashboard, -d    Serve specific dashboard (immigration|promises|economic)
--port, -p         Port number (default: 8000)
--no-browser       Don't open browser automatically
--help, -h         Show help message
```

## Examples

```bash
# Development workflow - serve all dashboards
python server.py

# Focus on immigration dashboard only
python server.py -d immigration

# Use different port (if 8000 is busy)
python server.py -p 8001

# Server-only mode (no browser)
python server.py --no-browser
```

## URLs When Running

- **All Dashboards**: http://localhost:8000
- **Immigration**: http://localhost:8000/trump_admin/immigration_enforcement/
- **Promises**: http://localhost:8000/trump_admin/promises_tracker/
- **Economic**: http://localhost:8000/trump_admin/economic_policy/

## Troubleshooting

**Port already in use?**
```bash
python server.py --port 8001
```

**Browser doesn't open?**
- Check if your default browser is set
- Manually navigate to http://localhost:8000
- Use `--no-browser` flag and open manually

**Dashboard not loading data?**
- Ensure JSON files exist in the correct directories
- Check browser console for fetch errors
- Verify CORS headers are being sent
