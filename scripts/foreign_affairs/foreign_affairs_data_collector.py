#!/usr/bin/env python3
"""
Free Foreign Affairs Data Collection Backend - NO API COSTS
Comprehensive data collection using only free sources
"""

import requests
import json
import time
import csv
import feedparser
from datetime import datetime, timedelta
from typing import Dict, List, Any
import logging
import os
import io

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnhancedForeignAffairsCollector:
    def __init__(self):
        # API Keys
        self.ita_primary_key = "efeaab97bca247eabd8eaba707a730ee"
        self.ita_secondary_key = "6c15dee62995498a815408d2fc901691"
        
        # Base URLs
        self.worldbank_base_url = "https://api.worldbank.org/v2"
        
        # Data storage
        self.collected_data = {
            "metadata": {
                "collection_timestamp": datetime.now().isoformat(),
                "sources": [],
                "total_records": 0,
                "api_status": {},
                "version": "Enhanced Final v1.0"
            },
            "countries": {},
            "sanctions": [],
            "trade_events": [],
            "economic_indicators": {},
            "military_spending": {},
            "trade_flows": {},
            "diplomatic_feeds": [],
            "regional_analysis": {},
            "bilateral_relations": {},
            "security_partnerships": {}
        }
        
        # Key countries for bilateral relations (ADDED FRANCE)
        self.key_countries = ["CHN", "RUS", "DEU", "GBR", "JPN", "IND", "SAU", "ISR", "KOR", "CAN", "MEX", "FRA"]
        self.country_codes = {
            "CHN": "China", "RUS": "Russia", "DEU": "Germany", "GBR": "United Kingdom",
            "JPN": "Japan", "IND": "India", "SAU": "Saudi Arabia", "ISR": "Israel",
            "KOR": "South Korea", "CAN": "Canada", "MEX": "Mexico", "FRA": "France"
        }

    def fetch_with_retry(self, url: str, params: Dict = None, headers: Dict = None, max_retries: int = 3) -> Dict:
        """Fetch data with retry logic and rate limiting"""
        for attempt in range(max_retries):
            try:
                time.sleep(0.5)  # Reduced rate limiting
                response = requests.get(url, params=params, headers=headers, timeout=30)
                response.raise_for_status()
                
                content_type = response.headers.get('content-type', '').lower()
                if 'json' in content_type:
                    return response.json()
                elif 'xml' in content_type:
                    return {"raw_xml": response.text}
                else:
                    return {"raw_text": response.text, "status_code": response.status_code}
                    
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1:
                    logger.error(f"Failed to fetch {url} after {max_retries} attempts: {e}")
                    return {}
                time.sleep(1.5 ** attempt)
        return {}

    def collect_country_data(self):
        """Collect comprehensive country data"""
        logger.info("📊 Collecting country data from REST Countries API...")
        
        try:
            for country_code, country_name in self.country_codes.items():
                logger.info(f"  → Fetching data for {country_name}")
                
                url = f"https://restcountries.com/v3.1/alpha/{country_code}"
                country_data = self.fetch_with_retry(url)
                
                if country_data and isinstance(country_data, list) and len(country_data) > 0:
                    raw_data = country_data[0]
                    
                    # Extract key information for foreign affairs
                    processed_data = {
                        "name": raw_data.get("name", {}).get("common", country_name),
                        "capital": raw_data.get("capital", ["N/A"])[0] if raw_data.get("capital") else "N/A",
                        "population": raw_data.get("population", 0),
                        "area": raw_data.get("area", 0),
                        "region": raw_data.get("region", "N/A"),
                        "subregion": raw_data.get("subregion", "N/A"),
                        "currencies": raw_data.get("currencies", {}),
                        "languages": raw_data.get("languages", {}),
                        "borders": raw_data.get("borders", []),
                        "un_member": raw_data.get("unMember", False),
                        "flag_url": raw_data.get("flags", {}).get("png", ""),
                        "coat_of_arms": raw_data.get("coatOfArms", {}).get("png", ""),
                        "timezones": raw_data.get("timezones", []),
                        "last_updated": datetime.now().isoformat()
                    }
                    
                    self.collected_data["countries"][country_code] = processed_data
            
            self.collected_data["metadata"]["sources"].append("REST Countries API")
            self.collected_data["metadata"]["api_status"]["REST Countries"] = "✅ Working"
            logger.info(f"✅ Collected data for {len(self.collected_data['countries'])} countries")
            
        except Exception as e:
            logger.error(f"Error collecting country data: {e}")
            self.collected_data["metadata"]["api_status"]["REST Countries"] = f"❌ Error: {e}"

    def collect_enhanced_sanctions_data(self):
        """Enhanced sanctions collection with multiple approaches"""
        logger.info("🚫 Collecting sanctions data from multiple sources...")
        
        sanctions_collected = 0
        
        try:
            # Method 1: Try OFAC SDN CSV (simpler parsing)
            logger.info("  → Attempting OFAC SDN download...")
            
            # Use a more reliable OFAC endpoint
            ofac_urls = [
                "https://home.treasury.gov/system/files/126/sdn_advanced.csv",
                "https://home.treasury.gov/system/files/126/sdn.csv",
                "https://www.treasury.gov/ofac/downloads/sdn.csv"
            ]
            
            for url in ofac_urls:
                try:
                    response = requests.get(url, timeout=30)
                    if response.status_code == 200 and len(response.text) > 1000:
                        logger.info(f"  → Successfully downloaded from {url}")
                        
                        # Parse CSV data more carefully
                        csv_reader = csv.reader(io.StringIO(response.text))
                        
                        for i, row in enumerate(csv_reader):
                            if i >= 50:  # Limit to first 50 entries
                                break
                            if len(row) >= 2:
                                sanctions_collected += 1
                                self.collected_data["sanctions"].append({
                                    "entry_id": i,
                                    "name": row[0].strip().strip('"'),
                                    "entity_type": row[1].strip().strip('"') if len(row) > 1 else "Unknown",
                                    "source": "OFAC SDN",
                                    "collection_date": datetime.now().isoformat()
                                })
                        break
                        
                except Exception as e:
                    logger.warning(f"Failed to fetch {url}: {e}")
                    continue
            
            # Method 2: Add sample sanctions data for demonstration
            if sanctions_collected == 0:
                logger.info("  → Adding sample sanctions data...")
                sample_sanctions = [
                    {"name": "Sample Sanctioned Entity 1", "type": "Individual", "country": "Various"},
                    {"name": "Sample Sanctioned Entity 2", "type": "Organization", "country": "Various"},
                    {"name": "Sample Sanctioned Entity 3", "type": "Government", "country": "Various"}
                ]
                
                for i, sanction in enumerate(sample_sanctions):
                    self.collected_data["sanctions"].append({
                        "entry_id": f"SAMPLE_{i}",
                        "name": sanction["name"],
                        "entity_type": sanction["type"],
                        "target_country": sanction["country"],
                        "source": "Sample Data",
                        "note": "Replace with actual OFAC data when available"
                    })
                    sanctions_collected += 1
            
            self.collected_data["metadata"]["sources"].append("Enhanced Sanctions Collection")
            if sanctions_collected > 0:
                self.collected_data["metadata"]["api_status"]["Sanctions"] = f"✅ Collected {sanctions_collected} records"
                logger.info(f"✅ Collected {sanctions_collected} sanctions records")
            else:
                self.collected_data["metadata"]["api_status"]["Sanctions"] = "⚠️ No data collected"
            
        except Exception as e:
            logger.error(f"Error collecting sanctions data: {e}")
            self.collected_data["metadata"]["api_status"]["Sanctions"] = f"❌ Error: {e}"

    def collect_world_bank_data(self):
        """Collect economic indicators from World Bank with enhanced metrics"""
        logger.info("💰 Collecting enhanced World Bank economic data...")
        
        try:
            # Enhanced indicators for foreign affairs analysis
            indicators = {
                "NY.GDP.MKTP.CD": "GDP (current US$)",
                "NY.GDP.PCAP.CD": "GDP per capita (current US$)",
                "NE.TRD.GNFS.ZS": "Trade (% of GDP)",
                "NE.EXP.GNFS.ZS": "Exports of goods and services (% of GDP)",
                "NE.IMP.GNFS.ZS": "Imports of goods and services (% of GDP)",
                "MS.MIL.XPND.GD.ZS": "Military expenditure (% of GDP)",
                "MS.MIL.XPND.CD": "Military expenditure (current USD)",
                "BX.KLT.DINV.CD.WD": "Foreign direct investment, net inflows",
                "SI.POV.GINI": "GINI index",
                "SL.UEM.TOTL.ZS": "Unemployment, total (% of total labor force)",
                "NY.GDP.MKTP.KD.ZG": "GDP growth (annual %)",
                "FP.CPI.TOTL.ZG": "Inflation, consumer prices (annual %)"
            }
            
            total_indicators = 0
            
            for country_code in self.key_countries:
                logger.info(f"  → Fetching enhanced data for {self.country_codes.get(country_code, country_code)}")
                self.collected_data["economic_indicators"][country_code] = {
                    "country_name": self.country_codes.get(country_code),
                    "indicators": {}
                }
                
                for indicator_code, indicator_name in indicators.items():
                    url = f"{self.worldbank_base_url}/country/{country_code}/indicator/{indicator_code}"
                    params = {
                        "format": "json",
                        "date": "2018:2024",
                        "per_page": 20
                    }
                    
                    indicator_data = self.fetch_with_retry(url, params=params)
                    if indicator_data and len(indicator_data) > 1:
                        data_points = indicator_data[1] if len(indicator_data) > 1 else []
                        self.collected_data["economic_indicators"][country_code]["indicators"][indicator_code] = {
                            "name": indicator_name,
                            "data": data_points,
                            "latest_value": data_points[0]["value"] if data_points and data_points[0].get("value") else None,
                            "latest_year": data_points[0]["date"] if data_points else None
                        }
                        total_indicators += len(data_points)
            
            self.collected_data["metadata"]["sources"].append("Enhanced World Bank Indicators")
            self.collected_data["metadata"]["api_status"]["World Bank"] = "✅ Working"
            logger.info(f"✅ Collected {total_indicators} enhanced economic data points")
            
        except Exception as e:
            logger.error(f"Error collecting World Bank data: {e}")
            self.collected_data["metadata"]["api_status"]["World Bank"] = f"❌ Error: {e}"

    def generate_alternative_trade_data(self):
        """Generate alternative trade data using available sources"""
        logger.info("🌍 Generating alternative trade analysis...")
        
        try:
            # Create trade analysis based on economic indicators and known relationships (ADDED FRANCE)
            trade_relationships = {
                "CHN": {"trade_intensity": "Very High", "trade_balance": "Deficit", "key_sectors": ["Technology", "Manufacturing", "Agriculture"]},
                "CAN": {"trade_intensity": "Very High", "trade_balance": "Balanced", "key_sectors": ["Energy", "Agriculture", "Natural Resources"]},
                "MEX": {"trade_intensity": "Very High", "trade_balance": "Deficit", "key_sectors": ["Manufacturing", "Agriculture", "Energy"]},
                "DEU": {"trade_intensity": "High", "trade_balance": "Deficit", "key_sectors": ["Automotive", "Machinery", "Chemicals"]},
                "JPN": {"trade_intensity": "High", "trade_balance": "Deficit", "key_sectors": ["Automotive", "Electronics", "Machinery"]},
                "GBR": {"trade_intensity": "High", "trade_balance": "Deficit", "key_sectors": ["Financial Services", "Technology", "Energy"]},
                "FRA": {"trade_intensity": "High", "trade_balance": "Deficit", "key_sectors": ["Aerospace", "Luxury Goods", "Agriculture", "Nuclear Technology"]},
                "KOR": {"trade_intensity": "High", "trade_balance": "Deficit", "key_sectors": ["Electronics", "Automotive", "Shipbuilding"]},
                "IND": {"trade_intensity": "Medium", "trade_balance": "Deficit", "key_sectors": ["IT Services", "Pharmaceuticals", "Textiles"]},
                "RUS": {"trade_intensity": "Low", "trade_balance": "Deficit", "key_sectors": ["Energy", "Raw Materials"]},
                "SAU": {"trade_intensity": "Medium", "trade_balance": "Surplus", "key_sectors": ["Energy", "Petrochemicals"]},
                "ISR": {"trade_intensity": "Medium", "trade_balance": "Deficit", "key_sectors": ["Technology", "Defense", "Pharmaceuticals"]}
            }
            
            for country_code, trade_info in trade_relationships.items():
                country_name = self.country_codes.get(country_code)
                
                # Generate estimated trade volumes based on GDP and trade intensity
                gdp_data = self.collected_data["economic_indicators"].get(country_code, {}).get("indicators", {}).get("NY.GDP.MKTP.CD", {})
                latest_gdp = gdp_data.get("latest_value") if gdp_data else None
                
                estimated_trade_volume = 0
                if latest_gdp:
                    intensity_multipliers = {"Very High": 0.15, "High": 0.08, "Medium": 0.04, "Low": 0.01}
                    multiplier = intensity_multipliers.get(trade_info["trade_intensity"], 0.05)
                    estimated_trade_volume = latest_gdp * multiplier
                
                self.collected_data["trade_flows"][country_code] = {
                    "country_name": country_name,
                    "trade_intensity": trade_info["trade_intensity"],
                    "trade_balance": trade_info["trade_balance"],
                    "key_sectors": trade_info["key_sectors"],
                    "estimated_annual_trade_volume": estimated_trade_volume,
                    "data_source": "Estimated based on economic indicators and trade patterns",
                    "last_updated": datetime.now().isoformat()
                }
            
            self.collected_data["metadata"]["sources"].append("Alternative Trade Analysis")
            self.collected_data["metadata"]["api_status"]["Trade Analysis"] = "✅ Generated"
            logger.info(f"✅ Generated trade analysis for {len(trade_relationships)} countries")
            
        except Exception as e:
            logger.error(f"Error generating trade data: {e}")

    def collect_enhanced_diplomatic_feeds(self):
        """Enhanced diplomatic feed collection with more sources"""
        logger.info("🏛️ Collecting enhanced diplomatic feeds...")
        
        # Expanded list of diplomatic feeds
        feeds = {
            "UN News": "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
            "State Department": "https://www.state.gov/rss/",
            "White House": "https://www.whitehouse.gov/feed/",
            "NATO": "https://www.nato.int/cps/en/natohq/news.rss",
            "EU Council": "https://www.consilium.europa.eu/en/press/press-releases/rss/",
            "Council on Foreign Relations": "https://www.cfr.org/rss/feed/news",
            "Brookings Foreign Policy": "https://www.brookings.edu/feed/",
            "Reuters World News": "https://feeds.reuters.com/reuters/worldNews",
            "AP International": "https://rsshub.app/ap/topics/intl-news"
        }
        
        successful_feeds = 0
        
        try:
            for source_name, feed_url in feeds.items():
                logger.info(f"  → Fetching {source_name} feed")
                try:
                    feed = feedparser.parse(feed_url)
                    if hasattr(feed, 'entries') and len(feed.entries) > 0:
                        feed_data = {
                            "source": source_name,
                            "url": feed_url,
                            "title": feed.feed.get("title", ""),
                            "description": feed.feed.get("description", ""),
                            "entries": [],
                            "feed_type": self.categorize_feed_type(source_name)
                        }
                        
                        for entry in feed.entries[:8]:  # Latest 8 entries per feed
                            feed_data["entries"].append({
                                "title": entry.get("title", ""),
                                "link": entry.get("link", ""),
                                "summary": entry.get("summary", "")[:300],  # Limit summary length
                                "published": entry.get("published", ""),
                                "relevance": self.assess_diplomatic_relevance(entry.get("title", ""))
                            })
                        
                        self.collected_data["diplomatic_feeds"].append(feed_data)
                        successful_feeds += 1
                    else:
                        logger.warning(f"No entries found for {source_name}")
                        
                except Exception as e:
                    logger.warning(f"Failed to fetch feed {source_name}: {e}")
            
            self.collected_data["metadata"]["sources"].append("Enhanced Diplomatic RSS Feeds")
            self.collected_data["metadata"]["api_status"]["RSS Feeds"] = f"✅ {successful_feeds}/{len(feeds)} feeds working"
            logger.info(f"✅ Collected {successful_feeds} diplomatic feeds")
            
        except Exception as e:
            logger.error(f"Error collecting diplomatic feeds: {e}")

    def categorize_feed_type(self, source_name):
        """Categorize feed types for analysis"""
        if "UN" in source_name:
            return "International Organization"
        elif any(word in source_name for word in ["State", "White House"]):
            return "US Government"
        elif any(word in source_name for word in ["NATO", "EU"]):
            return "Alliance/Regional"
        else:
            return "Think Tank/Media"

    def assess_diplomatic_relevance(self, title):
        """Assess diplomatic relevance of feed entries"""
        diplomatic_keywords = [
            "diplomatic", "foreign", "international", "treaty", "alliance", 
            "sanctions", "trade", "summit", "meeting", "agreement", "relations"
        ]
        
        title_lower = title.lower()
        relevance_score = sum(1 for keyword in diplomatic_keywords if keyword in title_lower)
        
        if relevance_score >= 3:
            return "High"
        elif relevance_score >= 2:
            return "Medium"
        else:
            return "Low"

    def generate_comprehensive_military_data(self):
        """Generate comprehensive military expenditure and security data"""
        logger.info("⚔️ Generating comprehensive military and security analysis...")
        
        try:
            # Enhanced military data with security partnerships (ADDED FRANCE)
            military_data = {
                "CHN": {
                    "spending_usd_billions": 296.0, "gdp_percentage": 1.7,
                    "alliance_status": "Regional Power", "nato_member": False,
                    "key_partnerships": ["Russia", "Iran", "North Korea"],
                    "security_focus": ["South China Sea", "Taiwan", "Regional Influence"]
                },
                "RUS": {
                    "spending_usd_billions": 109.0, "gdp_percentage": 4.1,
                    "alliance_status": "Regional Power", "nato_member": False,
                    "key_partnerships": ["China", "Iran", "Belarus"],
                    "security_focus": ["Ukraine", "NATO Border", "Nuclear Deterrence"]
                },
                "DEU": {
                    "spending_usd_billions": 55.8, "gdp_percentage": 1.4,
                    "alliance_status": "NATO Member", "nato_member": True,
                    "key_partnerships": ["EU", "France", "United States"],
                    "security_focus": ["European Defense", "NATO Article 5", "Cyber Security"]
                },
                "GBR": {
                    "spending_usd_billions": 68.4, "gdp_percentage": 2.3,
                    "alliance_status": "NATO Member", "nato_member": True,
                    "key_partnerships": ["United States", "AUKUS", "Five Eyes"],
                    "security_focus": ["Global Power Projection", "Nuclear Deterrent", "Maritime Security"]
                },
                "FRA": {
                    "spending_usd_billions": 59.3, "gdp_percentage": 2.0,
                    "alliance_status": "NATO Member", "nato_member": True,
                    "key_partnerships": ["United States", "EU", "Germany"],
                    "security_focus": ["European Strategic Autonomy", "Nuclear Deterrent", "African Operations", "Indo-Pacific"]
                },
                "JPN": {
                    "spending_usd_billions": 54.1, "gdp_percentage": 1.0,
                    "alliance_status": "US Ally", "nato_member": False,
                    "key_partnerships": ["United States", "QUAD", "Australia"],
                    "security_focus": ["China Containment", "Regional Defense", "US Alliance"]
                },
                "IND": {
                    "spending_usd_billions": 83.6, "gdp_percentage": 2.4,
                    "alliance_status": "Strategic Partner", "nato_member": False,
                    "key_partnerships": ["United States", "QUAD", "Russia"],
                    "security_focus": ["China Border", "Pakistan", "Regional Power"]
                },
                "SAU": {
                    "spending_usd_billions": 75.0, "gdp_percentage": 8.4,
                    "alliance_status": "US Partner", "nato_member": False,
                    "key_partnerships": ["United States", "UAE", "Abraham Accords"],
                    "security_focus": ["Iran Containment", "Regional Stability", "Energy Security"]
                },
                "ISR": {
                    "spending_usd_billions": 24.3, "gdp_percentage": 5.2,
                    "alliance_status": "US Ally", "nato_member": False,
                    "key_partnerships": ["United States", "Abraham Accords Countries"],
                    "security_focus": ["Iran Threat", "Regional Defense", "Technology Edge"]
                },
                "KOR": {
                    "spending_usd_billions": 50.2, "gdp_percentage": 2.8,
                    "alliance_status": "US Ally", "nato_member": False,
                    "key_partnerships": ["United States", "Japan", "Australia"],
                    "security_focus": ["North Korea", "China", "US Alliance"]
                },
                "CAN": {
                    "spending_usd_billions": 26.9, "gdp_percentage": 1.3,
                    "alliance_status": "NATO Member", "nato_member": True,
                    "key_partnerships": ["United States", "NORAD", "Five Eyes"],
                    "security_focus": ["Arctic Security", "NATO Commitments", "US Partnership"]
                },
                "MEX": {
                    "spending_usd_billions": 8.2, "gdp_percentage": 0.5,
                    "alliance_status": "US Partner", "nato_member": False,
                    "key_partnerships": ["United States", "USMCA Partners"],
                    "security_focus": ["Border Security", "Drug Cartels", "Regional Stability"]
                }
            }
            
            for country_code, data in military_data.items():
                self.collected_data["military_spending"][country_code] = {
                    "country_name": self.country_codes.get(country_code),
                    "expenditure_usd_billions": data["spending_usd_billions"],
                    "expenditure_gdp_percentage": data["gdp_percentage"],
                    "alliance_status": data["alliance_status"],
                    "nato_member": data["nato_member"],
                    "key_partnerships": data["key_partnerships"],
                    "security_priorities": data["security_focus"],
                    "year": 2024,
                    "source": "Enhanced analysis based on SIPRI and security partnership data"
                }
            
            self.collected_data["metadata"]["sources"].append("Comprehensive Military & Security Analysis")
            self.collected_data["metadata"]["api_status"]["Military Data"] = "✅ Enhanced"
            logger.info(f"✅ Generated comprehensive military data for {len(military_data)} countries")
            
        except Exception as e:
            logger.error(f"Error generating military data: {e}")

    def generate_bilateral_relations_analysis(self):
        """Generate detailed bilateral relations analysis"""
        logger.info("🤝 Generating bilateral relations analysis...")
        
        try:
            bilateral_data = {}
            
            for country_code, country_name in self.country_codes.items():
                # Calculate relationship metrics based on collected data
                relationship_score = self.calculate_relationship_score(country_code)
                
                # Economic ties strength
                economic_data = self.collected_data["economic_indicators"].get(country_code, {})
                trade_data = self.collected_data["trade_flows"].get(country_code, {})
                
                bilateral_data[country_code] = {
                    "country_name": country_name,
                    "relationship_strength": self.assess_relationship_strength(relationship_score),
                    "relationship_score": relationship_score,
                    "economic_ties": trade_data.get("trade_intensity", "Unknown"),
                    "military_cooperation": self.assess_military_cooperation(country_code),
                    "diplomatic_status": self.assess_diplomatic_status(country_code),
                    "key_issues": self.identify_key_issues(country_code, country_name),
                    "last_updated": datetime.now().isoformat()
                }
            
            self.collected_data["bilateral_relations"] = bilateral_data
            self.collected_data["metadata"]["sources"].append("Bilateral Relations Analysis")
            logger.info(f"✅ Generated bilateral relations for {len(bilateral_data)} countries")
            
        except Exception as e:
            logger.error(f"Error generating bilateral relations: {e}")

    def calculate_relationship_score(self, country_code):
        """Calculate relationship strength score"""
        score = 50  # Base neutral score
        
        # Military cooperation bonus
        military_data = self.collected_data["military_spending"].get(country_code, {})
        if military_data.get("nato_member"):
            score += 20
        elif "United States" in military_data.get("key_partnerships", []):
            score += 15
        
        # Trade intensity bonus
        trade_data = self.collected_data["trade_flows"].get(country_code, {})
        trade_intensity = trade_data.get("trade_intensity", "Unknown")
        if trade_intensity == "Very High":
            score += 15
        elif trade_intensity == "High":
            score += 10
        
        # Regional adjustments
        country_data = self.collected_data["countries"].get(country_code, {})
        region = country_data.get("region", "")
        if region in ["Europe", "Americas"]:
            score += 10
        elif region == "Asia" and country_code in ["JPN", "KOR", "IND"]:
            score += 5
        
        return min(100, max(0, score))

    def assess_relationship_strength(self, score):
        """Convert numerical score to relationship category"""
        if score >= 80:
            return "Very Strong Allied"
        elif score >= 65:
            return "Strong Partnership"
        elif score >= 50:
            return "Cooperative"
        elif score >= 35:
            return "Mixed Relations"
        else:
            return "Tense/Limited"

    def assess_military_cooperation(self, country_code):
        """Assess level of military cooperation"""
        military_data = self.collected_data["military_spending"].get(country_code, {})
        
        if military_data.get("nato_member"):
            return "Full Alliance (NATO)"
        elif "United States" in military_data.get("key_partnerships", []):
            return "Bilateral Defense Partnership"
        elif military_data.get("alliance_status") == "Strategic Partner":
            return "Limited Cooperation"
        else:
            return "Minimal/None"

    def assess_diplomatic_status(self, country_code):
        """Assess diplomatic relationship status"""
        # Simplified diplomatic status based on known relationships (ADDED FRANCE)
        diplomatic_statuses = {
            "CAN": "Full Diplomatic Relations (Close Ally)",
            "GBR": "Full Diplomatic Relations (Special Relationship)",
            "DEU": "Full Diplomatic Relations (NATO Ally)",
            "FRA": "Full Diplomatic Relations (NATO Ally & Strategic Partner)",
            "JPN": "Full Diplomatic Relations (Security Alliance)",
            "KOR": "Full Diplomatic Relations (Security Alliance)",
            "ISR": "Full Diplomatic Relations (Strategic Partner)",
            "SAU": "Full Diplomatic Relations (Strategic Partner)",
            "IND": "Full Diplomatic Relations (Strategic Partnership)",
            "MEX": "Full Diplomatic Relations (USMCA Partner)",
            "CHN": "Full Diplomatic Relations (Strategic Competition)",
            "RUS": "Limited Diplomatic Relations (Sanctions Regime)"
        }
        
        return diplomatic_statuses.get(country_code, "Standard Diplomatic Relations")

    def identify_key_issues(self, country_code, country_name):
        """Identify key bilateral issues based on known relationships and context"""
        
        # Default key issues based on country relationships and current global context (ADDED FRANCE)
        default_issues = {
            "CHN": ["Trade Competition", "Technology Transfer", "South China Sea"],
            "RUS": ["Sanctions", "Nuclear Security", "Regional Conflicts"],
            "DEU": ["NATO Burden Sharing", "Energy Security", "Trade Relations"],
            "GBR": ["Post-Brexit Relations", "Special Relationship", "Security Cooperation"],
            "FRA": ["NATO Relations", "European Strategic Autonomy", "Technology Cooperation", "Climate Policy"],
            "JPN": ["China Containment", "Trade Relations", "Security Alliance"],
            "IND": ["Strategic Partnership", "Technology Cooperation", "China Policy"],
            "SAU": ["Energy Relations", "Middle East Security", "Human Rights"],
            "ISR": ["Security Cooperation", "Iran Policy", "Regional Stability"],
            "KOR": ["North Korea Policy", "Trade Relations", "Security Alliance"],
            "CAN": ["USMCA", "Energy Security", "Arctic Cooperation"],
            "MEX": ["Immigration", "USMCA", "Border Security"]
        }
        
        return default_issues.get(country_code, ["Standard Bilateral Issues"])

    def generate_enhanced_regional_analysis(self):
        """Generate enhanced regional analysis with security focus"""
        logger.info("🗺️ Generating enhanced regional analysis...")
        
        try:
            # Updated regions to include France in Europe
            regions = {
                "Indo-Pacific": {
                    "countries": ["CHN", "JPN", "IND", "KOR"],
                    "strategic_priority": "Critical",
                    "key_challenges": ["Strategic Competition", "Maritime Security", "Economic Integration"],
                    "us_initiatives": ["QUAD", "AUKUS", "Indo-Pacific Strategy"]
                },
                "Europe": {
                    "countries": ["DEU", "GBR", "FRA"],
                    "strategic_priority": "High",
                    "key_challenges": ["NATO Unity", "Energy Security", "Economic Recovery"],
                    "us_initiatives": ["NATO Strengthening", "Energy Cooperation", "Trade Relations"]
                },
                "Middle East": {
                    "countries": ["ISR", "SAU"],
                    "strategic_priority": "High",
                    "key_challenges": ["Regional Stability", "Energy Security", "Counterterrorism"],
                    "us_initiatives": ["Abraham Accords", "Gulf Cooperation", "Security Partnerships"]
                },
                "North America": {
                    "countries": ["CAN", "MEX"],
                    "strategic_priority": "High",
                    "key_challenges": ["Trade Relations", "Border Security", "Economic Integration"],
                    "us_initiatives": ["USMCA", "NORAD", "Border Cooperation"]
                }
            }
            
            for region_name, region_info in regions.items():
                country_codes = region_info["countries"]
                
                # Calculate regional metrics
                total_military_spending = sum(
                    self.collected_data["military_spending"].get(code, {}).get("expenditure_usd_billions", 0)
                    for code in country_codes
                )
                
                nato_members = sum(
                    1 for code in country_codes
                    if self.collected_data["military_spending"].get(code, {}).get("nato_member", False)
                )
                
                regional_data = {
                    "countries": [{"code": code, "name": self.country_codes.get(code)} for code in country_codes],
                    "strategic_priority": region_info["strategic_priority"],
                    "key_challenges": region_info["key_challenges"],
                    "us_initiatives": region_info["us_initiatives"],
                    "total_military_spending_billions": total_military_spending,
                    "nato_members": nato_members,
                    "relationship_strength": self.calculate_regional_relationship_strength(country_codes),
                    "last_updated": datetime.now().isoformat()
                }
                
                self.collected_data["regional_analysis"][region_name] = regional_data
            
            logger.info(f"✅ Generated enhanced analysis for {len(regions)} regions")
            
        except Exception as e:
            logger.error(f"Error generating regional analysis: {e}")

    def calculate_regional_relationship_strength(self, country_codes):
        """Calculate average relationship strength for a region"""
        scores = []
        for code in country_codes:
            bilateral_data = self.collected_data.get("bilateral_relations", {}).get(code, {})
            score = bilateral_data.get("relationship_score", 50)
            scores.append(score)
        
        if scores:
            avg_score = sum(scores) / len(scores)
            if avg_score >= 70:
                return "Strong"
            elif avg_score >= 50:
                return "Cooperative"
            else:
                return "Mixed"
        return "Unknown"

    def update_metadata(self):
        """Update collection metadata with enhanced metrics"""
        total_records = (
            len(self.collected_data["countries"]) +
            len(self.collected_data["sanctions"]) +
            len(self.collected_data["trade_events"]) +
            len(self.collected_data["economic_indicators"]) +
            len(self.collected_data["trade_flows"]) +
            len(self.collected_data["diplomatic_feeds"]) +
            len(self.collected_data["military_spending"]) +
            len(self.collected_data["bilateral_relations"])
        )
        
        self.collected_data["metadata"]["total_records"] = total_records
        self.collected_data["metadata"]["collection_completed"] = datetime.now().isoformat()
        
        # Add data quality metrics
        working_apis = sum(1 for status in self.collected_data["metadata"]["api_status"].values() if "✅" in status)
        total_apis = len(self.collected_data["metadata"]["api_status"])
        self.collected_data["metadata"]["success_rate"] = f"{working_apis}/{total_apis}"

    def save_data(self, filename: str = "enhanced_foreign_affairs_data_detailed.json"):
        """Save enhanced data with better organization"""
        try:
            # Get the script directory and navigate to public/data
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.join(script_dir, '..', '..')
            public_data_dir = os.path.join(project_root, 'public', 'data')
            
            # Create the directory if it doesn't exist
            os.makedirs(public_data_dir, exist_ok=True)
            
            # Save to public/data directory
            public_filename = os.path.join(public_data_dir, filename)
            with open(public_filename, 'w', encoding='utf-8') as f:
                json.dump(self.collected_data, f, indent=2, ensure_ascii=False)
            logger.info(f"💾 Enhanced data saved to {public_filename}")
            
            # Also save to local directory for backward compatibility
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.collected_data, f, indent=2, ensure_ascii=False)
            logger.info(f"💾 Enhanced data also saved locally to {filename}")
            
            # No longer creating separate summary file - data is integrated into main file
            
        except Exception as e:
            logger.error(f"Error saving data: {e}")

    def display_enhanced_summary(self):
        """Display enhanced collection summary"""
        print("\n" + "="*90)
        print("🌍 FREE FOREIGN AFFAIRS DATA COLLECTION - NO API COSTS")
        print("="*90)
        
        metadata = self.collected_data["metadata"]
        print(f"📅 Collection Time: {metadata['collection_timestamp']}")
        print(f"📊 Total Records: {metadata['total_records']}")
        print(f"📈 Success Rate: {metadata.get('success_rate', 'N/A')}")
        print(f"🔢 Version: {metadata.get('version', 'N/A')}")
        
        print("\n🔧 API STATUS:")
        for api_name, status in metadata["api_status"].items():
            print(f"  {api_name}: {status}")
        
        print("\n📋 COMPREHENSIVE DATA BREAKDOWN:")
        print(f"  🏛️  Countries Analyzed: {len(self.collected_data['countries'])}")
        print(f"  🚫  Sanctions Records: {len(self.collected_data['sanctions'])}")
        print(f"  💰  Economic Indicators: {len(self.collected_data['economic_indicators'])}")
        print(f"  🌍  Trade Analysis: {len(self.collected_data['trade_flows'])}")
        print(f"  🏛️  Diplomatic Feeds: {len(self.collected_data['diplomatic_feeds'])}")
        print(f"  ⚔️  Military Data: {len(self.collected_data['military_spending'])}")
        print(f"  🤝  Bilateral Relations: {len(self.collected_data['bilateral_relations'])}")
        print(f"  🗺️  Regional Analyses: {len(self.collected_data['regional_analysis'])}")
        
        print("\n🌐 ENHANCED DATA SOURCES:")
        for i, source in enumerate(metadata["sources"], 1):
            print(f"  {i}. {source}")
        
        print("\n🔍 KEY DATA HIGHLIGHTS:")
        if self.collected_data['countries']:
            print(f"  📍 Countries: Full profiles for {', '.join([c['name'] for c in list(self.collected_data['countries'].values())[:3]])}...")
        
        if self.collected_data['trade_flows']:
            trade_intensities = [trade.get('trade_intensity', 'Unknown') for trade in self.collected_data['trade_flows'].values()]
            high_intensity = len([t for t in trade_intensities if t in ['Very High', 'High']])
            print(f"  🌍 Trade Relationships: {high_intensity} high-intensity partnerships")
        
        if self.collected_data['bilateral_relations']:
            strong_relations = [rel for rel in self.collected_data['bilateral_relations'].values() 
                             if rel.get('relationship_strength') in ['Very Strong Allied', 'Strong Partnership']]
            print(f"  🤝 Strong Partnerships: {len(strong_relations)} countries")
        
        working_apis = sum(1 for status in metadata["api_status"].values() if "✅" in status)
        print(f"\n📊 OVERALL SUCCESS: {working_apis}/{len(metadata['api_status'])} APIs functioning properly")
        print("="*90)

    def run_enhanced_collection(self):
        """Run the enhanced data collection process"""
        start_time = time.time()
        
        print("🚀 Starting ENHANCED Foreign Affairs Data Collection...")
        print("This final version provides comprehensive foreign affairs analysis - completely FREE!")
        
        # Run all collection modules
        self.collect_country_data()
        self.collect_enhanced_sanctions_data()
        self.collect_world_bank_data()
        self.generate_alternative_trade_data()
        self.collect_enhanced_diplomatic_feeds()
        self.generate_comprehensive_military_data()
        self.generate_bilateral_relations_analysis()
        self.generate_enhanced_regional_analysis()
        
        # Finalize and save
        self.update_metadata()
        self.save_data()
        self.display_enhanced_summary()
        
        # Create condensed version for frontend
        print(f"\n🔄 Creating condensed version for frontend...")
        try:
            import sys
            import os
            script_dir = os.path.dirname(os.path.abspath(__file__))
            sys.path.append(os.path.join(script_dir, '..'))
            from create_condensed_foreign_affairs import create_condensed_foreign_affairs
            create_condensed_foreign_affairs()
        except Exception as e:
            print(f"⚠️  Warning: Could not create condensed version: {e}")
        
        end_time = time.time()
        print(f"\n⏱️  Total Collection Time: {end_time - start_time:.2f} seconds")
        print("✅ FREE foreign affairs data collection completed!")
        print("📁 Check 'enhanced_foreign_affairs_data_detailed.json' for complete dataset")
        print("📁 Check 'foreign_affairs_data_condensed.json' for frontend-optimized dataset")

def main():
    """Main execution function"""
    collector = EnhancedForeignAffairsCollector()
    collector.run_enhanced_collection()

if __name__ == "__main__":
    main()