#!/usr/bin/env python3
"""
Script to update all overview fields using AI with Google Search.
This script uses the same AI system as affairs_ai.py to generate fresh, current overviews.
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, Any, List
import re

# Import the AI system from affairs_ai.py
from affairs_ai import ForeignAffairsEnhancer, load_api_keys_from_env

def update_overview_fields_with_ai():
    """Update all overview fields using AI with Google Search."""
    
    print("🤖 Initializing AI system for overview generation...")
    
    # Load API keys
    api_keys = load_api_keys_from_env()
    if not api_keys:
        print("❌ No API keys found! Please set GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc. in your environment.")
        return
    
    # Initialize the AI enhancer
    enhancer = ForeignAffairsEnhancer(api_keys)
    
    # Load the current data
    print("📂 Loading current data...")
    
    # First try to load from public/data directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(script_dir, '..', '..')
    public_data_dir = os.path.join(project_root, 'public', 'data')
    public_file = os.path.join(public_data_dir, 'enhanced_foreign_affairs_data_detailed.json')
    
    if os.path.exists(public_file):
        with open(public_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("✅ Loaded data from public/data directory")
    else:
        # Fallback to local directory
        with open('enhanced_foreign_affairs_data_detailed.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        print("✅ Loaded data from local directory")
    
    # Load source data for context
    source_data = enhancer.load_source_data()
    
    print(f"🔄 Updating overview fields using AI with Google Search...")
    
    # Update country overviews
    if 'enhanced_bilateral_relations' in data:
        for country_code, country_data in data['enhanced_bilateral_relations'].items():
            country_name = country_data.get('country_name', country_code)
            print(f"\n📝 Generating AI overview for {country_name}...")
            
            try:
                # Use the AI system to generate a fresh overview
                enhanced_country = enhancer.enhance_country_full(country_code, country_data, country_name, source_data)
                
                # Update only the overview field
                if 'detailed_relationship_summary' in enhanced_country:
                    old_summary = country_data.get('detailed_relationship_summary', '')
                    new_summary = enhanced_country['detailed_relationship_summary']
                    
                    if new_summary and new_summary != old_summary:
                        country_data['detailed_relationship_summary'] = new_summary
                        print(f"✅ Updated overview for {country_name}")
                    else:
                        print(f"⚠️ No changes for {country_name}")
                
            except Exception as e:
                print(f"❌ Error updating {country_name}: {e}")
    
    # Update regional overviews
    if 'enhanced_regional_analysis' in data:
        for region_key, region_data in data['enhanced_regional_analysis'].items():
            region_name = region_data.get('region_name', region_key)
            print(f"\n🌍 Generating AI overview for {region_name}...")
            
            try:
                # Get diplomatic context for the region
                diplomatic_context = enhancer.get_regional_diplomatic_feeds_context(source_data, region_name)
                
                # Get bilateral context for countries in this region
                regional_countries = []
                if 'enhanced_bilateral_relations' in data:
                    for country_code, country_data in data['enhanced_bilateral_relations'].items():
                        if country_data.get('region') == region_name:
                            regional_countries.append(country_data)
                
                bilateral_context = enhancer.get_regional_bilateral_context(data.get('enhanced_regional_analysis', {}), regional_countries)
                
                # Use the AI system to generate a fresh regional overview
                enhanced_region = enhancer.enhance_region_full(region_name, region_data, diplomatic_context, bilateral_context)
                
                # Update only the overview field
                if 'comprehensive_regional_overview' in enhanced_region:
                    old_overview = region_data.get('comprehensive_regional_overview', '')
                    new_overview = enhanced_region['comprehensive_regional_overview']
                    
                    if new_overview and new_overview != old_overview:
                        region_data['comprehensive_regional_overview'] = new_overview
                        print(f"✅ Updated overview for {region_name}")
                    else:
                        print(f"⚠️ No changes for {region_name}")
                
            except Exception as e:
                print(f"❌ Error updating {region_name}: {e}")
    
    # Update metadata
    if 'metadata' in data:
        data['metadata']['last_overview_update'] = datetime.now().isoformat()
        data['metadata']['overview_update_note'] = "Overview fields updated via AI with Google Search"
    
    # Save the updated data
    print(f"\n💾 Saving updated data...")
    
    # Save to public/data directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(script_dir, '..', '..')
    public_data_dir = os.path.join(project_root, 'public', 'data')
    
    # Create the directory if it doesn't exist
    os.makedirs(public_data_dir, exist_ok=True)
    
    public_file = os.path.join(public_data_dir, 'enhanced_foreign_affairs_data_detailed.json')
    with open(public_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Data saved to: {public_file}")
    
    # Also save to local directory for backward compatibility
    with open('enhanced_foreign_affairs_data_detailed.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Data also saved locally")
    
    # Create condensed version for frontend
    print(f"\n🔄 Creating condensed version for frontend...")
    try:
        import sys
        sys.path.append(os.path.join(script_dir, '..'))
        from create_condensed_foreign_affairs import create_condensed_foreign_affairs
        create_condensed_foreign_affairs()
    except Exception as e:
        print(f"⚠️  Warning: Could not create condensed version: {e}")
    
    print(f"\n✅ Successfully updated all overview fields using AI!")
    print(f"🤖 AI system used: Google Gemini 2.0 Flash with Google Search")
    print(f"📁 File updated: enhanced_foreign_affairs_data_detailed.json")
    print(f"📁 Condensed file: foreign_affairs_data_condensed.json")
    print(f"🕒 Update timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"\n💡 The AI has generated fresh, current overviews using real-time information from trustworthy sources.")

if __name__ == "__main__":
    update_overview_fields_with_ai() 