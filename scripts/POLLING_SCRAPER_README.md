# Legal Polling Data Scraper

This script legally scrapes publicly available polling data from reputable sources for the Inklined political dashboard.

## Legal Compliance

The scraper is designed to comply with legal requirements for web scraping:

- **Public Data Only**: Only scrapes publicly accessible data
- **Respectful Scraping**: Uses proper delays and respectful user agents
- **Attribution**: Provides proper attribution to all sources
- **Terms of Service**: Respects robots.txt and terms of service

## Sources

The scraper targets these legally accessible sources:

1. **Pew Research Center**: Allows fair use with attribution
2. **Real Clear Politics**: Aggregates publicly available polling data
3. **FiveThirtyEight**: Provides publicly accessible polling averages

## Installation

```bash
cd scripts
pip install -r polling_requirements.txt
```

## Usage

### Manual Execution
```bash
python3 -m scripts.polling_scraper
```

### Automated Execution
Add to your cron job or scheduler to run daily:
```bash
0 6 * * * cd /path/to/inklined && python3 -m scripts.polling_scraper
```

## Output

The scraper generates `/public/data/legal_polling_data.json` with:

- **Metadata**: Scraping timestamp, sources, legal notice
- **Individual Polls**: Source, approval/disapproval percentages, dates, URLs
- **Averages**: Calculated averages across all sources

## Legal Notice

This scraper:
- Only accesses publicly available data
- Provides proper attribution to all sources
- Respects website terms of service
- Uses respectful scraping practices
- Complies with the Ninth Circuit Court ruling on web scraping legality

## Error Handling

The scraper includes comprehensive error handling:
- Graceful fallbacks if sources are unavailable
- Logging of all scraping activities
- Timeout protection for requests
- Respectful request delays

## Data Quality

- Validates all scraped percentages
- Filters out invalid or incomplete data
- Calculates accurate averages
- Maintains data integrity

## Transparency

All scraped data includes:
- Source attribution
- Scraping timestamps
- Legal usage notices
- Direct links to original sources

This ensures full transparency and compliance with journalistic standards.
