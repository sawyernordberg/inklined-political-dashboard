# ICE Detention Data System

This system automatically scrapes ICE detention statistics and provides state-level detainment data for the immigration dashboard.

## How It Works

1. **Data Collection**: The ICE scraper automatically downloads the latest detention statistics from the ICE website
2. **Data Processing**: Processes facility-level data to aggregate detainees by state
3. **Data Access**: Provides both raw facility data and aggregated state-level statistics
4. **Web Display**: Shows state detainment distribution in tables and charts

## Files and Locations

### Data Sources
- **ICE Scraper**: `scripts/trump_admin/immigration_enforcement/ice_detention_data_processor.py`
- **ICE Data**: `scripts/trump_admin/immigration_enforcement/data/ice_detention_data.json`
- **Public Copy**: `public/data/ice_detention_data.json` (for web access)

### API and Display
- **API Route**: `src/app/api/immigration-data/route.ts`
- **Dashboard Page**: `src/app/trump-admin/immigration/page.tsx`
- **Data Copy Script**: `scripts/copy_ice_data.py`

## Getting Started

### 1. Run the ICE Scraper

```bash
cd scripts/trump_admin/immigration_enforcement
python3 -m ice_detention_data_processor
```

This will:
- Download the latest ICE detention statistics Excel file
- Process all facility data including state information
- Save the processed data to `data/ice_detention_data.json`

### 2. Copy Data to Public Directory (Optional)

```bash
cd scripts
python3 -m copy_ice_data
```

This copies the ICE data to the public directory for web access.

### 3. Access the Dashboard

Visit `/trump-admin/immigration` to see:
- Key detention statistics
- **State detainment distribution table** (NEW!)
- **State detainment chart** (NEW!)
- Criminality breakdown
- ATD programs data
- Border apprehensions

## State Detainment Data

The system now provides:

### Table View
- **State**: State abbreviation (e.g., TX, CA, MS)
- **Detainees**: Total number of detainees in that state
- **% of Total**: Percentage of total detainees nationwide

### Chart View
- Horizontal bar chart showing top 8 states by detainee count
- Interactive tooltips with exact numbers
- Responsive design for all screen sizes

## Data Structure

The state detainment data is calculated by aggregating facility-level data:

```json
{
  "ice": {
    "stateDetainment": [
      {
        "state": "TX",
        "detainees": 13192.5
      },
      {
        "state": "LA", 
        "detainees": 7398.2
      }
    ]
  }
}
```

## Troubleshooting

### "ICE data file not found" Error
1. Make sure you've run the ICE scraper first
2. Check that `ice_detention_data.json` exists in the scraper data directory
3. Run the copy script: `python3 -m scripts.copy_ice_data`

### No State Data Displayed
1. Verify the "Facilities FY25" sheet exists in the ICE data
2. Check that facility data has valid State and Level_A through Level_D columns
3. Ensure the API route is returning `stateDetainment` data

### Data Appears Outdated
1. Run the ICE scraper to get the latest data
2. Check the `scraped_at` timestamp in the metadata
3. Verify the source URL points to the most recent Excel file

## Data Sources

- **ICE Detention Statistics**: Official ICE website
- **Facility Data**: Includes all detention facilities with population counts
- **State Aggregation**: Calculated from facility-level detainee counts
- **Real-time Updates**: Data is current as of the last scraper run

## Future Enhancements

- County-level detainment breakdown
- Facility type analysis by state
- Historical state detainment trends
- Export functionality for state data
- Interactive state map visualization
