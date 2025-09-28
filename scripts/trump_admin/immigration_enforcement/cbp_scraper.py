#!/usr/bin/env python3
"""
CBP Border Apprehensions Data Scraper

This script scrapes monthly border apprehension data from CBP's Nationwide Encounters webpage.
It extracts data for:
- Nationwide Total Apprehensions
- Southwest Border Total Apprehensions  
- Northern Border Total Apprehensions
- At Large vs At Entry breakdowns

Data source: https://www.cbp.gov/newsroom/stats/nationwide-encounters
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import logging
from datetime import datetime
import os
from pathlib import Path
import re

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CBPApprehensionsScraper:
    def __init__(self):
        self.base_url = "https://www.cbp.gov/newsroom/stats/nationwide-encounters"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Create data directory if it doesn't exist
        self.data_dir = Path('data')
        self.data_dir.mkdir(exist_ok=True)
        
    def fetch_page(self):
        """Fetch the CBP nationwide encounters webpage"""
        try:
            logger.info(f"Fetching data from {self.base_url}")
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            logger.error(f"Error fetching webpage: {e}")
            raise
    
    def parse_apprehensions_table(self, html_content):
        """Parse the border apprehensions table from the HTML content"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Look for the table containing apprehensions data
        # The table should have headers like "Monthly Totals", "Oct-23", "Nov-23", etc.
        tables = soup.find_all('table')
        
        apprehensions_data = {}
        
        for table in tables:
            # Check if this is the apprehensions table by looking for key headers
            headers = table.find_all(['th', 'td'])
            header_text = [h.get_text().strip() for h in headers]
            
            # Look for indicators this is the apprehensions table
            if any('Monthly Totals' in text or 'Apprehensions' in text for text in header_text):
                logger.info("Found apprehensions table")
                
                # Extract table data
                rows = table.find_all('tr')
                
                # Parse headers (months)
                header_row = None
                for row in rows:
                    cells = row.find_all(['th', 'td'])
                    cell_texts = [cell.get_text().strip() for cell in cells]
                    
                    # Look for month patterns like "Oct-23", "Nov-23"
                    if any(re.match(r'[A-Z][a-z]{2}-\d{2}', text) for text in cell_texts):
                        header_row = cell_texts
                        break
                
                if not header_row:
                    continue
                
                # Find the months (skip first column which is usually the category)
                months = []
                for i, header in enumerate(header_row[1:], 1):
                    if re.match(r'[A-Z][a-z]{2}-\d{2}', header.strip()):
                        months.append(header.strip())
                
                logger.info(f"Found months: {months}")
                
                # Parse data rows
                for row in rows:
                    cells = row.find_all(['th', 'td'])
                    if len(cells) < 2:
                        continue
                        
                    cell_texts = [cell.get_text().strip() for cell in cells]
                    category = cell_texts[0]
                    
                    # Skip header rows and empty rows
                    if not category or category in ['Monthly Totals', ''] or 'Monthly Totals' in category:
                        continue
                    
                    # Extract data for each month
                    monthly_data = {}
                    for i, month in enumerate(months):
                        if i + 1 < len(cell_texts):
                            value_text = cell_texts[i + 1].replace(',', '').strip()
                            try:
                                value = int(value_text) if value_text.isdigit() else None
                                monthly_data[month] = value
                            except (ValueError, IndexError):
                                monthly_data[month] = None
                    
                    # Store the data
                    if monthly_data and any(v is not None for v in monthly_data.values()):
                        apprehensions_data[category] = monthly_data
                        logger.info(f"Parsed data for category: {category}")
                
                break
        
        return apprehensions_data
    
    def structure_data(self, raw_data):
        """Structure the parsed data into a more organized format"""
        structured_data = {
            'metadata': {
                'source': 'U.S. Customs and Border Protection',
                'url': self.base_url,
                'scraped_at': datetime.now().isoformat(),
                'description': 'Monthly border apprehensions data by category and location'
            },
            'categories': {},
            'monthly_totals': {}
        }
        
        # Organize data by category
        for category, monthly_data in raw_data.items():
            # Clean up category names
            clean_category = self.clean_category_name(category)
            
            structured_data['categories'][clean_category] = {
                'original_name': category,
                'monthly_data': monthly_data,
                'total': sum(v for v in monthly_data.values() if v is not None)
            }
        
        # Create monthly totals summary
        if raw_data:
            months = list(next(iter(raw_data.values())).keys())
            for month in months:
                structured_data['monthly_totals'][month] = {}
                for category, data in structured_data['categories'].items():
                    value = data['monthly_data'].get(month)
                    if value is not None:
                        structured_data['monthly_totals'][month][category] = value
        
        return structured_data
    
    def clean_category_name(self, category):
        """Clean up category names for consistency"""
        # Remove extra spaces and normalize
        cleaned = re.sub(r'\s+', ' ', category.strip())
        
        # Create simplified keys
        key_mappings = {
            'Nationwide Total Apprehensions': 'nationwide_total',
            'Southwest Border Total Apprehensions': 'southwest_total', 
            'Northern Border Total Apprehensions': 'northern_total',
            'At Large': 'at_large',
            'At Entry': 'at_entry'
        }
        
        for full_name, key in key_mappings.items():
            if full_name.lower() in cleaned.lower():
                return key
        
        # Default: create snake_case from the category name
        snake_case = re.sub(r'[^\w\s]', '', cleaned.lower())
        snake_case = re.sub(r'\s+', '_', snake_case)
        return snake_case
    
    def save_data(self, data):
        """Save the structured data to JSON files"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save main data file
        main_file = self.data_dir / 'cbp_apprehensions_data.json'
        with open(main_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved main data to {main_file}")
        
        # Save timestamped backup
        backup_file = self.data_dir / f'cbp_apprehensions_{timestamp}.json'
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved backup to {backup_file}")
        
        # Create simplified CSV for easy analysis
        self.create_csv_summary(data)
        
        return main_file
    
    def create_csv_summary(self, data):
        """Create CSV files for easy analysis"""
        if not data.get('monthly_totals'):
            return
        
        # DISABLED: No longer creating unused CSV files
        # Create monthly summary CSV
        # monthly_df = pd.DataFrame.from_dict(data['monthly_totals'], orient='index')
        # monthly_df.index.name = 'Month'
        # csv_file = self.data_dir / 'cbp_apprehensions_monthly.csv'
        # monthly_df.to_csv(csv_file)
        # logger.info(f"Saved monthly CSV to {csv_file}")
        
        # Create category trends CSV
        # categories_data = []
        # for month, month_data in data['monthly_totals'].items():
        #     for category, value in month_data.items():
        #         categories_data.append({
        #             'Month': month,
        #             'Category': category,
        #             'Apprehensions': value
        #         })
        # if categories_data:
        #     trends_df = pd.DataFrame(categories_data)
        #     trends_csv = self.data_dir / 'cbp_apprehensions_trends.csv'
        #     trends_df.to_csv(trends_csv, index=False)
        #     logger.info(f"Saved trends CSV to {trends_csv}")
    
    def run_scraper(self):
        """Main method to run the complete scraping process"""
        try:
            logger.info("Starting CBP apprehensions data scraper")
            
            # Fetch the webpage
            html_content = self.fetch_page()
            
            # Parse the apprehensions table
            raw_data = self.parse_apprehensions_table(html_content)
            
            if not raw_data:
                logger.warning("No apprehensions data found on the webpage")
                return False
            
            logger.info(f"Successfully parsed data for {len(raw_data)} categories")
            
            # Structure the data
            structured_data = self.structure_data(raw_data)
            
            # Save the data
            output_file = self.save_data(structured_data)
            
            logger.info(f"✅ CBP apprehensions data scraping completed successfully!")
            logger.info(f"📊 Data saved to: {output_file}")
            logger.info(f"📈 Total categories: {len(structured_data['categories'])}")
            logger.info(f"📅 Months covered: {len(structured_data['monthly_totals'])}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error during scraping: {e}")
            return False

def main():
    """Run the CBP apprehensions scraper"""
    scraper = CBPApprehensionsScraper()
    success = scraper.run_scraper()
    
    if success:
        print("\n🎉 CBP apprehensions data scraping completed successfully!")
        print("📁 Check the 'data/' directory for output files:")
        print("   - cbp_apprehensions_data.json (main data - used by dashboard)")
    else:
        print("\n❌ Scraping failed. Check the logs for details.")
        exit(1)

if __name__ == "__main__":
    main()