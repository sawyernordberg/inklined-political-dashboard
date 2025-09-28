#!/usr/bin/env python3
"""
Script to create a condensed version of the foreign affairs data file.
This removes all unused data fields to reduce file size for the frontend.
"""

import json
import os
from pathlib import Path

def create_condensed_foreign_affairs():
    """Create condensed version of foreign affairs data."""
    
    print("📂 Creating condensed foreign affairs data file...")
    
    # Get paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    public_data_dir = project_root / "public" / "data"
    
    source_file = public_data_dir / "enhanced_foreign_affairs_data_detailed.json"
    target_file = public_data_dir / "foreign_affairs_data_condensed.json"
    
    # Check if source file exists
    if not source_file.exists():
        print(f"❌ Source file not found: {source_file}")
        return False
    
    # Load the full data
    print(f"📖 Loading data from: {source_file}")
    with open(source_file, 'r', encoding='utf-8') as f:
        full_data = json.load(f)
    
    # Create condensed structure
    condensed_data = {
        "metadata": {
            "last_overview_update": full_data["metadata"]["last_overview_update"],
            "research_tools": full_data["metadata"]["research_tools"]
        },
        "bilateral_relations": {}
    }
    
    # Process each country
    for country_code, country_data in full_data["bilateral_relations"].items():
        condensed_data["bilateral_relations"][country_code] = {
            "country_name": country_data["country_name"],
            "economic_ties": country_data["economic_ties"],
            "military_cooperation": country_data["military_cooperation"],
            "diplomatic_status": country_data["diplomatic_status"],
            "key_issues": country_data["key_issues"],
            "detailed_relationship_summary": country_data["detailed_relationship_summary"],
            "economic_cooperation": {
                "trade_volume_estimate": country_data["economic_cooperation"]["trade_volume_estimate"]
            }
        }
    
    # Save condensed data
    print(f"💾 Saving condensed data to: {target_file}")
    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(condensed_data, f, indent=2, ensure_ascii=False)
    
    # Calculate size reduction
    source_size = source_file.stat().st_size
    target_size = target_file.stat().st_size
    reduction_percent = ((source_size - target_size) / source_size) * 100
    
    print(f"✅ Condensed file created successfully!")
    print(f"📊 File size reduction: {source_size:,} bytes → {target_size:,} bytes ({reduction_percent:.1f}% smaller)")
    print(f"📁 Condensed file: {target_file}")
    
    return True

if __name__ == "__main__":
    create_condensed_foreign_affairs()
