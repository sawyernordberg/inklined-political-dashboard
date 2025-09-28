#!/usr/bin/env python3
"""
World Scorecard Tariff Scraper - Country Tariffs Only
Scrapes US tariffs list and exemptions data from World Scorecard only
Based on the original working methods from eco1.py
"""

import requests
import json
from datetime import datetime
import re
import os
import time
from typing import Dict, List, Optional
from bs4 import BeautifulSoup

class WorldScorecardTariffScraper:
    """
    World Scorecard Tariff Scraper - Based on Original Working Methods
    Extracts country tariff data and exemptions only (no updates)
    """

    def __init__(self):
        # Request headers to appear as a regular browser
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        # World Scorecard URLs
        self.main_url = "https://worldscorecard.com/world-facts-and-figures/us-tariffs-and-the-world/"
        self.exemptions_url = "https://worldscorecard.com/world-facts-and-figures/us-tariffs-and-the-world/#h-tariff-exemptions-list-are-any-goods-or-services-exempt-from-the-tariffs"
        
        # Data storage - country tariffs and exemptions only
        self.tariff_data = {
            'country_tariffs': [],           # US Tariffs List table data
            'exemptions': [],                # Tariff exemptions list
            'summary': {}
        }
    
    def print_header(self, title: str):
        """Print formatted section header"""
        print("\n" + "="*80)
        print(f"🎯 {title}")
        print("="*80)
    
    def print_subheader(self, title: str):
        """Print formatted subsection header"""
        print(f"\n📊 {title}")
        print("-" * 60)
    
    def print_data_table(self, data: List[List[str]], headers: List[str], title: str = ""):
        """Print formatted data table"""
        if title:
            print(f"\n📋 {title}")
        
        if not data:
            print("   No data to display")
            return
        
        # Calculate column widths
        widths = [len(h) for h in headers]
        for row in data:
            for i, cell in enumerate(row):
                if i < len(widths):
                    widths[i] = max(widths[i], len(str(cell)))
        
        # Print header
        header_row = "│ " + " │ ".join(h.ljust(w) for h, w in zip(headers, widths)) + " │"
        separator = "├" + "┼".join("─" * (w + 2) for w in widths) + "┤"
        top_border = "┌" + "┬".join("─" * (w + 2) for w in widths) + "┐"
        bottom_border = "└" + "┴".join("─" * (w + 2) for w in widths) + "┘"
        
        print(top_border)
        print(header_row)
        print(separator)
        
        # Print data rows
        for row in data:
            padded_row = []
            for i, cell in enumerate(row):
                if i < len(widths):
                    padded_row.append(str(cell).ljust(widths[i]))
                else:
                    padded_row.append(str(cell))
            
            row_str = "│ " + " │ ".join(padded_row) + " │"
            print(row_str)
        
        print(bottom_border)
    
    def scrape_world_scorecard_tariffs(self):
        """Main method to scrape World Scorecard tariff data - original approach"""
        self.print_header("WORLD SCORECARD TARIFF DATA COLLECTION")
        print(f"🕐 Collection started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🎯 Single Source: World Scorecard - Updates + US Tariffs List + Exemptions")
        print(f"🔗 URL: {self.main_url}")
        print(f"📊 Using original working methods from eco1.py")
        
        try:
            print(f"🔍 Accessing World Scorecard...")
            response = requests.get(self.main_url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            print(f"✅ Successfully accessed World Scorecard ({len(response.content):,} bytes)")
            
            # Extract US Tariffs List table (skip updates)
            self.extract_us_tariffs_table(soup)
            
            # Extract exemptions using original method
            self.extract_exemptions_only(soup)
            
            # Generate summary
            self.generate_summary()
            
            return self.tariff_data
            
        except Exception as e:
            print(f"❌ Error scraping World Scorecard: {e}")
            return None
    
    def extract_worldscorecard_updates(self, soup):
        """Extract ALL tariff updates from World Scorecard page - original method"""
        
        try:
            print("🔍 Searching for tariff update content...")
            
            # Look for sections with update-related content
            update_sections = soup.find_all(['div', 'section', 'article', 'p'], 
                                          string=re.compile(r'(update|new|recent|latest|announced|implemented|effective)', re.I))
            
            print(f"📊 Found {len(update_sections)} potential update sections")
            
            # Look for structured content areas
            content_areas = soup.find_all(['div', 'section', 'article'], 
                                        class_=re.compile(r'content|main|article|post', re.I))
            
            all_updates = []
            
            for area in content_areas:
                area_updates = self.parse_worldscorecard_content_area(area)
                all_updates.extend(area_updates)
            
            # Look for lists with update information
            lists = soup.find_all(['ul', 'ol'])
            for list_elem in lists:
                list_text = list_elem.get_text().lower()
                if any(keyword in list_text for keyword in ['tariff', 'trade', 'update', 'new', 'announced']):
                    list_updates = self.extract_worldscorecard_list_updates(list_elem)
                    all_updates.extend(list_updates)
            
            # Look for tables with update information
            tables = soup.find_all('table')
            for table in tables:
                table_text = table.get_text().lower()
                if any(keyword in table_text for keyword in ['update', 'announced', 'effective', 'new']):
                    table_updates = self.extract_worldscorecard_table_updates(table)
                    all_updates.extend(table_updates)
            
            # Look for paragraphs with specific update information
            paragraphs = soup.find_all('p')
            for para in paragraphs:
                para_text = para.get_text()
                if len(para_text) > 50 and any(keyword in para_text.lower() for keyword in 
                    ['tariff', 'trade war', 'announced', 'implemented', 'effective', 'percent', '%']):
                    para_update = self.parse_worldscorecard_paragraph(para)
                    if para_update:
                        all_updates.append(para_update)
            
            # Clean and deduplicate updates
            all_updates = self.clean_worldscorecard_updates(all_updates)
            print(f"✅ Extracted {len(all_updates)} unique tariff updates")
            
            self.tariff_data['worldscorecard_updates'] = all_updates
            
        except Exception as e:
            print(f"⚠️  Error extracting World Scorecard updates: {e}")
    
    def parse_worldscorecard_content_area(self, area):
        """Parse content areas for tariff updates - original method"""
        updates = []
        
        try:
            # Look for headings that indicate updates
            headings = area.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            
            for heading in headings:
                heading_text = heading.get_text().strip()
                
                # Check if this heading relates to tariff updates
                if any(keyword in heading_text.lower() for keyword in 
                      ['update', 'new', 'announced', 'implemented', 'tariff', 'trade']):
                    
                    # Get content after this heading
                    content_elements = []
                    current = heading.find_next_sibling()
                    
                    # Collect content until next heading or end
                    while current and current.name not in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                        if current.name in ['p', 'div', 'ul', 'ol']:
                            content_elements.append(current)
                        current = current.find_next_sibling()
                    
                    # Parse the collected content
                    if content_elements:
                        update = self.parse_worldscorecard_section_content(heading_text, content_elements)
                        if update:
                            updates.append(update)
            
        except Exception as e:
            print(f"⚠️  Error parsing content area: {e}")
        
        return updates
    
    def parse_worldscorecard_section_content(self, title, content_elements):
        """Parse section content for update information - original method"""
        try:
            description = ""
            status = ""
            effective_date = ""
            tariff_rate = ""
            affected_products = ""
            source_info = ""
            source_link = ""
            
            # Combine all content text
            all_text = ""
            for element in content_elements:
                element_text = element.get_text(separator=' ', strip=True)
                all_text += " " + element_text
                
                # Look for links that might be sources
                links = element.find_all('a')
                if links and not source_info:
                    source_link = links[0].get('href', '')
                    source_info = links[0].get_text(strip=True)
            
            # Extract description (first substantial paragraph)
            if len(all_text.strip()) > 20:
                description = all_text.strip()[:500]  # Limit description length
            
            # Extract dates
            date_patterns = [
                r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}',
                r'\d{1,2}[\/\-]\d{1,2}[\/\-]20\d{2}',
                r'20\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}',
                r'effective\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}'
            ]
            
            for pattern in date_patterns:
                match = re.search(pattern, all_text, re.IGNORECASE)
                if match:
                    effective_date = match.group(0).strip()
                    break
            
            # Extract status
            status_patterns = [
                r'(announced|implemented|effective|pending|proposed|active)',
                r'(in effect|taking effect|will take effect)'
            ]
            
            for pattern in status_patterns:
                match = re.search(pattern, all_text, re.IGNORECASE)
                if match:
                    status = match.group(1).strip()
                    break
            
            # Tariff rates
            rate_patterns = [
                r'(\d+(?:\.\d+)?%)',
                r'(\d+(?:\.\d+)?\s*percent)',
                r'rate of (\d+(?:\.\d+)?%?)',
                r'tariff of (\d+(?:\.\d+)?%?)'
            ]
            
            for pattern in rate_patterns:
                match = re.search(pattern, all_text, re.IGNORECASE)
                if match:
                    tariff_rate = match.group(1).strip()
                    break
            
            # Product categories
            product_keywords = ['steel', 'aluminum', 'automotive', 'electronics', 'textiles', 
                              'agriculture', 'lumber', 'solar panels', 'semiconductors', 'pharmaceuticals']
            found_products = []
            
            for keyword in product_keywords:
                if keyword.lower() in all_text.lower():
                    found_products.append(keyword.title())
            
            if found_products:
                affected_products = ', '.join(list(set(found_products)))
            
            # Only return if we have substantial information
            if len(description) > 30 and (status or effective_date or tariff_rate or affected_products):
                return {
                    'title': title,
                    'description': description,
                    'status': status,
                    'effective_date': effective_date,
                    'tariff_rate': tariff_rate,
                    'affected_products': affected_products,
                    'source_info': source_info,
                    'source_link': source_link
                }
            
        except Exception as e:
            print(f"⚠️  Error parsing section content: {e}")
        
        return None
    
    def extract_worldscorecard_list_updates(self, list_elem):
        """Extract updates from list elements - original method"""
        updates = []
        
        try:
            items = list_elem.find_all('li')
            
            for item in items:
                item_text = item.get_text(strip=True)
                
                # Check if this item contains update information
                if len(item_text) > 30 and any(keyword in item_text.lower() for keyword in 
                    ['tariff', 'announced', 'effective', 'implemented', 'percent', '%']):
                    
                    # Extract date
                    date_patterns = [
                        r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}',
                        r'\d{1,2}[\/\-]\d{1,2}[\/\-]20\d{2}'
                    ]
                    
                    effective_date = ""
                    for pattern in date_patterns:
                        date_match = re.search(pattern, item_text, re.IGNORECASE)
                        if date_match:
                            effective_date = date_match.group(0).strip()
                            break
                    
                    if not effective_date:
                        continue
                    
                    # Extract title
                    title = item_text[:100] + "..." if len(item_text) > 100 else item_text
                    
                    # Extract rate
                    rate_match = re.search(r'(\d+(?:\.\d+)?%)', item_text)
                    tariff_rate = rate_match.group(1) if rate_match else ""
                    
                    # Extract status
                    status = ""
                    if 'announced' in item_text.lower():
                        status = "Announced"
                    elif 'implemented' in item_text.lower():
                        status = "Implemented"
                    elif 'effective' in item_text.lower():
                        status = "Effective"
                    
                    updates.append({
                        'title': title,
                        'description': item_text,
                        'status': status,
                        'effective_date': effective_date,
                        'tariff_rate': tariff_rate,
                        'affected_products': '',
                        'source_info': '',
                        'source_link': ''
                    })
            
        except Exception as e:
            print(f"⚠️  Error extracting list updates: {e}")
        
        return updates
    
    def extract_worldscorecard_table_updates(self, table):
        """Extract updates from table elements - original method"""
        updates = []
        
        try:
            rows = table.find_all('tr')
            if len(rows) < 2:
                return updates
            
            # Get headers
            headers = [th.get_text(strip=True).lower() for th in rows[0].find_all(['th', 'td'])]
            
            # Process data rows
            for row in rows[1:]:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    row_data = [cell.get_text(strip=True) for cell in cells]
                    
                    # Map to update structure
                    update = {
                        'title': row_data[0] if len(row_data) > 0 else '',
                        'description': row_data[1] if len(row_data) > 1 else '',
                        'status': '',
                        'effective_date': '',
                        'tariff_rate': '',
                        'affected_products': '',
                        'source_info': '',
                        'source_link': ''
                    }
                    
                    # Map columns to fields based on headers
                    for i, header in enumerate(headers):
                        if i < len(row_data):
                            value = row_data[i]
                            
                            if any(keyword in header for keyword in ['date', 'when', 'effective']):
                                update['effective_date'] = value
                            elif any(keyword in header for keyword in ['rate', 'tariff', 'percent']):
                                update['tariff_rate'] = value
                            elif any(keyword in header for keyword in ['status', 'state']):
                                update['status'] = value
                    
                    # Only add if we have meaningful content
                    if update['title'] and len(update['title']) > 10:
                        updates.append(update)
            
        except Exception as e:
            print(f"⚠️  Error extracting table updates: {e}")
        
        return updates
    
    def parse_worldscorecard_paragraph(self, para):
        """Parse individual paragraphs for update information - original method"""
        try:
            para_text = para.get_text(strip=True)
            
            # Must be substantial and contain tariff-related content
            if len(para_text) < 50:
                return None
            
            # Extract dates
            date_patterns = [
                r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+20\d{2}',
                r'\d{1,2}[\/\-]\d{1,2}[\/\-]20\d{2}'
            ]
            
            effective_date = ""
            for pattern in date_patterns:
                date_match = re.search(pattern, para_text, re.IGNORECASE)
                if date_match:
                    effective_date = date_match.group(0).strip()
                    break
            
            if not effective_date:
                return None
            
            # Extract rate
            rate_match = re.search(r'(\d+(?:\.\d+)?%)', para_text)
            tariff_rate = rate_match.group(1) if rate_match else ""
            
            # Extract status
            status = ""
            status_keywords = ['announced', 'implemented', 'effective', 'pending', 'proposed']
            for keyword in status_keywords:
                if keyword in para_text.lower():
                    status = keyword.title()
                    break
            
            # Create title from first part of paragraph
            title = para_text[:80] + "..." if len(para_text) > 80 else para_text
            
            return {
                'title': title,
                'description': para_text,
                'status': status,
                'effective_date': effective_date,
                'tariff_rate': tariff_rate,
                'affected_products': '',
                'source_info': '',
                'source_link': ''
            }
            
        except Exception as e:
            print(f"⚠️  Error parsing paragraph: {e}")
        
        return None
    
    def clean_worldscorecard_updates(self, updates):
        """Clean and deduplicate World Scorecard updates - original method"""
        cleaned = []
        seen_dates = set()
        
        for update in updates:
            # Clean the data
            for key, value in update.items():
                if isinstance(value, str):
                    update[key] = re.sub(r'\s+', ' ', value).strip()
            
            # Use effective_date for deduplication
            effective_date = update.get('effective_date', '')
            
            # Skip if duplicate date or no date
            if not effective_date or effective_date in seen_dates:
                continue
            
            # Skip if too short title
            if len(update.get('title', '')) < 15:
                continue
            
            seen_dates.add(effective_date)
            cleaned.append(update)
        
        print(f"📋 Cleaned to {len(cleaned)} unique World Scorecard updates (deduplicated by date)")
        return cleaned
    
    def extract_us_tariffs_table(self, soup):
        """Extract the US Tariffs List table data"""
        self.print_header("US TARIFFS LIST TABLE EXTRACTION")
        
        try:
            print("🔍 Looking for US Tariffs List table...")
            
            # Find tables that might contain the tariff data
            tables = soup.find_all('table')
            print(f"📊 Found {len(tables)} tables to analyze")
            
            tariff_table = None
            
            # Look for table with country names and tariff percentages
            for i, table in enumerate(tables):
                table_text = table.get_text().lower()
                
                # Check if this table contains tariff-related content
                if any(keyword in table_text for keyword in ['country', 'tariff', 'afghanistan', 'albania', 'charged']):
                    rows = table.find_all('tr')
                    if len(rows) > 10:  # Must have substantial data
                        tariff_table = table
                        print(f"✅ Found tariff table #{i+1} with {len(rows)} rows")
                        break
            
            if not tariff_table:
                # Alternative: look for the data in other structures
                print("⚠️ Table not found, looking for alternative data structures...")
                self.extract_tariff_data_from_text(soup)
                return
            
            # Extract data from the table
            rows = tariff_table.find_all('tr')
            headers_found = False
            country_data = []
            
            for row_idx, row in enumerate(rows):
                cells = row.find_all(['th', 'td'])
                
                if len(cells) >= 3 and not headers_found:
                    # Check if this is the header row
                    cell_texts = [cell.get_text(strip=True) for cell in cells]
                    if any('country' in text.lower() for text in cell_texts):
                        print(f"✅ Found headers: {cell_texts}")
                        headers_found = True
                        continue
                
                if headers_found and len(cells) >= 3:
                    # Extract data rows
                    country = cells[0].get_text(strip=True)
                    tariff_charged = cells[1].get_text(strip=True)
                    reciprocal_tariff = cells[2].get_text(strip=True)
                    
                    # Only add if we have valid country data
                    if country and len(country) > 2 and country.lower() not in ['country', 'total']:
                        country_data.append({
                            'country': country,
                            'tariff_charged_to_usa': tariff_charged,
                            'usa_reciprocal_tariff': reciprocal_tariff
                        })
            
            if country_data:
                self.tariff_data['country_tariffs'] = country_data
                print(f"✅ Extracted tariff data for {len(country_data)} countries")
                
                # Display sample data
                self.print_subheader("SAMPLE COUNTRY TARIFF DATA")
                sample_data = []
                for country in country_data[:10]:  # Show first 10
                    sample_data.append([
                        country['country'],
                        country['tariff_charged_to_usa'],
                        country['usa_reciprocal_tariff']
                    ])
                
                headers = ["Country", "Tariffs Charged to USA", "USA Reciprocal Tariff"]
                self.print_data_table(sample_data, headers, f"First 10 of {len(country_data)} Countries")
            else:
                print("❌ No country tariff data found in table")
                
        except Exception as e:
            print(f"❌ Error extracting US tariffs table: {e}")
    
    def extract_tariff_data_from_text(self, soup):
        """Alternative method to extract tariff data from page text"""
        try:
            print("🔍 Extracting tariff data from page text...")
            
            # Look for country names with percentage patterns
            page_text = soup.get_text()
            
            # Country patterns with tariff percentages
            country_pattern = r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d+%)\s+(\d+%)'
            matches = re.findall(country_pattern, page_text)
            
            if matches:
                country_data = []
                for match in matches:
                    country, charged_tariff, reciprocal_tariff = match
                    
                    # Filter out obvious non-countries
                    if len(country) > 2 and country not in ['Chart', 'Table', 'Data']:
                        country_data.append({
                            'country': country,
                            'tariff_charged_to_usa': charged_tariff,
                            'usa_reciprocal_tariff': reciprocal_tariff
                        })
                
                if country_data:
                    self.tariff_data['country_tariffs'] = country_data
                    print(f"✅ Extracted {len(country_data)} countries from page text")
                else:
                    print("❌ No valid country data found in page text")
            else:
                print("❌ No tariff patterns found in page text")
                
        except Exception as e:
            print(f"❌ Error extracting from page text: {e}")
    
    def extract_exemptions_only(self, soup):
        """Extract exemptions data from the exemptions section - original method"""
        try:
            print("🔍 Looking for tariff exemptions table...")
            
            tables = soup.find_all('table')
            
            for i, table in enumerate(tables):
                header_row = table.find('tr')
                if header_row:
                    headers = [th.get_text(strip=True) for th in header_row.find_all(['th', 'td'])]
                    
                    # Check if this is the exemptions table
                    if any('goods' in h.lower() or 'service' in h.lower() for h in headers) and \
                       any('reason' in h.lower() or 'exemption' in h.lower() for h in headers):
                        
                        exemptions_from_table = self.parse_exemptions_table_only(table)
                        if exemptions_from_table:
                            self.tariff_data['exemptions'] = exemptions_from_table
                            print(f"✅ Found {len(exemptions_from_table)} exemptions")
                            
                            # Display exemptions
                            self.print_subheader("TARIFF EXEMPTIONS")
                            exemption_data = []
                            for exemption in exemptions_from_table[:10]:  # Show first 10
                                exemption_data.append([
                                    exemption.get('goods_service', 'Unknown'),
                                    exemption.get('reason', 'N/A')[:80] + "..." if len(exemption.get('reason', '')) > 80 else exemption.get('reason', 'N/A'),
                                    exemption.get('status', 'Active'),
                                    exemption.get('source_info', 'N/A')[:40] + "..." if len(exemption.get('source_info', '')) > 40 else exemption.get('source_info', 'N/A')
                                ])
                            
                            headers = ["Goods/Service", "Reason for Exemption", "Status", "Source"]
                            self.print_data_table(exemption_data, headers, "Tariff Exemptions")
                            break
            
            if not self.tariff_data.get('exemptions'):
                print("❌ No exemptions table found")
                
        except Exception as e:
            print(f"⚠️  Error extracting exemptions: {e}")
    
    def parse_exemptions_table_only(self, table):
        """Parse the exemptions table - original method"""
        exemptions = []
        
        try:
            rows = table.find_all('tr')
            
            if len(rows) < 2:
                return exemptions
            
            # Process data rows
            for row in rows[1:]:
                cells = row.find_all(['td', 'th'])
                
                if len(cells) >= 2:
                    goods_service = cells[0].get_text(strip=True)
                    reason_full = cells[1].get_text(separator=' ', strip=True)
                    
                    # Clean up reason text
                    reason_full = re.sub(r'\s+', ' ', reason_full).strip()
                    
                    # Remove source information
                    reason_clean = reason_full
                    if 'source:' in reason_clean.lower():
                        source_split = re.split(r'\bsource\s*:', reason_clean, 1, re.IGNORECASE)
                        reason_clean = source_split[0].strip()
                    
                    reason_clean = reason_clean.rstrip('.,;')
                    
                    # Only add if we have both goods/service and reason
                    if goods_service and reason_clean and len(goods_service) > 2 and len(reason_clean) > 10:
                        exemption = {
                            'goods_service': goods_service,
                            'reason': reason_clean,
                            'status': 'Active',
                            'source_info': ''
                        }
                        
                        exemptions.append(exemption)
            
        except Exception as e:
            print(f"⚠️  Error parsing exemptions table: {e}")
        
        return exemptions
    
    def generate_summary(self):
        """Generate summary of all collected data"""
        country_count = len(self.tariff_data.get('country_tariffs', []))
        exemptions_count = len(self.tariff_data.get('exemptions', []))
        
        print(f"\n📊 Data Collection Summary:")
        print(f"   • {country_count} countries with tariff data")
        print(f"   • {exemptions_count} tariff exemptions")
        
        # Save summary
        self.tariff_data['summary'] = {
            'collection_date': datetime.now().isoformat(),
            'total_countries': country_count,
            'total_exemptions': exemptions_count,
            'url': self.main_url
        }
    
    def save_to_json(self, filename=None):
        """Save all collected data to JSON file in the public data folder."""
        try:
            # Determine the file path - save to public/data folder
            if filename is None:
                # Get the script directory and navigate to public/data
                script_dir = os.path.dirname(os.path.abspath(__file__))
                project_root = os.path.join(script_dir, '..', '..', '..')
                public_data_dir = os.path.join(project_root, 'public', 'data')
                filename = os.path.join(public_data_dir, 'tariff_data_clean.json')
            
            # Create the directory if it doesn't exist
            os.makedirs(os.path.dirname(filename), exist_ok=True)
            
            # Create a new dictionary with the timestamp at the top
            output_data = {
                "timestamp": datetime.now().isoformat(),
                "description": "Country-specific reciprocal tariffs - tariffs charged to USA vs USA reciprocal tariffs"
            }
            # Merge the existing tariff_data into the new dictionary
            output_data.update(self.tariff_data)

            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)
            
            print(f"\n💾 Data saved to {filename}")
            print(f"📊 JSON contains:")
            print(f"   • Timestamp: {output_data['timestamp']}")
            print(f"   • {len(self.tariff_data.get('country_tariffs', []))} country tariff entries")
            print(f"   • {len(self.tariff_data.get('exemptions', []))} tariff exemptions")
            
            return filename
            
        except Exception as e:
            print(f"❌ Error saving to JSON: {e}")
            return None

def main():
    """Main function to run the World Scorecard tariff scraper"""
    print("🎯 WORLD SCORECARD TARIFF SCRAPER - COUNTRY TARIFFS ONLY")
    print("=" * 50)
    print("📊 Single source: World Scorecard - US Tariffs List + Exemptions")
    print("🔗 Legal scraping from publicly available data")
    print("📋 Using original working methods from eco1.py")
    
    scraper = WorldScorecardTariffScraper()
    
    try:
        # Scrape all World Scorecard tariff data
        tariff_data = scraper.scrape_world_scorecard_tariffs()
        
        if tariff_data:
            # Save to JSON
            filename = scraper.save_to_json()
            
            print(f"\n✅ WORLD SCORECARD TARIFF SCRAPING COMPLETED!")
            print(f"📊 Successfully collected tariff data from single legal source")
            print(f"💾 Data saved to: {filename}")
            print(f"🚀 Tariff data ready for use in political dashboard")
        else:
            print(f"\n❌ No tariff data could be collected")
            return 1
            
    except Exception as e:
        print(f"\n❌ Error during tariff scraping: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())