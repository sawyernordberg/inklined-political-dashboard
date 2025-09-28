#!/usr/bin/env python3
"""
Create Sources List from Gemini Tariff Analysis
Uses the same logic as tariff_merger.py to extract clean source names
"""

import json
import os
import re
from typing import Dict, List, Any, Set

class SourcesListCreator:
    """Creates clean sources list using tariff_merger.py logic"""
    
    def __init__(self):
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.join(self.script_dir, '..', '..', '..')
        self.public_data_dir = os.path.join(self.project_root, 'public', 'data')
        
        # File paths
        self.gemini_file = os.path.join(self.public_data_dir, 'gemini_tariff_analysis.json')
        self.clean_file = os.path.join(self.public_data_dir, 'tariff_data_clean.json')
    
    def extract_source_names(self, source_titles: List[str]) -> List[str]:
        """Extract just the source names from source titles - using tariff_merger.py logic."""
        # Sources to exclude
        excluded_sources = {
            'wikipedia', 'itvx', 'alcircle', 'trade war news', 
            'profit by pakistan today', 'business and economy news'
        }
        
        # Patterns that indicate non-company names
        non_company_patterns = [
            r'^\d{4}-\d{2}-\d{2}$',  # Dates like 2025-06-30
            r'^\d{4}$',              # Years like 2025
            r'^\d+$',                # Pure numbers
            r'^\d{1,2}/\d{1,2}/\d{4}$',  # Date formats like 6/30/2025
        ]
        
        # Specific abbreviations to exclude (but keep legitimate media companies)
        excluded_abbreviations = {
            'ASI', 'KEYT'  # These appear to be non-media abbreviations
        }
        
        sources = []
        for title in source_titles:
            if not title:
                continue
            
            title_lower = title.lower()
            
            # First check if title contains any excluded sources
            if any(excluded in title_lower for excluded in excluded_sources):
                print(f"Excluding filtered source from title: {title[:50]}...")
                continue
            
            if ' - ' in title:
                source = title.split(' - ')[-1].strip()
                # Check if source should be excluded
                if source.lower() not in excluded_sources:
                    sources.append(source)
                else:
                    print(f"Excluding filtered source: {source}")
            elif ' | ' in title:
                source = title.split(' | ')[-1].strip()
                # Check if source should be excluded
                if source.lower() not in excluded_sources:
                    sources.append(source)
                else:
                    print(f"Excluding filtered source: {source}")
            else:
                # If no clear separator, try to identify known sources
                known_sources = [
                    ('bbc', 'BBC'),
                    ('cnn', 'CNN'),
                    ('reuters', 'Reuters'),
                    ('bloomberg', 'Bloomberg'),
                    ('wall street journal', 'Wall Street Journal'),
                    ('wsj', 'Wall Street Journal'),
                    ('new york times', 'New York Times'),
                    ('washington post', 'Washington Post'),
                    ('politico', 'Politico'),
                    ('axios', 'Axios'),
                    ('associated press', 'Associated Press'),
                    ('ap news', 'Associated Press'),
                    ('npr', 'NPR'),
                    ('fox news', 'Fox News'),
                    ('abc news', 'ABC'),
                    ('cbs news', 'CBS'),
                    ('nbc news', 'NBC'),
                    ('usa today', 'USA Today'),
                    ('time', 'Time'),
                    ('newsweek', 'Newsweek'),
                    ('forbes', 'Forbes'),
                    ('business insider', 'Business Insider'),
                    ('cnbc', 'CNBC'),
                    ('marketwatch', 'MarketWatch'),
                    ('yahoo finance', 'Yahoo Finance'),
                    ('financial times', 'Financial Times'),
                    ('ft', 'Financial Times'),
                    ('the economist', 'The Economist'),
                    ('foreign policy', 'Foreign Policy'),
                    ('foreign affairs', 'Foreign Affairs'),
                    ('csis', 'CSIS'),
                    ('white & case', 'White & Case'),
                    ('white house', 'White House'),
                    ('us trade representative', 'US Trade Representative'),
                    ('department of commerce', 'Department of Commerce'),
                ]
                
                found_source = False
                for search_term, proper_name in known_sources:
                    if search_term in title_lower:
                        sources.append(proper_name)
                        found_source = True
                        break
                
                if not found_source:
                    # Check if it looks like an article title (not a source)
                    article_indicators = [
                        'how', 'what', 'when', 'where', 'why', 'analysis', 'report',
                        'update', 'breaking', 'latest', 'new', 'trump', 'biden'
                    ]
                    
                    is_likely_article = any(indicator in title_lower for indicator in article_indicators)
                    is_too_long = len(title) > 60  # Long titles are usually articles, not sources
                    
                    if not is_likely_article and not is_too_long:
                        print(f"Skipping unclear source: {title[:50]}...")
        
        # Filter out non-company names using regex patterns and specific exclusions
        filtered_sources = []
        for source in sources:
            is_non_company = False
            
            # Check regex patterns
            for pattern in non_company_patterns:
                if re.match(pattern, source):
                    print(f"Filtering out non-company name (pattern): {source}")
                    is_non_company = True
                    break
            
            # Check specific excluded abbreviations
            if not is_non_company and source in excluded_abbreviations:
                print(f"Filtering out non-company name (abbreviation): {source}")
                is_non_company = True
            
            if not is_non_company:
                filtered_sources.append(source)
        
        return filtered_sources
    
    def create_sources_list(self, gemini_data: Dict[str, Any]) -> List[str]:
        """Create clean list of source companies from gemini data"""
        all_source_names = set()
        
        # Extract from gemini_generated_updates
        updates = gemini_data.get('gemini_generated_updates', [])
        for update in updates:
            source_titles = update.get('source_titles', [])
            source_names = self.extract_source_names(source_titles)
            all_source_names.update(source_names)
        
        # Sort and return as list
        return sorted(list(all_source_names))
    
    def update_clean_data_with_sources(self):
        """Update the clean data file with proper sources list"""
        print("🔄 CREATING SOURCES LIST")
        print("=" * 50)
        
        # Load gemini data
        try:
            with open(self.gemini_file, 'r', encoding='utf-8') as f:
                gemini_data = json.load(f)
            print(f"✅ Loaded gemini data from: {self.gemini_file}")
        except FileNotFoundError:
            print(f"❌ Gemini file not found: {self.gemini_file}")
            return False
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing gemini JSON: {e}")
            return False
        
        # Load clean data
        try:
            with open(self.clean_file, 'r', encoding='utf-8') as f:
                clean_data = json.load(f)
            print(f"✅ Loaded clean data from: {self.clean_file}")
        except FileNotFoundError:
            print(f"❌ Clean file not found: {self.clean_file}")
            return False
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing clean JSON: {e}")
            return False
        
        # Create sources list
        print("\n📋 Creating sources list...")
        sources = self.create_sources_list(gemini_data)
        print(f"✅ Found {len(sources)} unique source companies")
        print(f"📊 Sources: {', '.join(sources)}")
        
        # Update clean data
        clean_data['sources'] = sources
        
        # Save updated clean data
        try:
            with open(self.clean_file, 'w', encoding='utf-8') as f:
                json.dump(clean_data, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Updated clean data with sources list")
            print(f"📊 Total sources: {len(sources)}")
            return True
        except Exception as e:
            print(f"❌ Error saving clean data: {e}")
            return False

def main():
    """Main function"""
    creator = SourcesListCreator()
    success = creator.update_clean_data_with_sources()
    
    if success:
        print("\n🎉 Sources list creation completed successfully!")
    else:
        print("\n💥 Sources list creation failed!")

if __name__ == "__main__":
    main()
