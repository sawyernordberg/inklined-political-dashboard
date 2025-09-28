#!/usr/bin/env python3
"""
Tariff Update Merger
Merges tariff updates from gemini_tariff_analysis.json into tariff_data_clean.json
Avoids duplicates and creates a clean sources list
"""

import json
import os
import re
from datetime import datetime
from typing import Dict, List, Any, Set

class TariffUpdateMerger:
    """Merges tariff updates while avoiding duplicates and creating clean sources list"""
    
    def __init__(self):
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.join(self.script_dir, '..', '..', '..')
        self.public_data_dir = os.path.join(self.project_root, 'public', 'data')
        
        # File paths
        self.gemini_file = os.path.join(self.public_data_dir, 'gemini_tariff_analysis.json')
        self.clean_file = os.path.join(self.public_data_dir, 'tariff_data_clean.json')
        self.output_file = os.path.join(self.public_data_dir, 'tariff_data_clean.json')
        
    def load_json_file(self, filepath: str) -> Dict[str, Any]:
        """Load JSON file with error handling"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ File not found: {filepath}")
            return {}
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON from {filepath}: {e}")
            return {}
    
    def save_json_file(self, data: Dict[str, Any], filepath: str) -> bool:
        """Save JSON file with error handling"""
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"❌ Error saving JSON to {filepath}: {e}")
            return False
    
    def extract_source_company(self, source_title: str) -> str:
        """Extract company name from source title (e.g., 'BBC News' -> 'BBC')"""
        if not source_title:
            return ""
        
        # Known media companies and their patterns
        known_companies = {
            'bbc': 'BBC',
            'cnn': 'CNN',
            'reuters': 'Reuters',
            'bloomberg': 'Bloomberg',
            'wall street journal': 'Wall Street Journal',
            'wsj': 'Wall Street Journal',
            'new york times': 'New York Times',
            'washington post': 'Washington Post',
            'politico': 'Politico',
            'axios': 'Axios',
            'associated press': 'Associated Press',
            'ap news': 'Associated Press',
            'npr': 'NPR',
            'fox news': 'Fox News',
            'abc news': 'ABC',
            'cbs news': 'CBS',
            'nbc news': 'NBC',
            'usa today': 'USA Today',
            'time': 'Time',
            'newsweek': 'Newsweek',
            'forbes': 'Forbes',
            'business insider': 'Business Insider',
            'cnbc': 'CNBC',
            'marketwatch': 'MarketWatch',
            'yahoo finance': 'Yahoo Finance',
            'financial times': 'Financial Times',
            'ft': 'Financial Times',
            'the economist': 'The Economist',
            'foreign policy': 'Foreign Policy',
            'foreign affairs': 'Foreign Affairs',
            'csis': 'CSIS',
            'white & case': 'White & Case',
            'pwc': 'PwC',
            'mckinsey': 'McKinsey',
            'deloitte': 'Deloitte',
            'kpmg': 'KPMG',
            'ernst & young': 'Ernst & Young',
            'ey': 'Ernst & Young',
        }
        
        title_lower = source_title.lower()
        
        # Check for known companies first
        for pattern, company in known_companies.items():
            if pattern in title_lower:
                return company
        
        # Skip unwanted sources
        unwanted = ['wikipedia', 'wikimedia', 'reddit', 'twitter', 'facebook', 'instagram', 'youtube', 'tiktok']
        for unwanted_source in unwanted:
            if unwanted_source in title_lower:
                return ""
        
        # Try to extract from common patterns
        # Look for patterns like "Company Name - Article Title"
        if ' - ' in source_title:
            company_part = source_title.split(' - ')[0].strip()
            # Remove common suffixes
            company_part = re.sub(r'\s+(News|Media|Press|Times|Post|Journal)$', '', company_part, flags=re.IGNORECASE)
            if len(company_part) > 2 and not any(word in company_part.lower() for word in ['how', 'what', 'when', 'where', 'why', 'the', 'a', 'an']):
                return company_part
        
        # Look for patterns like "Article Title | Company Name"
        if ' | ' in source_title:
            parts = source_title.split(' | ')
            if len(parts) > 1:
                company_part = parts[-1].strip()
                if len(company_part) > 2:
                    return company_part
        
        # If nothing else works, return empty string
        return ""
    
    def create_sources_list(self, gemini_data: Dict[str, Any]) -> List[str]:
        """Create clean list of source companies from gemini data"""
        sources_set: Set[str] = set()
        
        # Extract from gemini_generated_updates
        updates = gemini_data.get('gemini_generated_updates', [])
        for update in updates:
            source_titles = update.get('source_titles', [])
            for source_title in source_titles:
                company = self.extract_source_company(source_title)
                if company:
                    sources_set.add(company)
        
        # Sort and return as list
        return sorted(list(sources_set))
    
    def normalize_update(self, update: Dict[str, Any]) -> str:
        """Create a normalized string for duplicate detection"""
        title = update.get('title', '').lower().strip()
        description = update.get('description', '').lower().strip()
        announcement_date = update.get('announcement_date', '')
        
        # Use title + date as primary key for deduplication
        return f"{title}|{announcement_date}"
    
    def merge_updates(self, clean_data: Dict[str, Any], gemini_data: Dict[str, Any]) -> Dict[str, Any]:
        """Merge updates from gemini data into clean data, avoiding duplicates"""
        
        # Get existing updates from clean data
        existing_updates = clean_data.get('updates', [])
        existing_normalized = set()
        
        # Create set of existing update keys
        for update in existing_updates:
            normalized = self.normalize_update(update)
            existing_normalized.add(normalized)
        
        # Get new updates from gemini data
        gemini_updates = gemini_data.get('gemini_generated_updates', [])
        new_updates = []
        
        print(f"📊 Found {len(existing_updates)} existing updates in clean data")
        print(f"📊 Found {len(gemini_updates)} updates in gemini data")
        
        # Check each gemini update for duplicates
        for update in gemini_updates:
            normalized = self.normalize_update(update)
            if normalized not in existing_normalized:
                new_updates.append(update)
                existing_normalized.add(normalized)
        
        print(f"✅ Adding {len(new_updates)} new updates (avoided {len(gemini_updates) - len(new_updates)} duplicates)")
        
        # Merge updates
        all_updates = existing_updates + new_updates
        
        # Sort by announcement date (newest first)
        all_updates.sort(key=lambda x: x.get('announcement_date', ''), reverse=True)
        
        # Update clean data
        clean_data['updates'] = all_updates
        clean_data['last_updated'] = datetime.now().strftime('%Y-%m-%d')
        
        return clean_data
    
    def run_merge(self):
        """Main method to run the merge process"""
        print("🔄 TARIFF UPDATE MERGER")
        print("=" * 50)
        
        # Load data files
        print("📂 Loading data files...")
        gemini_data = self.load_json_file(self.gemini_file)
        clean_data = self.load_json_file(self.clean_file)
        
        if not gemini_data:
            print("❌ No gemini data found. Exiting.")
            return False
        
        if not clean_data:
            print("❌ No clean data found. Exiting.")
            return False
        
        print(f"✅ Loaded gemini data from: {self.gemini_file}")
        print(f"✅ Loaded clean data from: {self.clean_file}")
        
        # Create sources list
        print("\n📋 Creating sources list...")
        sources = self.create_sources_list(gemini_data)
        print(f"✅ Found {len(sources)} unique source companies: {', '.join(sources)}")
        
        # Update clean data with sources
        clean_data['sources'] = sources
        
        # Merge updates
        print("\n🔄 Merging updates...")
        updated_clean_data = self.merge_updates(clean_data, gemini_data)
        
        # Save updated data
        print(f"\n💾 Saving updated data to: {self.output_file}")
        if self.save_json_file(updated_clean_data, self.output_file):
            print("✅ Successfully merged tariff updates!")
            print(f"📊 Total updates: {len(updated_clean_data.get('updates', []))}")
            print(f"📊 Total sources: {len(updated_clean_data.get('sources', []))}")
            print(f"📊 Sources: {', '.join(updated_clean_data.get('sources', []))}")
            return True
        else:
            print("❌ Failed to save updated data")
            return False

def main():
    """Main function"""
    merger = TariffUpdateMerger()
    success = merger.run_merge()
    
    if success:
        print("\n🎉 Tariff update merge completed successfully!")
    else:
        print("\n💥 Tariff update merge failed!")

if __name__ == "__main__":
    main()
