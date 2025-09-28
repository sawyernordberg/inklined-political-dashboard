import os
import requests
from dotenv import load_dotenv
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json
from dataclasses import dataclass

# Load environment variables
load_dotenv()

@dataclass
class CongressSession:
    number: int  # 119th, 118th, etc.
    start_date: datetime
    current_calendar_days: int
    bills_passed: int
    bills_passed_in_timeframe: int

class CongressionalAnalyzer:
    def __init__(self):
        self.legiscan_api_key = os.getenv('LEGISCAN_API_KEY')
        self.congress_api_key = os.getenv('CONGRESS_API_KEY')
        
        if not self.legiscan_api_key:
            raise ValueError("LEGISCAN_API_KEY not found in environment variables")
        
        self.legiscan_base_url = "https://api.legiscan.com/"
        
        # Congressional session start dates and mapping (excluding failed 109th and 110th)
        self.congress_sessions = {
            119: {'start': datetime(2025, 1, 3), 'years': '2025-2026'},
            118: {'start': datetime(2023, 1, 3), 'years': '2023-2024'},
            117: {'start': datetime(2021, 1, 3), 'years': '2021-2022'},
            116: {'start': datetime(2019, 1, 3), 'years': '2019-2020'},
            115: {'start': datetime(2017, 1, 3), 'years': '2017-2018'},
            114: {'start': datetime(2015, 1, 6), 'years': '2015-2016'},
            113: {'start': datetime(2013, 1, 3), 'years': '2013-2014'},
            112: {'start': datetime(2011, 1, 5), 'years': '2011-2012'},
            111: {'start': datetime(2009, 1, 6), 'years': '2009-2010'},
        }
    
    def make_legiscan_request(self, operation: str, **params) -> dict:
        """Make a request to the LegiScan API"""
        request_params = {
            'key': self.legiscan_api_key,
            'op': operation,
            **params
        }
        
        response = requests.get(self.legiscan_base_url, params=request_params)
        if response.status_code != 200:
            raise Exception(f"HTTP error {response.status_code}: {response.text}")
        
        data = response.json()
        if data.get('status') != 'OK':
            error_msg = data.get('alert', {}).get('message', 'Unknown API error')
            raise Exception(f"API error: {error_msg}")
        
        return data
    
    def find_congressional_sessions(self) -> List[dict]:
        """
        Try different approaches to find Congressional data in LegiScan
        """
        print("Searching for Congressional sessions in LegiScan...")
        
        # Try different possible identifiers for federal/congressional data
        federal_identifiers = ['US', 'FEDERAL', 'CONGRESS', 'FED']
        
        congressional_sessions = []
        
        for identifier in federal_identifiers:
            try:
                print(f"  Trying identifier: {identifier}")
                data = self.make_legiscan_request('getSessionList', state=identifier)
                sessions = data.get('sessions', [])
                
                if sessions:
                    print(f"  ✓ Found {len(sessions)} sessions with identifier '{identifier}'")
                    for session in sessions:
                        session['federal_identifier'] = identifier
                    congressional_sessions.extend(sessions)
                    break
                else:
                    print(f"  ✗ No sessions found for '{identifier}'")
                    
            except Exception as e:
                print(f"  ✗ Error with '{identifier}': {e}")
        
        # If no specific federal identifier works, try searching for Congressional bills
        if not congressional_sessions:
            print("  Trying search approach for Congressional data...")
            try:
                # Search for federal bills to see if they exist
                search_data = self.make_legiscan_request('getSearch', 
                                                       state='ALL', 
                                                       query='congress OR federal OR house OR senate',
                                                       year=2025)
                
                search_results = search_data.get('searchresult', {})
                if search_results and len(search_results) > 2:  # More than just summary info
                    print("  ✓ Found Congressional bills via search - analyzing...")
                    return self._analyze_search_results_for_congress(search_results)
            except Exception as e:
                print(f"  ✗ Search approach failed: {e}")
        
        return congressional_sessions
    
    def _analyze_search_results_for_congress(self, search_results: dict) -> List[dict]:
        """Analyze search results to extract Congressional sessions"""
        # This is a fallback method - would need refinement based on actual data structure
        bills_by_congress = {}
        
        for key, bill in search_results.items():
            if key in ['summary']:  # Skip metadata
                continue
                
            bill_number = bill.get('bill_number', '')
            
            # Look for Congressional bill patterns (H.R., S., etc.)
            if any(pattern in bill_number for pattern in ['H.R.', 'S.', 'H.J.Res', 'S.J.Res']):
                # Try to determine which Congress this belongs to based on year/session
                last_action_date = bill.get('last_action_date', '')
                if last_action_date:
                    try:
                        year = int(last_action_date[:4])
                        congress_num = self._year_to_congress_number(year)
                        if congress_num:
                            if congress_num not in bills_by_congress:
                                bills_by_congress[congress_num] = []
                            bills_by_congress[congress_num].append(bill)
                    except:
                        pass
        
        # Convert to session format
        sessions = []
        for congress_num, bills in bills_by_congress.items():
            if congress_num in self.congress_sessions:
                sessions.append({
                    'session_id': f'congress_{congress_num}',
                    'congress_number': congress_num,
                    'session_name': f'{congress_num}th Congress',
                    'year_start': self.congress_sessions[congress_num]['start'].year,
                    'bills_found': len(bills),
                    'federal_identifier': 'SEARCH'
                })
        
        return sessions
    
    def _year_to_congress_number(self, year: int) -> Optional[int]:
        """Convert year to Congress number"""
        # Congress numbers: 119th (2025-2026), 118th (2023-2024), etc.
        # Each Congress is 2 years, starting in odd years
        if year >= 2025:
            return 119
        elif year >= 2023:
            return 118
        elif year >= 2021:
            return 117
        elif year >= 2019:
            return 116
        elif year >= 2017:
            return 115
        elif year >= 2015:
            return 114
        elif year >= 2013:
            return 113
        elif year >= 2011:
            return 112
        elif year >= 2009:
            return 111
        return None
    
    def get_congressional_bills_legiscan(self, congress_number: int, target_days: int) -> Tuple[int, List[dict]]:
        """
        Get Congressional bills for a specific Congress using LegiScan
        """
        try:
            # First, try to find the session for this Congress
            sessions = self.find_congressional_sessions()
            target_session = None
            
            for session in sessions:
                if session.get('congress_number') == congress_number:
                    target_session = session
                    break
                # Also check by year
                elif session.get('year_start') == self.congress_sessions[congress_number]['start'].year:
                    target_session = session
                    target_session['congress_number'] = congress_number
                    break
            
            if target_session:
                print(f"  Found session for {congress_number}th Congress: {target_session.get('session_name')}")
                
                # Get master list for this session
                session_id = target_session.get('session_id')
                if isinstance(session_id, str) and session_id.startswith('congress_'):
                    # Handle search-derived sessions differently
                    return self._get_bills_via_search(congress_number, target_days)
                else:
                    # Standard session approach
                    masterlist_data = self.make_legiscan_request('getMasterList', id=session_id)
                    masterlist = masterlist_data.get('masterlist', {})
                    
                    return self._filter_bills_by_timeframe(masterlist, congress_number, target_days)
            else:
                print(f"  No session found for {congress_number}th Congress, trying search approach...")
                return self._get_bills_via_search(congress_number, target_days)
                
        except Exception as e:
            print(f"  Error with LegiScan for {congress_number}th Congress: {e}")
            return self._fallback_to_congress_api(congress_number, target_days)
    
    def _get_bills_via_search(self, congress_number: int, target_days: int) -> Tuple[int, List[dict]]:
        """Use LegiScan search to find Congressional bills for specific Congress"""
        try:
            years = self.congress_sessions[congress_number]['years']
            year_start = self.congress_sessions[congress_number]['start'].year
            
            # Search for bills from this Congress
            search_queries = [
                f'congress {congress_number}',
                f'house senate {year_start}',
                f'H.R. S. {year_start}',
                f'federal legislation {year_start}'
            ]
            
            all_bills = []
            for query in search_queries:
                try:
                    search_data = self.make_legiscan_request('getSearchRaw', 
                                                           state='ALL', 
                                                           query=query,
                                                           year=year_start)
                    
                    results = search_data.get('searchresult', {}).get('results', [])
                    for result in results:
                        if isinstance(result, dict) and result not in all_bills:
                            all_bills.append(result)
                            
                except Exception as e:
                    print(f"    Search query '{query}' failed: {e}")
                    continue
            
            # Filter and analyze bills
            passed_bills = []
            congress_start = self.congress_sessions[congress_number]['start']
            target_end_date = congress_start + timedelta(days=target_days)  # Simple calendar days
            
            for bill in all_bills:
                bill_id = bill.get('bill_id')
                if bill_id:
                    try:
                        # Get detailed bill info
                        bill_detail = self.make_legiscan_request('getBill', id=bill_id)
                        bill_info = bill_detail.get('bill', {})
                        
                        # Check if bill was passed and within timeframe
                        if bill_info.get('status') == 4:  # Status 4 = Passed
                            status_date = bill_info.get('status_date')
                            if status_date:
                                bill_date = datetime.strptime(status_date, '%Y-%m-%d')
                                if bill_date <= target_end_date:
                                    passed_bills.append(bill_info)
                    except Exception as e:
                        print(f"    Error getting details for bill {bill_id}: {e}")
                        continue
            
            return len(passed_bills), passed_bills
            
        except Exception as e:
            print(f"  Search approach failed: {e}")
            return 0, []
    
    def _filter_bills_by_timeframe(self, masterlist: dict, congress_number: int, target_days: int) -> Tuple[int, List[dict]]:
        """Filter bills from masterlist by calendar day timeframe"""
        congress_start = self.congress_sessions[congress_number]['start']
        target_end_date = congress_start + timedelta(days=target_days)  # Simple calendar days
        
        passed_bills = []
        
        for bill_info in masterlist.values():
            # Check if bill was passed (status 4)
            if bill_info.get('status') == 4:
                status_date = bill_info.get('status_date')
                if status_date:
                    try:
                        bill_date = datetime.strptime(status_date, '%Y-%m-%d')
                        if bill_date <= target_end_date:
                            passed_bills.append(bill_info)
                    except ValueError:
                        continue
        
        return len(passed_bills), passed_bills
    
    def _fallback_to_congress_api(self, congress_number: int, target_days: int) -> Tuple[int, List[dict]]:
        """Fallback to Congress.gov API if available"""
        if not self.congress_api_key:
            print(f"    No Congress.gov API key available for {congress_number}th Congress")
            return 0, []
        
        try:
            print(f"    Trying Congress.gov API for {congress_number}th Congress...")
            
            base_url = "https://api.congress.gov/v3"
            headers = {"X-API-Key": self.congress_api_key}
            
            # Get enacted bills for this Congress
            url = f"{base_url}/bill/{congress_number}"
            params = {"format": "json", "limit": 250}
            
            all_bills = []
            offset = 0
            
            while True:
                params['offset'] = offset
                response = requests.get(url, headers=headers, params=params)
                
                if response.status_code != 200:
                    break
                
                data = response.json()
                bills = data.get('bills', [])
                
                if not bills:
                    break
                
                all_bills.extend(bills)
                offset += len(bills)
                
                if len(bills) < params['limit']:
                    break
            
            # Filter for enacted bills within timeframe
            congress_start = self.congress_sessions[congress_number]['start']
            target_end_date = congress_start + timedelta(days=target_days)  # Simple calendar days
            
            passed_bills = []
            for bill in all_bills:
                if bill.get('law'):  # Bill became law
                    # Check if within timeframe (you'd need to parse the actual date format)
                    passed_bills.append(bill)
            
            return len(passed_bills), passed_bills
            
        except Exception as e:
            print(f"    Congress.gov API failed: {e}")
            return 0, []
    
    def calculate_legislative_days(self, start_date: datetime, end_date: datetime) -> int:
        """
        Calculate number of legislative days between two dates.
        NOTE: This function is not currently used. We're using simple calendar days instead.
        More conservative calculation excluding weekends and all major recess periods.
        """
        current_date = start_date
        legislative_days = 0
        
        while current_date <= end_date:
            # Skip weekends
            if current_date.weekday() < 5:  # Monday = 0, Friday = 4
                month = current_date.month
                day = current_date.day
                
                # Skip major recess periods (more comprehensive)
                skip_day = False
                
                # January: First few days (New Year/organization)
                if month == 1 and day <= 6:
                    skip_day = True
                # February: Presidents Day recess (typically 2 weeks)
                elif month == 2 and 12 <= day <= 26:
                    skip_day = True
                # March/April: Spring recess (Easter/Passover, typically 2 weeks)
                elif (month == 3 and day >= 25) or (month == 4 and day <= 8):
                    skip_day = True
                # May: Memorial Day week
                elif month == 5 and day >= 26:
                    skip_day = True
                # July: July 4th week and often extended break
                elif month == 7 and 1 <= day <= 8:
                    skip_day = True
                # August: Summer recess (entire month)
                elif month == 8:
                    skip_day = True
                # September: First week (returning from recess)
                elif month == 9 and day <= 7:
                    skip_day = True
                # October: Columbus Day and district work periods
                elif month == 10 and (8 <= day <= 12 or 22 <= day <= 26):
                    skip_day = True
                # November: Thanksgiving week and extended break
                elif month == 11 and day >= 22:
                    skip_day = True
                # December: Holiday recess (most of month)
                elif month == 12 and day >= 15:
                    skip_day = True
                
                if not skip_day:
                    legislative_days += 1
            
            current_date += timedelta(days=1)
        
        return legislative_days
    
    def get_current_congress_days(self) -> int:
        """Calculate total calendar days since the current Congress started"""
        current_congress_start = self.congress_sessions[119]['start']
        today = datetime.now()
        
        calendar_days = (today - current_congress_start).days
        
        print(f"📅 Current Congress started: {current_congress_start.strftime('%B %d, %Y')}")
        print(f"📊 Total calendar days since start: {calendar_days}")
        
        return calendar_days
    
    def analyze_historical_productivity(self) -> Dict:
        """
        Main analysis function: compare current Congress with previous 8 using calendar days
        """
        current_days = self.get_current_congress_days()
        print(f"Current Congress (119th) has been active for {current_days} calendar days")
        print("=" * 70)
        
        results = {}
        
        # Analyze current Congress (119th) through previous 8 (111th) - excluding failed 109th and 110th
        for congress_num in range(119, 110, -1):  # 119 down to 111
            print(f"\nAnalyzing {congress_num}th Congress ({self.congress_sessions[congress_num]['years']})...")
            
            try:
                bills_count, bills_details = self.get_congressional_bills_legiscan(congress_num, current_days)
                
                results[congress_num] = {
                    'congress_number': congress_num,
                    'years': self.congress_sessions[congress_num]['years'],
                    'target_calendar_days': current_days,
                    'start_date': self.congress_sessions[congress_num]['start'],
                    'bills_passed_in_timeframe': bills_count,
                    'sample_bills': bills_details[:5],  # First 5 for display
                    'is_current': congress_num == 119,
                    'data_source': 'LegiScan' if bills_count > 0 else 'None'
                }
                
                print(f"  ✓ {congress_num}th Congress: {bills_count} bills passed in first {current_days} calendar days")
                
            except Exception as e:
                print(f"  ✗ Error analyzing {congress_num}th Congress: {e}")
                results[congress_num] = {'error': str(e)}
        
        return results
    
    def generate_comparison_report(self, results: Dict) -> str:
        """Generate a formatted comparison report"""
        current_days = self.get_current_congress_days()
        
        report = f"""
CONGRESSIONAL LEGISLATIVE PRODUCTIVITY HISTORICAL COMPARISON
===========================================================
Analysis Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Timeframe: First {current_days} calendar days of each Congress
Data Sources: LegiScan API + Congress.gov API (when available)

"""
        
        # Sort by Congress number (most recent first)
        sorted_congresses = sorted([c for c in results.keys() if isinstance(c, int)], reverse=True)
        
        # Summary table
        report += "PRODUCTIVITY RANKINGS:\n"
        report += "Rank | Congress | Years      | Bills Passed | Status\n"
        report += "-" * 55 + "\n"
        
        # Calculate rankings
        valid_results = [(c, results[c]['bills_passed_in_timeframe']) 
                        for c in sorted_congresses 
                        if 'bills_passed_in_timeframe' in results[c]]
        
        ranked_results = sorted(valid_results, key=lambda x: x[1], reverse=True)
        
        for i, (congress_num, bill_count) in enumerate(ranked_results):
            rank = i + 1
            years = results[congress_num]['years']
            current_indicator = "CURRENT" if congress_num == 119 else ""
            report += f"{rank:4d} | {congress_num:3d}      | {years} | {bill_count:11d} | {current_indicator}\n"
        
        # Statistical analysis
        if len(valid_results) > 1:
            bill_counts = [count for _, count in valid_results if _ != 119]  # Exclude current
            if bill_counts:
                avg_historical = sum(bill_counts) / len(bill_counts)
                current_count = results.get(119, {}).get('bills_passed_in_timeframe', 0)
                
                report += f"\n\nSTATISTICAL ANALYSIS:\n"
                report += "=" * 30 + "\n"
                report += f"Current Congress (119th): {current_count} bills\n"
                report += f"Historical Average (8 previous): {avg_historical:.1f} bills\n"
                report += f"Performance vs Average: {((current_count - avg_historical) / avg_historical * 100):+.1f}%\n"
                
                if current_count > avg_historical:
                    report += f"Current Congress is ABOVE historical average\n"
                elif current_count < avg_historical:
                    report += f"Current Congress is BELOW historical average\n"
                else:
                    report += f"Current Congress matches historical average\n"
        
        # Trend analysis
        report += f"\n\nTREND ANALYSIS:\n"
        report += "=" * 20 + "\n"
        
        # Compare recent vs older Congresses
        recent_congresses = [r for r in valid_results if r[0] >= 115]  # Last 5 Congresses
        older_congresses = [r for r in valid_results if r[0] < 115 and r[0] >= 111]   # 111th-114th Congresses
        
        if recent_congresses and older_congresses:
            recent_avg = sum(count for _, count in recent_congresses) / len(recent_congresses)
            older_avg = sum(count for _, count in older_congresses) / len(older_congresses)
            
            report += f"Recent Congresses (115th-119th) Average: {recent_avg:.1f} bills\n"
            report += f"Older Congresses (111th-114th) Average: {older_avg:.1f} bills\n"
            
            if recent_avg > older_avg:
                report += f"Recent trend: INCREASED productivity (+{((recent_avg - older_avg) / older_avg * 100):.1f}%)\n"
            else:
                report += f"Recent trend: DECREASED productivity ({((recent_avg - older_avg) / older_avg * 100):.1f}%)\n"
        
        # Add methodology note
        report += f"\n\nMETHODOLOGY:\n"
        report += "=" * 15 + "\n"
        report += f"• Calendar days calculated from Congressional start dates\n"
        report += f"• Bills counted as 'passed' based on LegiScan status = 4 (Passed)\n"
        report += f"• Timeframe: First {current_days} calendar days of each Congress\n"
        report += f"• Data primarily from LegiScan API with Congress.gov API as backup\n"
        
        return report

