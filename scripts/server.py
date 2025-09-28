#!/usr/bin/env python3
"""
Unified HTTP Server for Trump Administration Dashboards
Serves all three dashboards: Immigration Enforcement, Promises Tracker, and Economic Policy
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path
import argparse

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # Custom logging to show cleaner messages
        return

def serve_dashboard(dashboard_name=None, port=PORT, open_browser=True):
    """Serve a specific dashboard or show the main menu"""
    
    # Dashboard configurations
    dashboards = {
        'immigration': {
            'name': 'ICE Detention Dashboard',
            'path': 'trump_admin/immigration_enforcement',
            'file': 'ice_detention_dashboard.html',
            'description': 'Immigration and Customs Enforcement detention statistics'
        },
        'promises': {
            'name': 'Campaign Promises Tracker',
            'path': 'trump_admin/promises_tracker',
            'file': 'promises_tracker_dashboard.html',
            'description': 'Track Trump\'s 2024 campaign promises'
        },
        'economic': {
            'name': 'Economic Policy Dashboard',
            'path': 'trump_admin/economic_policy',
            'file': 'economic_policy_dashboard.html',
            'description': 'Economic indicators, tariffs, and market performance'
        },
        'cuts': {
            'name': 'Federal Cuts Tracker',
            'path': 'trump_admin/cuts',
            'file': 'federal_cuts_tracker.html',
            'description': 'Federal budget cuts, workforce reductions, and program eliminations'
        },
        'congress': {
            'name': 'Congressional Analysis',
            'path': 'congress',
            'file': 'congressional_analysis_dashboard.html',
            'description': '119th Congress composition, legislative activity, and productivity analysis'
        },
        'foreign': {
            'name': 'Foreign Affairs Analysis',
            'path': 'foreign_affairs',
            'file': 'foreign_affairs_dashboard.html',
            'description': 'US bilateral relations, security partnerships, and diplomatic initiatives'
        }
    }
    
    root_dir = Path(__file__).parent
    
    if dashboard_name and dashboard_name in dashboards:
        # Serve specific dashboard
        dashboard = dashboards[dashboard_name]
        web_dir = root_dir / dashboard['path']
        
        if not web_dir.exists():
            print(f"❌ Error: Dashboard directory not found: {web_dir}")
            return False
            
        os.chdir(web_dir)
        url = f'http://localhost:{port}'
        
        print(f"🚀 {dashboard['name']}")
        print(f"📊 {dashboard['description']}")
        print(f"🌐 Serving at: {url}")
        print(f"📁 Serving files from: {web_dir}")
        
    else:
        # Serve from root with dashboard selector
        os.chdir(root_dir)
        url = f'http://localhost:{port}'
        
        print(f"🚀 Trump Administration Dashboards Server")
        print(f"🌐 Server running at: {url}")
        print(f"📁 Serving files from: {root_dir}")
        print(f"\n📊 Available Dashboards:")
        for key, dashboard in dashboards.items():
            file_path = f"{dashboard['path']}/{dashboard.get('file', 'index.html')}"
            print(f"   • {dashboard['name']}: {url}/{file_path}")
    
    print(f"\n⏹️  Press Ctrl+C to stop the server")
    
    # Create and start server
    try:
        with socketserver.TCPServer(("", port), CustomHTTPRequestHandler) as httpd:
            if open_browser:
                print(f"🌐 Opening browser...")
                webbrowser.open(url)
            
            print(f"✅ Server started successfully!")
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print(f"\n🛑 Server stopped.")
        return True
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Error: Port {port} is already in use.")
            print(f"💡 Try using a different port: python server.py --port 8001")
        else:
            print(f"❌ Error starting server: {e}")
        return False

def main():
    """Main function with command line argument parsing"""
    parser = argparse.ArgumentParser(
        description='Unified server for Trump Administration dashboards',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python server.py                    # Serve all dashboards from root
  python server.py --dashboard immigration  # Serve only immigration dashboard  
  python server.py --dashboard promises     # Serve only promises tracker
  python server.py --dashboard economic     # Serve only economic dashboard
  python server.py --port 8001             # Use different port
  python server.py --no-browser            # Don't open browser automatically

Available dashboards:
  immigration  - ICE Detention Statistics Dashboard
  promises     - Campaign Promises Tracker  
  economic     - Economic Policy Dashboard
  cuts         - Federal Cuts Tracker
  congress     - Congressional Analysis Dashboard
  foreign      - Foreign Affairs Analysis Dashboard
        """
    )
    
    parser.add_argument(
        '--dashboard', '-d',
        choices=['immigration', 'promises', 'economic', 'cuts', 'congress', 'foreign'],
        help='Serve a specific dashboard'
    )
    
    parser.add_argument(
        '--port', '-p',
        type=int,
        default=8000,
        help='Port number to serve on (default: 8000)'
    )
    
    parser.add_argument(
        '--no-browser',
        action='store_true',
        help='Don\'t open browser automatically'
    )
    
    args = parser.parse_args()
    
    print("Trump Administration Dashboards Server")
    print("=" * 50)
    
    success = serve_dashboard(
        dashboard_name=args.dashboard,
        port=args.port,
        open_browser=not args.no_browser
    )
    
    if not success:
        exit(1)

if __name__ == "__main__":
    main()
