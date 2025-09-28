#!/usr/bin/env python3
"""
Quick Data Update Script
Runs only the most essential scripts for quick updates.
Use this for regular updates when you don't need to run everything.
"""

import subprocess
import sys
import os
from datetime import datetime
from pathlib import Path

def run_script(script_path, description):
    """Run a Python script"""
    print(f"🔄 Running: {description}")
    
    try:
        script_dir = script_path.parent
        script_name = script_path.name
        
        result = subprocess.run(
            [sys.executable, script_name],
            cwd=script_dir,
            capture_output=True,
            text=True,
            timeout=600  # 10 minute timeout
        )
        
        if result.returncode == 0:
            print(f"✅ SUCCESS: {description}")
            return True
        else:
            print(f"❌ FAILED: {description}")
            print(f"Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"💥 ERROR: {description} - {str(e)}")
        return False

def main():
    """Run quick update scripts"""
    print("⚡ QUICK DATA UPDATE")
    print("=" * 30)
    print(f"Started at: {datetime.now().strftime('%H:%M:%S')}")
    
    script_dir = Path(__file__).parent
    scripts_dir = script_dir / "scripts"
    
    # Essential scripts for quick updates
    quick_scripts = [
        {
            "path": scripts_dir / "polling_scraper.py",
            "description": "Polling Data"
        },
        {
            "path": scripts_dir / "trump_admin" / "immigration_enforcement" / "ice_detention_data_processor.py",
            "description": "ICE Detention Data"
        },
        {
            "path": scripts_dir / "trump_admin" / "economic_policy" / "tariff.py",
            "description": "Tariff Data"
        }
    ]
    
    success_count = 0
    for script in quick_scripts:
        if script["path"].exists():
            if run_script(script["path"], script["description"]):
                success_count += 1
        else:
            print(f"⚠️ Script not found: {script['path']}")
    
    print(f"\n✅ Completed: {success_count}/{len(quick_scripts)} scripts")
    print(f"Finished at: {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    main()
