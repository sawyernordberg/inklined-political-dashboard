#!/usr/bin/env python3
"""
Master Script to Update All Data Files
Runs all Python scripts in the correct order to update JSON data files.

Dependencies handled:
1. tariff.py must run before eco1.py (eco1.py reads tariff_data_clean.json)
2. All scripts can run independently except for the above dependency
3. tariff_merger.py and update_overviews.py are run manually by user (exempt from automated updates)
"""

import subprocess
import sys
import os
import time
from datetime import datetime
from pathlib import Path

class DataUpdater:
    def __init__(self):
        self.script_dir = Path(__file__).parent
        self.scripts_dir = self.script_dir / "scripts"
        self.public_data_dir = self.script_dir / "public" / "data"
        
        # Ensure public/data directory exists
        self.public_data_dir.mkdir(parents=True, exist_ok=True)
        
        self.start_time = datetime.now()
        self.results = {}
        
    def log(self, message, level="INFO"):
        """Log messages with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def run_script(self, script_path, description, timeout=1800):
        """Run a Python script and return success status"""
        self.log(f"Starting: {description}")
        self.log(f"Script: {script_path}")
        
        try:
            # Change to the script's directory
            script_dir = script_path.parent
            script_name = script_path.name
            
            # Run the script
            result = subprocess.run(
                [sys.executable, script_name],
                cwd=script_dir,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            if result.returncode == 0:
                self.log(f"✅ SUCCESS: {description}", "SUCCESS")
                self.results[description] = "SUCCESS"
                return True
            else:
                self.log(f"❌ FAILED: {description}", "ERROR")
                self.log(f"Error output: {result.stderr}", "ERROR")
                self.results[description] = f"FAILED: {result.stderr}"
                return False
                
        except subprocess.TimeoutExpired:
            self.log(f"⏰ TIMEOUT: {description} (>{timeout}s)", "ERROR")
            self.results[description] = "TIMEOUT"
            return False
        except Exception as e:
            self.log(f"💥 EXCEPTION: {description} - {str(e)}", "ERROR")
            self.results[description] = f"EXCEPTION: {str(e)}"
            return False
    
    def check_file_exists(self, file_path, description):
        """Check if a required file exists"""
        if file_path.exists():
            self.log(f"✅ Found: {description}")
            return True
        else:
            self.log(f"❌ Missing: {description}", "ERROR")
            return False
    
    def run_independent_scripts(self):
        """Run scripts that have no dependencies"""
        self.log("=" * 60)
        self.log("PHASE 1: Independent Scripts", "PHASE")
        self.log("=" * 60)
        
        independent_scripts = [
            {
                "path": self.scripts_dir / "fred_federal_employees_fetcher.py",
                "description": "Federal Employees Data (FRED API)"
            },
            {
                "path": self.scripts_dir / "polling_scraper.py", 
                "description": "Legal Polling Data"
            },
            {
                "path": self.scripts_dir / "congress" / "congressional_data_analyzer.py",
                "description": "Congressional Analysis"
            },
            {
                "path": self.scripts_dir / "trump_admin" / "immigration_enforcement" / "cbp_scraper.py",
                "description": "CBP Apprehensions Data"
            },
            {
                "path": self.scripts_dir / "trump_admin" / "immigration_enforcement" / "ice_detention_data_processor.py",
                "description": "ICE Detention Data"
            },
            {
                "path": self.scripts_dir / "foreign_affairs" / "foreign_affairs_data_collector.py",
                "description": "Foreign Affairs Data Collection"
            }
        ]
        
        for script in independent_scripts:
            if script["path"].exists():
                self.run_script(script["path"], script["description"])
            else:
                self.log(f"⚠️ Script not found: {script['path']}", "WARNING")
                self.results[script["description"]] = "SCRIPT_NOT_FOUND"
    
    def run_economic_scripts(self):
        """Run economic scripts in dependency order"""
        self.log("=" * 60)
        self.log("PHASE 2: Economic Scripts (with dependencies)", "PHASE")
        self.log("=" * 60)
        
        # Step 1: Run tariff.py first
        tariff_script = self.scripts_dir / "trump_admin" / "economic_policy" / "tariff.py"
        if tariff_script.exists():
            success = self.run_script(tariff_script, "Tariff Data Collection")
            if not success:
                self.log("❌ Tariff script failed - skipping dependent scripts", "ERROR")
                return
        else:
            self.log("⚠️ Tariff script not found - skipping economic scripts", "WARNING")
            return
        
        # Step 2: Run eco1.py (depends on tariff_data_clean.json)
        eco1_script = self.scripts_dir / "trump_admin" / "economic_policy" / "eco1.py"
        if eco1_script.exists():
            success = self.run_script(eco1_script, "Economic Dashboard Integration")
            if not success:
                self.log("❌ Economic integration failed - skipping tariff merger", "ERROR")
                return
        else:
            self.log("⚠️ Economic integration script not found", "WARNING")
            return
        
        # Note: tariff_merger.py is run manually by user (exempt from automated updates)
    
    def run_foreign_affairs_enhancement(self):
        """Run foreign affairs enhancement (depends on foreign_affairs_data_collector.py)"""
        self.log("=" * 60)
        self.log("PHASE 3: Foreign Affairs Enhancement", "PHASE")
        self.log("=" * 60)
        
        # Check if base data exists
        base_data_file = self.public_data_dir / "enhanced_foreign_affairs_data_detailed.json"
        if not base_data_file.exists():
            self.log("⚠️ Foreign affairs base data not found - skipping enhancement", "WARNING")
            return
        
        # Note: update_overviews.py is run manually by user (exempt from automated updates)
    
    def verify_output_files(self):
        """Verify that all expected output files exist"""
        self.log("=" * 60)
        self.log("PHASE 4: Verification", "PHASE")
        self.log("=" * 60)
        
        expected_files = [
            ("cbp_apprehensions_data.json", "CBP Apprehensions Data"),
            ("congressional_analysis.json", "Congressional Analysis"),
            ("enhanced_foreign_affairs_data_detailed.json", "Foreign Affairs Data (Full)"),
            ("foreign_affairs_data_condensed.json", "Foreign Affairs Data (Condensed)"),
            ("federal_employees_data.json", "Federal Employees Data"),
            ("gemini_tariff_analysis.json", "Gemini Tariff Analysis"),
            ("ice_detention_data.json", "ICE Detention Data"),
            ("integrated_economic_dashboard.json", "Economic Dashboard"),
            ("legal_polling_data.json", "Legal Polling Data"),
            ("presidential_sp500_comparison.json", "Presidential Stock Data"),
            ("promises.json", "Campaign Promises"),
            ("tariff_data_clean.json", "Tariff Data")
        ]
        
        all_files_exist = True
        for filename, description in expected_files:
            file_path = self.public_data_dir / filename
            if not self.check_file_exists(file_path, description):
                all_files_exist = False
        
        if all_files_exist:
            self.log("✅ All expected data files are present!", "SUCCESS")
        else:
            self.log("⚠️ Some data files are missing", "WARNING")
        
        return all_files_exist
    
    def print_summary(self):
        """Print a summary of all results"""
        self.log("=" * 60)
        self.log("FINAL SUMMARY", "SUMMARY")
        self.log("=" * 60)
        
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        self.log(f"Total execution time: {duration}")
        self.log(f"Scripts executed: {len(self.results)}")
        
        success_count = sum(1 for result in self.results.values() if result == "SUCCESS")
        self.log(f"Successful: {success_count}")
        self.log(f"Failed: {len(self.results) - success_count}")
        
        self.log("\nDetailed Results:")
        for description, result in self.results.items():
            status_icon = "✅" if result == "SUCCESS" else "❌"
            self.log(f"  {status_icon} {description}: {result}")
        
        if success_count == len(self.results):
            self.log("\n🎉 ALL SCRIPTS COMPLETED SUCCESSFULLY!", "SUCCESS")
        else:
            self.log(f"\n⚠️ {len(self.results) - success_count} script(s) failed", "WARNING")
    
    def run_all(self):
        """Run all data update scripts in the correct order"""
        self.log("🚀 STARTING COMPREHENSIVE DATA UPDATE", "START")
        self.log(f"Start time: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        self.log(f"Working directory: {self.script_dir}")
        self.log(f"Scripts directory: {self.scripts_dir}")
        self.log(f"Output directory: {self.public_data_dir}")
        
        try:
            # Phase 1: Run independent scripts
            self.run_independent_scripts()
            
            # Phase 2: Run economic scripts with dependencies
            self.run_economic_scripts()
            
            # Phase 3: Run foreign affairs enhancement
            self.run_foreign_affairs_enhancement()
            
            # Phase 4: Verify output files
            self.verify_output_files()
            
        except KeyboardInterrupt:
            self.log("🛑 Process interrupted by user", "INTERRUPTED")
        except Exception as e:
            self.log(f"💥 Unexpected error: {str(e)}", "ERROR")
        finally:
            # Always print summary
            self.print_summary()

def main():
    """Main function"""
    print("🎯 POLITICAL DASHBOARD DATA UPDATER")
    print("=" * 50)
    print("This script will update all JSON data files by running")
    print("all Python scripts in the correct dependency order.")
    print("=" * 50)
    
    updater = DataUpdater()
    updater.run_all()

if __name__ == "__main__":
    main()
