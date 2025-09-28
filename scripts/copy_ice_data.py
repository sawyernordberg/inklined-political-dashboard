#!/usr/bin/env python3
"""
Script to copy ICE detention data from scraper location to public data directory
This ensures the web interface can access the latest data
"""

import shutil
import os
import json
from pathlib import Path

def copy_ice_data():
    """Copy ICE detention data to public data directory"""
    
    # Define paths
    script_dir = Path(__file__).parent
    scraper_data_path = script_dir / "trump_admin" / "immigration_enforcement" / "data" / "ice_detention_data.json"
    public_data_dir = script_dir.parent / "public" / "data"
    public_ice_data_path = public_data_dir / "ice_detention_data.json"
    
    print(f"Source: {scraper_data_path}")
    print(f"Destination: {public_ice_data_path}")
    
    # Check if source file exists
    if not scraper_data_path.exists():
        print(f"❌ Source file not found: {scraper_data_path}")
        print("Please run the ICE scraper first:")
        print("cd scripts/trump_admin/immigration_enforcement")
        print("python3 -m ice_detention_data_processor")
        return False
    
    # Create public data directory if it doesn't exist
    public_data_dir.mkdir(parents=True, exist_ok=True)
    
    try:
        # Copy the file
        shutil.copy2(scraper_data_path, public_ice_data_path)
        print(f"✅ Successfully copied ICE data to {public_ice_data_path}")
        
        # Verify the copy
        if public_ice_data_path.exists():
            source_size = scraper_data_path.stat().st_size
            dest_size = public_ice_data_path.stat().st_size
            print(f"Source file size: {source_size:,} bytes")
            print(f"Copied file size: {dest_size:,} bytes")
            
            if source_size == dest_size:
                print("✅ File copy verified successfully")
                return True
            else:
                print("❌ File sizes don't match - copy may be incomplete")
                return False
        else:
            print("❌ Destination file not found after copy")
            return False
            
    except Exception as e:
        print(f"❌ Error copying file: {e}")
        return False

def main():
    """Main function"""
    print("ICE Data Copy Script")
    print("=" * 30)
    
    success = copy_ice_data()
    
    if success:
        print("\n🎉 ICE data successfully copied to public directory!")
        print("The immigration dashboard should now be able to access the latest data.")
    else:
        print("\n💥 Failed to copy ICE data.")
        print("Please check the error messages above.")

if __name__ == "__main__":
    main()
