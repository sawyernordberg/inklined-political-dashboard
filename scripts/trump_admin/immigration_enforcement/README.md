# ICE Detention Statistics Data Scraper

This Python script scrapes data from the ICE (Immigration and Customs Enforcement) detention statistics Excel file and converts it into multiple JSON formats for easy analysis and visualization.

## Features

- **Automated Data Download**: Downloads the latest ICE detention statistics Excel file
- **Multiple JSON Formats**: Exports data in 4 different JSON formats:
  - `ice_detention_data.json` - Complete dataset with full metadata
  - `ice_detention_raw_excel.json` - Raw Excel data structure preserved
  - `ice_detention_simplified.json` - Simplified format with sheet summaries
  - `ice_detention_charts.json` - Chart-ready data with summary statistics
- **Data Cleaning**: Handles duplicate column names, datetime objects, and NaN values
- **Error Handling**: Comprehensive logging and error handling
- **Progress Tracking**: Real-time logging of scraping progress

## Installation

1. Install required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

Run the scraper:
```bash
python main.py
```

The script will:
1. Download the Excel file from the ICE website
2. Parse all worksheets in the Excel file
3. Clean and process the data
4. Save data in multiple JSON formats in the `data/` directory
5. Generate a log file (`scraper.log`) with detailed process information

## Generated Files

### Data Directory Structure
```
data/
├── ice_detention_data.json          # Complete dataset (1.0MB)
├── ice_detention_raw_excel.json     # Raw Excel structure (911KB)
├── ice_detention_simplified.json    # Simplified format (1.0MB)
├── ice_detention_charts.json        # Chart-ready data (254B)
└── ice_detention_raw.xlsx          # Original Excel file (1.5MB)
```

### File Descriptions

1. **ice_detention_data.json**: Complete dataset with full metadata
   - Contains all sheet data with detailed metadata
   - Includes column names, data types, and row counts
   - Best for comprehensive analysis

2. **ice_detention_raw_excel.json**: Raw Excel data preservation
   - Maintains original Excel structure
   - Minimal processing applied
   - Best for exact data replication

3. **ice_detention_simplified.json**: Simplified format
   - Easy-to-read structure with summaries
   - Sheet-level metadata included
   - Best for quick exploration and understanding

4. **ice_detention_charts.json**: Chart-ready data
   - Formatted for visualization libraries
   - Contains summary statistics for numeric columns
   - Best for creating charts and graphs

## Data Source

The scraper pulls data from:
- **URL**: https://www.ice.gov/doclib/detention/FY25_detentionStats08142025.xlsx
- **Source**: U.S. Immigration and Customs Enforcement
- **Data Type**: Fiscal Year 2025 detention statistics

## Excel Sheets Included

The Excel file contains 10 worksheets:
1. Header
2. ATD FY25 YTD (Alternatives to Detention)
3. Detention FY25
4. ICLOS and Detainees
5. Semiannual
6. Monthly Bond Statistics
7. Facilities FY25
8. Monthly Segregation
9. Vulnerable & Special Population
10. Footnotes

## Technical Details

- **Language**: Python 3.11+
- **Key Libraries**: pandas, requests, openpyxl
- **Error Handling**: Custom JSON encoder for datetime and numpy objects
- **Logging**: Comprehensive logging to file and console
- **Data Cleaning**: Automatic handling of duplicates, NaN values, and data type conversion

## Troubleshooting

- Check `scraper.log` for detailed error information
- Ensure internet connection for downloading Excel file
- Verify all dependencies are installed correctly
- Make sure you have write permissions to the data directory

## Notes

- Data fluctuates until "locked" at the conclusion of the fiscal year
- Records related to credible fear are USCIS records provided to ICE by USCIS
- ICE confirms data integrity as published and cannot attest to subsequent transmissions