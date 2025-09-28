# Data Update Scripts

This directory contains scripts to update all JSON data files for the political dashboard.

## 🚀 Quick Start

### Full Update (Recommended)
```bash
python3 update_all_data.py
```
This runs ALL scripts in the correct dependency order.

### Quick Update (Essential data only)
```bash
python3 quick_update.py
```
This runs only the most essential scripts for quick updates.

## 📋 Script Dependencies

The scripts have the following dependencies that are automatically handled:

### Phase 1: Independent Scripts
These can run in parallel (but are run sequentially for safety):
- `fred_federal_employees_fetcher.py` - Federal employees data
- `polling_scraper.py` - Legal polling data  
- `congressional_data_analyzer.py` - Congressional analysis
- `cbp_scraper.py` - CBP apprehensions data
- `ice_detention_data_processor.py` - ICE detention data
- `foreign_affairs_data_collector.py` - Foreign affairs data

### Phase 2: Economic Scripts (Sequential)
**IMPORTANT**: These must run in order due to dependencies:
1. `tariff.py` → Creates `tariff_data_clean.json`
2. `eco1.py` → Reads `tariff_data_clean.json`, creates `integrated_economic_dashboard.json`
3. `tariff_merger.py` → Reads `integrated_economic_dashboard.json`, enhances tariff data

### Phase 3: Enhancement Scripts
- `update_overviews.py` → Reads foreign affairs data, enhances with AI

## 📁 Output Files

All scripts now save directly to `public/data/` directory:

- `cbp_apprehensions_data.json` - Border apprehensions data
- `congressional_analysis.json` - Congressional activity analysis
- `enhanced_foreign_affairs_data_detailed.json` - Foreign affairs data
- `federal_employees_data.json` - Federal workforce data
- `gemini_tariff_analysis.json` - AI-enhanced tariff analysis
- `ice_detention_data.json` - ICE detention statistics
- `integrated_economic_dashboard.json` - Economic dashboard data
- `legal_polling_data.json` - Legal polling data
- `presidential_sp500_comparison.json` - Stock market data
- `promises.json` - Campaign promises tracker
- `tariff_data_clean.json` - Clean tariff data

## ⚙️ Configuration

### Environment Variables
Some scripts require API keys. Create a `.env` file in the project root:

```env
# Congressional API
CONGRESS_API_KEY=your_congress_api_key
LEGISCAN_API_KEY=your_legiscan_api_key

# FRED API
FRED_API_KEY=your_fred_api_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

### Python Dependencies
Install required packages:
```bash
pip install -r scripts/requirements.txt
```

## 🔧 Manual Execution

If you need to run individual scripts manually:

### Economic Data (in order):
```bash
cd scripts/trump_admin/economic_policy
python3 tariff.py
python3 eco1.py
python3 tariff_merger.py
```

### Immigration Data:
```bash
cd scripts/trump_admin/immigration_enforcement
python3 cbp_scraper.py
python3 ice_detention_data_processor.py
```

### Other Data:
```bash
cd scripts
python3 fred_federal_employees_fetcher.py
python3 polling_scraper.py

cd congress
python3 congressional_data_analyzer.py

cd foreign_affairs
python3 foreign_affairs_data_collector.py
python3 update_overviews.py
```

## 📊 Monitoring

The master script provides detailed logging:
- ✅ Success indicators
- ❌ Error messages with details
- ⏰ Timeout warnings
- 📁 File verification
- 📈 Summary statistics

## 🚨 Troubleshooting

### Common Issues:

1. **API Key Errors**: Check your `.env` file
2. **Timeout Errors**: Some scripts may take 10+ minutes
3. **File Not Found**: Ensure all scripts are in correct locations
4. **Dependency Errors**: Run scripts in the correct order

### Logs:
- Check individual script outputs for detailed error messages
- ICE scraper logs are saved to `scripts/trump_admin/immigration_enforcement/scraper.log`

## 🎯 Best Practices

1. **Run full update weekly**: `python3 update_all_data.py`
2. **Run quick update daily**: `python3 quick_update.py`
3. **Check logs** if any script fails
4. **Verify files** in `public/data/` after updates
5. **Test the web application** after major updates

## 📞 Support

If you encounter issues:
1. Check the error messages in the console output
2. Verify all required files exist
3. Ensure API keys are properly configured
4. Check network connectivity for web scraping scripts
