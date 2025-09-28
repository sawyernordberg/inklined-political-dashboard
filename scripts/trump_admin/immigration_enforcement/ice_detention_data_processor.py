#!/usr/bin/env python3
"""
ICE Detention Statistics Data Scraper
Scrapes Excel data from ICE detention statistics and saves to JSON files
"""

import requests
import pandas as pd
import json
import os
from datetime import datetime
import logging
from typing import Dict, List, Any
from pathlib import Path
import numpy as np
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class CustomJSONEncoder(json.JSONEncoder):
    """Custom JSON encoder to handle numpy types and datetime objects"""
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif hasattr(obj, 'isoformat'):
            return obj.isoformat()
        elif pd.isna(obj):
            return None
        return super().default(obj)

class ICEDetentionScraper:
    """Scraper for ICE detention statistics from Excel files"""
    
    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(exist_ok=True)
        self.base_url = "https://www.ice.gov/detain/detention-management"
        self.excel_url = None  # Will be dynamically discovered
        self.excel_file = self.data_dir / "ice_detention_raw.xlsx"
        
    def find_excel_url(self) -> bool:
        """Find the Excel file URL from the ICE detention management page"""
        try:
            logger.info(f"Searching for Excel file URL on: {self.base_url}")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(self.base_url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for Excel file links - specifically FY25 detention statistics
            # Check for links that contain detention stats and xlsx
            excel_links = []
            
            # Search for links containing detention statistics Excel files
            for link in soup.find_all('a', href=True):
                href = link['href'].lower()
                link_text = link.get_text().lower()
                
                # Look for Excel files related to detention statistics
                if ('.xlsx' in href and 
                    ('detention' in href or 'detention' in link_text) and
                    ('fy25' in href or 'fy2025' in href or '2025' in href)):
                    
                    full_url = urljoin(self.base_url, link['href'])
                    excel_links.append({
                        'url': full_url,
                        'text': link.get_text().strip(),
                        'filename': href.split('/')[-1]
                    })
                    logger.info(f"Found potential Excel link: {link.get_text().strip()} -> {full_url}")
            
            # If no FY25 links found, look for any recent detention stats
            if not excel_links:
                logger.info("No FY25 links found, looking for any detention statistics Excel files...")
                for link in soup.find_all('a', href=True):
                    href = link['href'].lower()
                    link_text = link.get_text().lower()
                    
                    if ('.xlsx' in href and 
                        ('detention' in href or 'detention' in link_text)):
                        
                        full_url = urljoin(self.base_url, link['href'])
                        excel_links.append({
                            'url': full_url,
                            'text': link.get_text().strip(),
                            'filename': href.split('/')[-1]
                        })
                        logger.info(f"Found Excel link: {link.get_text().strip()} -> {full_url}")
            
            if not excel_links:
                logger.error("No Excel files found on the detention management page")
                return False
            
            # Choose the most recent or most relevant file
            # Prefer FY25 files, then sort by filename (which often contains dates)
            excel_links.sort(key=lambda x: (not any(y in x['filename'] for y in ['fy25', 'fy2025', '2025']), x['filename']))
            
            selected_link = excel_links[0]
            self.excel_url = selected_link['url']
            
            logger.info(f"Selected Excel file: {selected_link['text']} -> {self.excel_url}")
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to fetch detention management page: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error finding Excel URL: {e}")
            return False

    def download_excel_file(self) -> bool:
        """Download the Excel file from ICE website"""
        try:
            if not self.excel_url:
                logger.error("No Excel URL found. Call find_excel_url() first.")
                return False
                
            logger.info(f"Downloading Excel file from: {self.excel_url}")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(self.excel_url, headers=headers, timeout=30)
            response.raise_for_status()
            
            with open(self.excel_file, 'wb') as f:
                f.write(response.content)
            
            logger.info(f"Excel file downloaded successfully: {self.excel_file}")
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to download Excel file: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error during download: {e}")
            return False
    
    def read_excel_sheets(self) -> Dict[str, pd.DataFrame]:
        """Read all sheets from the Excel file"""
        try:
            logger.info("Reading Excel sheets...")
            
            # Read all sheets
            excel_data = pd.read_excel(self.excel_file, sheet_name=None, engine='openpyxl')
            
            logger.info(f"Found {len(excel_data)} sheets: {list(excel_data.keys())}")
            return excel_data
            
        except Exception as e:
            logger.error(f"Failed to read Excel file: {e}")
            return {}
    
    def detect_header_row(self, df: pd.DataFrame, sheet_name: str) -> int:
        """Detect which row contains the actual column headers"""
        try:
            # Sheet-specific header detection patterns
            sheet_patterns = {
                'ATD FY25 YTD': ['Technology', 'Count', 'Daily Tech Cost', 'Metric', '%'],
                'Detention FY25': ['Processing Disposition', 'FSC', 'Adult', 'Total', 'Detention Facility Type'],
                'Facilities FY25': ['Name', 'Address', 'City', 'State', 'Zip', 'AOR', 'Type', 'ALOS'],
                ' ICLOS and Detainees': ['January', 'February', 'March', 'April', 'May', 'June'],
                'Monthly Bond Statistics': ['Date', 'Bond', 'Custody', 'Determination'],
                'Monthly Segregation': ['Segregation', 'Count', 'Type'],
                'Vulnerable & Special Population': ['Population', 'Count', 'Percentage'],
                'Semiannual': ['Period', 'Metric', 'Value']
            }
            
            # General header indicators
            general_indicators = ['Technology', 'Count', 'Metric', 'Name', 'Address', 'City', 'State', 
                               'Facility', 'Date', 'Male', 'Female', 'Level', 'AOR', 'Type',
                               'Daily Tech Cost', 'Zip', 'ALOS', 'Crim', 'Non-Crim', 'Threat Level',
                               'Mandatory', 'Inspection', 'Rating', 'Last', 'End Date', 'Standard',
                               'Processing Disposition', 'FSC', 'Adult', 'Detention Facility Type']
            
            # Get sheet-specific patterns
            sheet_specific_patterns = sheet_patterns.get(sheet_name, [])
            
            for idx in range(min(15, len(df))):  # Check first 15 rows
                row_values = [str(val).strip() for val in df.iloc[idx].values if pd.notna(val)]
                
                # CRITICAL: Skip rows that look like data rows, not headers
                # Check if this row contains numeric data that suggests it's a data row
                numeric_values = [val for val in row_values if val.replace('.', '').replace('-', '').isdigit()]
                if len(numeric_values) >= 2:  # If 2+ numeric values, likely a data row
                    continue
                
                # Check if this is a "Total" data row (not a header row)
                if (len(row_values) >= 4 and 
                    row_values[0] == 'Total' and 
                    any(val.isdigit() for val in row_values[1:4])):
                    # This is a data row with "Total" as the first column, not a header
                    continue
                
                # Sheet-specific detection - but be more careful
                if sheet_specific_patterns:
                    sheet_matches = sum(1 for val in row_values 
                                      if any(pattern.lower() in val.lower() for pattern in sheet_specific_patterns))
                    # Require more matches for sheet-specific patterns to be safer
                    if sheet_matches >= 3:
                        return idx
                
                # Check for exact matches of common headers (excluding 'Total' since it can be data)
                exact_matches = sum(1 for val in row_values 
                                  if val in ['Technology', 'Count', 'Metric', '%', 'Name', 'Address', 'City', 
                                           'State', 'FSC', 'Adult', 'Processing Disposition'])
                
                # Additional patterns that indicate header rows
                short_meaningful_values = sum(1 for val in row_values 
                                            if len(val) <= 25 and val.replace(' ', '').replace('%', '').isalpha())
                
                # More conservative detection - require more evidence it's a header
                if (exact_matches >= 3 or  # Increased from 2 to 3
                    (exact_matches >= 2 and short_meaningful_values >= 4)):  # More strict conditions
                    return idx
            
            return -1  # No header row found
            
        except Exception as e:
            logger.error(f"Error detecting header row: {e}")
            return -1

    def get_predefined_headers(self, sheet_name: str, column_count: int) -> List[str]:
        """Get predefined column headers based on known sheet structures"""
        
        # Known column mappings for specific sheets
        sheet_mappings = {
            'ATD FY25 YTD': [
                'Technology', 'Count', 'Daily_Tech_Cost', 'Metric', 'Count_2', 'Percentage'
            ],
            'Facilities FY25': [
                'Facility_Name', 'Address', 'City', 'State', 'ZIP_Code', 'AOR', 
                'Type_Detailed', 'Gender', 'FY25_ALOS', 'Level_A', 'Level_B', 'Level_C', 'Level_D',
                'Male_Crim', 'Male_Non_Crim', 'Female_Crim', 'Female_Non_Crim',
                'ICE_Threat_Level_1', 'ICE_Threat_Level_2', 'ICE_Threat_Level_3', 'No_ICE_Threat_Level',
                'Mandatory', 'Guaranteed_Minimum', 'Last_Inspection_Type', 'Last_Inspection_End_Date',
                'Pending_FY25_Inspection', 'Last_Inspection_Standard', 'Last_Final_Rating'
            ],
            'Detention FY25': [
                'Processing_Disposition', 'FSC', 'Adult', 'Total', 'Col_5', 'Col_6', 'ICE_Release_Fiscal_Year',
                'Col_8', 'FSC_Fear', 'Adult_Fear', 'Total_Fear', 'Col_12', 'Col_13', 'Detention_Facility_Type', 'Col_15',
                'Total_Detained', 'Col_17', 'Col_18', 'Col_19', 'Col_20', 'Col_21', 'Col_22'
            ],
            ' ICLOS and Detainees': [
                'Metric'
            ] + [f'{month}_{year}' for month in ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] 
                for year in ['FY24', 'FY25']],
            'Monthly Bond Statistics': [
                'Bond_Type', 'Custody_Determination_Date', 'Col_3', 'Col_4', 'Col_5', 'Col_6'
            ],
            'Monthly Segregation': [
                'Segregation_Type', 'Count', 'Col_3', 'Col_4', 'Col_5'
            ],
            'Vulnerable & Special Population': [
                'Population_Type', 'Count', 'Percentage', 'Col_4', 'Col_5'
            ],
            'Semiannual': [
                'Metric', 'Period_1', 'Period_2', 'Col_4', 'Col_5'
            ]
        }
        
        # Get predefined headers if available
        if sheet_name in sheet_mappings:
            predefined = sheet_mappings[sheet_name]
            # Extend or truncate to match column count
            if len(predefined) >= column_count:
                return predefined[:column_count]
            else:
                # Extend with generic names
                extended = predefined + [f'{sheet_name}_Col_{i+1}' for i in range(len(predefined), column_count)]
                return extended
        
        return None

    def extract_meaningful_headers(self, df: pd.DataFrame, sheet_name: str) -> List[str]:
        """Extract meaningful column headers from the dataframe"""
        try:
            # Always try to detect and remove header rows first - may need to check multiple times
            removed_count = 0
            max_removals = 3  # Prevent infinite loops
            
            while removed_count < max_removals:
                header_row = self.detect_header_row(df, sheet_name)
                
                if header_row != -1:
                    logger.info(f"Detected and removing header row at index {header_row} for sheet: {sheet_name}")
                    # Remove the header row from the dataframe
                    df = df.drop(df.index[header_row]).reset_index(drop=True)
                    removed_count += 1
                else:
                    break
            
            # Then use predefined headers for known sheet types
            predefined_headers = self.get_predefined_headers(sheet_name, len(df.columns))
            if predefined_headers:
                logger.info(f"Using predefined headers for sheet: {sheet_name}")
                return predefined_headers, df
            
            # If we detected a header row but don't have predefined headers, use the detected headers
            if header_row != -1:
                logger.info(f"Using detected headers from removed row for sheet: {sheet_name}")
                # Recreate the headers from the row we just removed
                original_df = df  # Keep reference to modified df
                # Re-read the original row for header extraction
                header_values = []
                
                # Use the detected header row values to create column names
                new_headers = []
                for i in range(len(df.columns)):
                    # Create descriptive names based on position and sheet
                    if sheet_name == 'ATD FY25 YTD':
                        if i == 0: new_headers.append('Technology')
                        elif i == 1: new_headers.append('Count')
                        elif i == 2: new_headers.append('Daily_Tech_Cost')
                        elif i == 3: new_headers.append('Metric')
                        elif i == 4: new_headers.append('Count_2')
                        elif i == 5: new_headers.append('Percentage')
                        else: new_headers.append(f'{sheet_name.replace(" ", "_")}_Col_{i+1}')
                    else:
                        new_headers.append(f'{sheet_name.replace(" ", "_")}_Col_{i+1}')
                
                return new_headers, df
            
            # If no header row detected, create descriptive names based on sheet content and position
            logger.info(f"No header row detected for sheet: {sheet_name}, using content-based naming")
            descriptive_headers = []
            for i in range(len(df.columns)):
                # Look at the first few non-null values in this column to understand its content
                sample_values = []
                for j in range(min(5, len(df))):
                    val = df.iloc[j, i]
                    if pd.notna(val) and str(val).strip():
                        sample_values.append(str(val).strip())
                
                # Generate descriptive name based on content patterns and position
                if sample_values:
                    first_val = sample_values[0]
                    if 'date' in first_val.lower() or any(year in first_val for year in ['2025', '2024', '2023']):
                        descriptive_headers.append(f'Date_Col_{i+1}')
                    elif first_val.replace('.', '').replace('-', '').isdigit():
                        descriptive_headers.append(f'Numeric_Col_{i+1}')
                    elif '%' in first_val:
                        descriptive_headers.append(f'Percentage_Col_{i+1}')
                    elif any(keyword in first_val.lower() for keyword in ['name', 'facility', 'address', 'city']):
                        descriptive_headers.append(f'{first_val.replace(" ", "_")}_Col_{i+1}')
                    else:
                        descriptive_headers.append(f'{sheet_name.replace(" ", "_")}_Col_{i+1}')
                else:
                    descriptive_headers.append(f'{sheet_name.replace(" ", "_")}_Col_{i+1}')
            
            return descriptive_headers, df
            
        except Exception as e:
            logger.error(f"Error extracting meaningful headers: {e}")
            # Fallback to generic names
            return [f'{sheet_name.replace(" ", "_")}_Col_{i+1}' for i in range(len(df.columns))], df

    def clean_data(self, df: pd.DataFrame, sheet_name: str = "Unknown") -> pd.DataFrame:
        """Clean and standardize DataFrame data with intelligent column naming"""
        try:
            # Remove completely empty rows and columns
            df = df.dropna(how='all').dropna(axis=1, how='all')
            
            if len(df) == 0:
                return df
            
            # Extract meaningful headers
            meaningful_headers, df = self.extract_meaningful_headers(df, sheet_name)
            
            # Handle duplicate column names
            final_headers = []
            for header in meaningful_headers:
                original_name = header
                counter = 1
                while header in final_headers:
                    header = f"{original_name}_{counter}"
                    counter += 1
                final_headers.append(header)
            
            # Ensure we have the right number of headers
            while len(final_headers) < len(df.columns):
                final_headers.append(f'{sheet_name}_Col_{len(final_headers)+1}')
            
            df.columns = final_headers[:len(df.columns)]
            
            # Convert datetime objects to strings for JSON serialization
            for col in df.columns:
                if df[col].dtype == 'datetime64[ns]' or pd.api.types.is_datetime64_any_dtype(df[col]):
                    df[col] = df[col].astype(str)
            
            # Replace NaN values with None for JSON serialization
            df = df.where(pd.notna(df), None)
            
            # Convert any remaining datetime objects to strings
            for col in df.columns:
                if df[col].dtype == 'object':
                    df[col] = df[col].apply(lambda x: x.isoformat() if hasattr(x, 'isoformat') else x)
            
            return df
            
        except Exception as e:
            logger.error(f"Error cleaning data: {e}")
            return df
    
    # DISABLED: No longer creating unused raw excel JSON file
    def _save_raw_data_json_DISABLED(self, excel_data: Dict[str, pd.DataFrame]) -> None:
        """Save raw Excel data as JSON - DISABLED"""
        try:
            raw_data = {}
            
            for sheet_name, df in excel_data.items():
                cleaned_df = self.clean_data(df, sheet_name)
                # Convert DataFrame to dict with records orientation
                raw_data[sheet_name] = cleaned_df.to_dict('records')
            
            # Add metadata
            raw_data['_metadata'] = {
                'source_url': self.excel_url or 'URL not found',
                'scraped_at': datetime.now().isoformat(),
                'sheets_count': len(excel_data),
                'sheet_names': list(excel_data.keys())
            }
            
            output_file = self.data_dir / "ice_detention_raw_excel.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(raw_data, f, indent=2, ensure_ascii=False, cls=CustomJSONEncoder)
            
            logger.info(f"Raw data saved to: {output_file}")
            
        except Exception as e:
            logger.error(f"Failed to save raw data: {e}")
    
    # DISABLED: No longer creating unused simplified JSON file
    def _save_simplified_data_json_DISABLED(self, excel_data: Dict[str, pd.DataFrame]) -> None:
        """Save simplified/processed data as JSON - DISABLED"""
        try:
            simplified_data = {
                'summary': {
                    'total_sheets': len(excel_data),
                    'sheet_names': list(excel_data.keys()),
                    'scraped_at': datetime.now().isoformat(),
                    'source': self.excel_url or 'URL not found'
                },
                'sheets': {}
            }
            
            for sheet_name, df in excel_data.items():
                cleaned_df = self.clean_data(df, sheet_name)
                
                sheet_info = {
                    'name': sheet_name,
                    'rows': len(cleaned_df),
                    'columns': len(cleaned_df.columns),
                    'column_names': list(cleaned_df.columns),
                    'data': cleaned_df.to_dict('records')
                }
                
                # Try to identify key statistics if possible
                if 'Total' in str(df.values).upper() or 'TOTAL' in str(df.values):
                    sheet_info['contains_totals'] = True
                
                simplified_data['sheets'][sheet_name] = sheet_info
            
            output_file = self.data_dir / "ice_detention_simplified.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(simplified_data, f, indent=2, ensure_ascii=False, cls=CustomJSONEncoder)
            
            logger.info(f"Simplified data saved to: {output_file}")
            
        except Exception as e:
            logger.error(f"Failed to save simplified data: {e}")
    
    # DISABLED: No longer creating unused chart JSON file
    def _extract_chart_data_DISABLED(self, excel_data: Dict[str, pd.DataFrame]) -> None:
        """Extract data suitable for charts and visualizations - DISABLED"""
        try:
            chart_data = {
                'metadata': {
                    'source': self.excel_url or 'URL not found',
                    'generated_at': datetime.now().isoformat(),
                    'description': 'Data formatted for chart/visualization purposes'
                },
                'datasets': []
            }
            
            for sheet_name, df in excel_data.items():
                cleaned_df = self.clean_data(df, sheet_name)
                
                # Look for numeric columns that could be used for charts
                numeric_columns = cleaned_df.select_dtypes(include=['number']).columns.tolist()
                
                if len(numeric_columns) > 0 and len(cleaned_df) > 0:
                    dataset = {
                        'name': sheet_name,
                        'type': 'table_data',
                        'numeric_columns': numeric_columns,
                        'total_rows': len(cleaned_df),
                        'sample_data': cleaned_df.head(10).to_dict('records') if len(cleaned_df) > 10 else cleaned_df.to_dict('records')
                    }
                    
                    # Try to create summary statistics for numeric columns
                    if numeric_columns:
                        summary_stats = {}
                        for col in numeric_columns:
                            try:
                                stats = cleaned_df[col].describe()
                                summary_stats[col] = {
                                    'mean': float(stats['mean']) if pd.notna(stats['mean']) else None,
                                    'min': float(stats['min']) if pd.notna(stats['min']) else None,
                                    'max': float(stats['max']) if pd.notna(stats['max']) else None,
                                    'count': int(stats['count']) if pd.notna(stats['count']) else 0
                                }
                            except:
                                continue
                        
                        dataset['summary_statistics'] = summary_stats
                    
                    chart_data['datasets'].append(dataset)
            
            output_file = self.data_dir / "ice_detention_charts.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(chart_data, f, indent=2, ensure_ascii=False, cls=CustomJSONEncoder)
            
            logger.info(f"Chart data saved to: {output_file}")
            
        except Exception as e:
            logger.error(f"Failed to save chart data: {e}")
    
    def save_complete_dataset(self, excel_data: Dict[str, pd.DataFrame]) -> None:
        """Save complete dataset with all information"""
        try:
            complete_data = {
                'metadata': {
                    'source_url': self.excel_url or 'URL not found',
                    'file_name': self.excel_url.split('/')[-1] if self.excel_url else 'Unknown',
                    'scraped_at': datetime.now().isoformat(),
                    'total_sheets': len(excel_data),
                    'description': 'Complete ICE detention statistics dataset'
                },
                'sheets': {}
            }
            
            for sheet_name, df in excel_data.items():
                cleaned_df = self.clean_data(df, sheet_name)
                
                complete_data['sheets'][sheet_name] = {
                    'metadata': {
                        'sheet_name': sheet_name,
                        'rows': len(cleaned_df),
                        'columns': len(cleaned_df.columns),
                        'column_names': list(cleaned_df.columns),
                        'data_types': {col: str(dtype) for col, dtype in cleaned_df.dtypes.items()}
                    },
                    'data': cleaned_df.to_dict('records')
                }
            
            # Save to public/data directory
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.join(script_dir, '..', '..', '..')
            public_data_dir = os.path.join(project_root, 'public', 'data')
            
            # Create the directory if it doesn't exist
            os.makedirs(public_data_dir, exist_ok=True)
            
            public_output_file = os.path.join(public_data_dir, "ice_detention_data.json")
            with open(public_output_file, 'w', encoding='utf-8') as f:
                json.dump(complete_data, f, indent=2, ensure_ascii=False, cls=CustomJSONEncoder)
            
            logger.info(f"Complete dataset saved to: {public_output_file}")
            
            # Also save to local directory for backward compatibility
            output_file = self.data_dir / "ice_detention_data.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(complete_data, f, indent=2, ensure_ascii=False, cls=CustomJSONEncoder)
            
            logger.info(f"Complete dataset also saved locally to: {output_file}")
            
        except Exception as e:
            logger.error(f"Failed to save complete dataset: {e}")

    # DISABLED: No longer creating unused CSV files
    def _save_csv_files_DISABLED(self, excel_data: Dict[str, pd.DataFrame]) -> None:
        """Save each sheet as a separate CSV file - DISABLED"""
        try:
            csv_dir = self.data_dir / "csv"
            csv_dir.mkdir(exist_ok=True)
            
            for sheet_name, df in excel_data.items():
                cleaned_df = self.clean_data(df, sheet_name)
                
                # Create a safe filename
                safe_name = sheet_name.replace(' ', '_').replace('/', '_').replace('\\', '_')
                csv_file = csv_dir / f"{safe_name}.csv"
                
                # Save as CSV
                cleaned_df.to_csv(csv_file, index=False, encoding='utf-8')
                logger.info(f"Saved CSV: {csv_file}")
            
            logger.info(f"All CSV files saved in: {csv_dir}")
            
        except Exception as e:
            logger.error(f"Failed to save CSV files: {e}")
    
    def run_scraper(self) -> bool:
        """Main method to run the entire scraping process"""
        try:
            logger.info("Starting ICE detention data scraping process...")
            
            # Find the Excel file URL on the detention management page
            if not self.find_excel_url():
                return False
            
            # Download Excel file
            if not self.download_excel_file():
                return False
            
            # Read Excel sheets
            excel_data = self.read_excel_sheets()
            if not excel_data:
                logger.error("No data found in Excel file")
                return False
            
            # Save data in different formats
            logger.info("Saving data in multiple formats...")
            
            self.save_complete_dataset(excel_data)
            # Only save the main data file that's actually used by the HTML
            # Disabled unused file creation:
            # self.save_raw_data_json(excel_data)
            # self.save_simplified_data_json(excel_data) 
            # self.extract_chart_data(excel_data)
            # self.save_csv_files(excel_data)
            
            logger.info("Scraping process completed successfully!")
            logger.info(f"All JSON files saved in: {self.data_dir}")
            
            return True
            
        except Exception as e:
            logger.error(f"Scraping process failed: {e}")
            return False

def main():
    """Main function to run the scraper"""
    print("ICE Detention Statistics Data Scraper")
    print("=" * 40)
    
    scraper = ICEDetentionScraper()
    
    success = scraper.run_scraper()
    
    if success:
        print("\n✅ Scraping completed successfully!")
        print(f"📁 Files saved in: {scraper.data_dir}")
        print("\nGenerated files:")
        print("- ice_detention_data.json (Complete dataset - used by dashboard)")
    else:
        print("\n❌ Scraping failed. Check scraper.log for details.")

if __name__ == "__main__":
    main()