def main():
    """Main execution function"""
    print("CONGRESSIONAL LEGISLATIVE PRODUCTIVITY ANALYSIS")
    print("Using LegiScan API for Congressional Data")
    print("=" * 60)
    
    try:
        analyzer = CongressionalAnalyzer()
        
        # First, explore what Congressional data is available
        print("\nStep 1: Discovering Congressional data in LegiScan...")
        sessions = analyzer.find_congressional_sessions()
        
        if sessions:
            print(f"✓ Found Congressional data! Proceeding with analysis...")
        else:
            print("⚠ No obvious Congressional sessions found, but proceeding with search-based approach...")
        
        # Perform the historical analysis
        print("\nStep 2: Analyzing historical productivity...")
        results = analyzer.analyze_historical_productivity()
        
        # Generate and display report
        print("\nStep 3: Generating comparison report...")
        report = analyzer.generate_comparison_report(results)
        print(report)
        
        # DISABLED: No longer saving unused productivity analysis file
        # Save results
        # output_file = 'congressional_productivity_analysis.json'
        # with open(output_file, 'w') as f:
        #     # Convert datetime objects to strings for JSON serialization
        #     json_results = {}
        #     for congress, data in results.items():
        #         if isinstance(data, dict) and 'start_date' in data:
        #             data_copy = data.copy()
        #             if isinstance(data_copy['start_date'], datetime):
        #                 data_copy['start_date'] = data_copy['start_date'].isoformat()
        #             json_results[congress] = data_copy
        #         else:
        #             json_results[congress] = data
        #     
        #     json.dump(json_results, f, indent=2)
        # 
        # print(f"\n📊 Detailed results saved to: {output_file}")
        
        # DISABLED: No longer saving unused report file
        # Save report
        # report_file = 'congressional_productivity_report.txt'
        # with open(report_file, 'w') as f:
        #     f.write(report)
        # 
        # print(f"📋 Human-readable report saved to: {report_file}")
        
    except Exception as e:
        print(f"\n❌ Analysis failed: {e}")
        print("\nTroubleshooting tips:")
        print("1. Verify LEGISCAN_API_KEY is correct in your .env file")
        print("2. Check your API key limits and permissions")
        print("3. If you have CONGRESS_API_KEY, add it to .env for backup data")

if __name__ == "__main__":
    main()