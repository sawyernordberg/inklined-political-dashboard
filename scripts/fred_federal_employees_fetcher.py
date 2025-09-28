#!/usr/bin/env python3
"""
FRED Federal Employees Data Fetcher

This script fetches 5-year data for "All Employees, Federal" (CEU9091000001)
from the Federal Reserve Economic Data (FRED) API and saves it to a JSON file.

Requirements:
- FRED_API_KEY environment variable must be set
- requests library (install with: pip install requests)

Usage:
    python3 -m scripts.fred_federal_employees_fetcher
"""

import os
import json
import requests
from datetime import datetime, timedelta
import sys
from pathlib import Path

def load_env_file():
    """Load environment variables from .env file if it exists."""
    # Look for .env file in the project root (nextjs-political-dashboard directory)
    env_file = Path(__file__).parent.parent / '.env'
    print(f"Looking for .env file at: {env_file}")
    
    if env_file.exists():
        print(f"Found .env file at: {env_file}")
        with open(env_file, 'r') as f:
            content = f.read()
            print(f"Raw .env file content: {repr(content)}")
            
        with open(env_file, 'r') as f:
            for line_num, line in enumerate(f, 1):
                print(f"Line {line_num}: {repr(line)}")
                line = line.strip()
                if line and not line.startswith('#'):
                    if '=' in line:
                        key, value = line.split('=', 1)
                        key = key.strip()
                        value = value.strip()
                        os.environ[key] = value
                        print(f"Loaded environment variable: {key} = {value}")
                    else:
                        print(f"Warning: Invalid line format at line {line_num}: {line}")
                else:
                    print(f"Skipping line {line_num}: {repr(line)}")
    else:
        print(f".env file not found at: {env_file}")
        # Also try looking in the current working directory
        cwd_env = Path.cwd() / '.env'
        print(f"Also checking: {cwd_env}")
        if cwd_env.exists():
            print(f"Found .env file at: {cwd_env}")
            with open(cwd_env, 'r') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if line and not line.startswith('#'):
                        if '=' in line:
                            key, value = line.split('=', 1)
                            key = key.strip()
                            value = value.strip()
                            os.environ[key] = value
                            print(f"Loaded environment variable: {key} = {value}")
                        else:
                            print(f"Warning: Invalid line format at line {line_num}: {line}")

def fetch_fred_data(api_key, series_id, start_date, end_date):
    """
    Fetch data from FRED API for the specified series and date range.
    
    Args:
        api_key (str): FRED API key
        series_id (str): FRED series ID
        start_date (str): Start date in YYYY-MM-DD format
        end_date (str): End date in YYYY-MM-DD format
    
    Returns:
        dict: FRED API response data
    """
    base_url = "https://api.stlouisfed.org/fred/series/observations"
    
    params = {
        'series_id': series_id,
        'api_key': api_key,
        'file_type': 'json',
        'observation_start': start_date,
        'observation_end': end_date,
        'sort_order': 'asc'
    }
    
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from FRED API: {e}")
        return None

def get_series_info(api_key, series_id):
    """
    Get series information from FRED API.
    
    Args:
        api_key (str): FRED API key
        series_id (str): FRED series ID
    
    Returns:
        dict: Series information
    """
    base_url = "https://api.stlouisfed.org/fred/series"
    
    params = {
        'series_id': series_id,
        'api_key': api_key,
        'file_type': 'json'
    }
    
    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching series info from FRED API: {e}")
        return None

def main():
    """Main function to fetch and save FRED data."""
    # Load environment variables from .env file
    load_env_file()
    
    # Get API key from environment
    api_key = os.getenv('FRED_API_KEY')
    print(f"FRED_API_KEY from environment: {api_key}")
    if not api_key:
        print("Error: FRED_API_KEY environment variable not found.")
        print("Please set FRED_API_KEY in your .env file or environment variables.")
        print("Available environment variables:")
        for key, value in os.environ.items():
            if 'FRED' in key.upper() or 'API' in key.upper():
                print(f"  {key} = {value}")
        sys.exit(1)
    
    # Series ID for "All Employees, Federal"
    series_id = "CEU9091000001"
    
    # Calculate date range (5 years from today)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=5*365)  # Approximately 5 years
    
    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')
    
    print(f"Fetching data for series {series_id} from {start_date_str} to {end_date_str}")
    
    # Get series information
    print("Fetching series information...")
    series_info = get_series_info(api_key, series_id)
    if not series_info:
        print("Failed to fetch series information")
        sys.exit(1)
    
    # Fetch the data
    print("Fetching observation data...")
    data = fetch_fred_data(api_key, series_id, start_date_str, end_date_str)
    if not data:
        print("Failed to fetch data")
        sys.exit(1)
    
    # Prepare output data
    output_data = {
        'series_info': series_info,
        'observations': data,
        'fetch_timestamp': datetime.now().isoformat(),
        'date_range': {
            'start': start_date_str,
            'end': end_date_str
        }
    }
    
    # Create output directory if it doesn't exist
    output_dir = Path(__file__).parent.parent / 'public' / 'data'
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = output_dir / f'federal_employees_data_{timestamp}.json'
    
    # Save data to JSON file
    try:
        with open(output_file, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"Data successfully saved to: {output_file}")
        print(f"Number of observations: {len(data.get('observations', []))}")
        
        # Also save a copy with a standard name for easy access
        standard_file = output_dir / 'federal_employees_data.json'
        with open(standard_file, 'w') as f:
            json.dump(output_data, f, indent=2)
        print(f"Data also saved to: {standard_file}")
        
    except Exception as e:
        print(f"Error saving data to file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
