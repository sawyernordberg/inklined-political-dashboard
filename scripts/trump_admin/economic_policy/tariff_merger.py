#!/usr/bin/env python3
"""
Tariff Data Analyzer using Google Gemini 2.0 Flash
Analyzes tariff data and generates new updates with real-time verification
"""

import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import time
import re
from google import genai
from google.genai import types

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Using system environment variables only.")
    print("To use .env files, install with: pip install python-dotenv")

class TariffAnalyzer:
    def __init__(self, api_key: str):
        """Initialize the Tariff Analyzer with Gemini API."""
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.0-flash"
        self.output_file = "gemini_tariff_analysis.json"
        self.clean_output_file = "tariff_data_clean.json"
        self.source_file = "../../../public/data/gemini_tariff_analysis.json" # Read from gemini analysis file
        
        # Minimum date for updates (April 2nd, 2025)
        self.min_update_date = datetime(2025, 4, 2)
        
    def load_source_data(self) -> Dict[str, Any]:
        """Load the source JSON data."""
        try:
            with open(self.source_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Error: {self.source_file} not found!")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            sys.exit(1)
    
    def load_existing_analysis(self) -> Optional[Dict[str, Any]]:
        """Load existing Gemini analysis if it exists."""
        try:
            with open(self.output_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return None
        except json.JSONDecodeError as e:
            print(f"Warning: Error parsing existing analysis file: {e}")
            return None
    
    def needs_update(self, source_data: Dict[str, Any], existing_data: Optional[Dict[str, Any]]) -> bool:
        """Check if update is needed based on timestamps."""
        if existing_data is None:
            return True
        
        source_timestamp = source_data.get('timestamp', '')
        existing_timestamp = existing_data.get('source_timestamp', '')
        
        if source_timestamp != existing_timestamp:
            print(f"Update needed: Source timestamp {source_timestamp} differs from existing {existing_timestamp}")
            return True
        
        print("No update needed: Timestamps match")
        return False
    
    def needs_clean_data_update(self) -> bool:
        """Check if clean data needs to be updated."""
        try:
            with open(self.clean_output_file, 'r', encoding='utf-8') as f:
                clean_data = json.load(f)
                # Check if sources field is missing or if we want to force regeneration
                if 'sources' not in clean_data:
                    print("Clean data needs update: sources field missing")
                    return True
                # Force regeneration to use tariff_merger.py's proper source extraction logic
                print("Clean data needs update: regenerating with proper source extraction")
                return True
        except (FileNotFoundError, json.JSONDecodeError):
            print("Clean data needs update: file missing or corrupted")
            return True
    
    def generate_with_gemini(self, prompt: str, max_retries: int = 3) -> str:
        """Generate content using Gemini with retry logic."""
        # Remove tools that may not be supported in all regions/API versions
        # tools = [
        #     types.Tool(google_search=types.GoogleSearch()),
        #     types.Tool(url_context=types.UrlContext())
        # ]
        
        generate_content_config = types.GenerateContentConfig(
            # tools=tools,  # Commented out due to API limitations
            response_mime_type="text/plain",
            temperature=0.1,
        )
        
        for attempt in range(max_retries):
            try:
                contents = [
                    types.Content(
                        role="user",
                        parts=[types.Part.from_text(text=prompt)],
                    ),
                ]
                
                response_text = ""
                for chunk in self.client.models.generate_content_stream(
                    model=self.model,
                    contents=contents,
                    config=generate_content_config,
                ):
                    if chunk.text:
                        response_text += chunk.text
                
                result = response_text.strip()
                return result if result else ""
                
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    return ""
    
    def extract_source_names(self, source_titles: List[str]) -> List[str]:
        """Extract just the source names from source titles."""
        # Sources to exclude
        excluded_sources = {
            'wikipedia', 'itvx', 'alcircle', 'trade war news', 
            'profit by pakistan today', 'business and economy news'
        }
        
        sources = []
        for title in source_titles:
            if not title:
                continue
                
            # Look for patterns like "Title - Source" or "Title | Source"
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
                title_lower = title.lower()
                
                # First check if title contains any excluded sources
                if any(excluded in title_lower for excluded in excluded_sources):
                    print(f"Excluding filtered source from title: {title[:50]}...")
                    continue
                
                known_sources = [
                    ('bbc', 'BBC'),
                    ('cnn', 'CNN'),
                    ('reuters', 'Reuters'),
                    ('bloomberg', 'Bloomberg'),
                    ('politico', 'Politico'),
                    ('pbs', 'PBS'),
                    ('npr', 'NPR'),
                    ('wall street journal', 'Wall Street Journal'),
                    ('financial times', 'Financial Times'),
                    ('washington post', 'Washington Post'),
                    ('new york times', 'New York Times'),
                    ('al jazeera', 'Al Jazeera'),
                    ('associated press', 'Associated Press'),
                    ('ap news', 'Associated Press'),
                    ('white house', 'White House'),
                    ('whitehouse.gov', 'White House'),
                    ('ustr.gov', 'US Trade Representative'),
                    ('us trade representative', 'US Trade Representative'),
                    ('department of commerce', 'Department of Commerce'),
                    ('treasury department', 'Treasury Department'),
                    ('cbp.gov', 'Customs and Border Protection'),
                    ('customs and border protection', 'Customs and Border Protection'),
                    ('sec.gov', 'Securities and Exchange Commission'),
                    ('ftc.gov', 'Federal Trade Commission'),
                    ('trade.gov', 'Department of Commerce')
                ]
                
                found_source = False
                for search_term, proper_name in known_sources:
                    if search_term in title_lower:
                        sources.append(proper_name)
                        found_source = True
                        break
                
                # Only add as source if we found a known source
                if not found_source:
                    # Additional check: skip if title looks like a typical article headline
                    article_indicators = [
                        'announces', 'says', 'reports', 'confirms', 'reveals',
                        'breaks down', 'explains', 'analysis', 'what to know',
                        'here\'s what', 'how to', 'why', 'when', 'where',
                        'latest', 'breaking', 'update', 'developing'
                    ]
                    
                    is_likely_article = any(indicator in title_lower for indicator in article_indicators)
                    is_too_long = len(title) > 60  # Long titles are usually articles, not sources
                    
                    if not is_likely_article and not is_too_long:
                        print(f"Skipping unclear source: {title[:50]}...")
        
        return sources
    
    def parse_date(self, date_string: str) -> Optional[datetime]:
        """Parse various date formats."""
        if not date_string:
            return None
            
        # Common date formats
        formats = [
            "%B %d, %Y",      # "June 27, 2025"
            "%B %d, %Y",      # "July 22, 2025"
            "%B %dst, %Y",    # "July 1st, 2025"
            "%B %dnd, %Y",    # "July 2nd, 2025"
            "%B %drd, %Y",    # "July 3rd, 2025"
            "%B %dth, %Y",    # "July 4th, 2025"
            "%Y-%m-%d",       # "2025-06-27"
            "%m/%d/%Y",       # "06/27/2025"
            "%d/%m/%Y",       # "27/06/2025"
            "%m-%d-%Y",       # "07-22-2025"
            "%d-%m-%Y",       # "22-07-2025"
            "%Y/%m/%d",       # "2025/06/27"
        ]
        
        # Clean the date string
        date_string = date_string.strip()
        
        for fmt in formats:
            try:
                return datetime.strptime(date_string, fmt)
            except ValueError:
                continue
        
        print(f"Warning: Could not parse date '{date_string}'")
        return None
    
    def is_date_valid(self, date_string: str) -> bool:
        """Check if date is on or after April 2nd, 2025."""
        parsed_date = self.parse_date(date_string)
        if parsed_date is None:
            return False
        return parsed_date >= self.min_update_date
    
    def extract_date_from_topic(self, topic: str) -> Optional[datetime]:
        """Extract date from topic string if present."""
        import re
        
        # Look for various date patterns in the topic
        date_patterns = [
            r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b',  # MM/DD/YYYY or MM-DD-YYYY
            r'\b(\d{4}[/-]\d{1,2}[/-]\d{1,2})\b',  # YYYY/MM/DD or YYYY-MM-DD
            r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b',  # Month Day, Year
            r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b',  # Abbreviated month
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, topic, re.IGNORECASE)
            if matches:
                date_str = matches[0]
                parsed_date = self.parse_date(date_str)
                if parsed_date:
                    return parsed_date
        
        return None
    
    def validate_multiple_sources(self, update: Dict[str, Any]) -> bool:
        """Validate that an update has reliable sources (relaxed requirements)."""
        source_titles = update.get('source_titles', [])
        if len(source_titles) < 1:
            print(f"Update '{update.get('title', '')[:50]}...' has no sources")
            return False
        
        # Extract and validate source names
        source_names = self.extract_source_names(source_titles)
        if len(source_names) < 1:
            print(f"Update '{update.get('title', '')[:50]}...' has no valid sources")
            return False
        
        # Prefer multiple sources but allow single high-quality source
        if len(source_names) == 1:
            high_quality_sources = {
                'reuters', 'bloomberg', 'wall street journal', 'financial times',
                'white house', 'us trade representative', 'department of commerce',
                'bbc', 'cnn', 'associated press'
            }
            source_name_lower = source_names[0].lower()
            if any(quality_source in source_name_lower for quality_source in high_quality_sources):
                return True
            else:
                print(f"Update '{update.get('title', '')[:50]}...' has single source that's not high-quality")
                return False
        
        return True
    
    def analyze_country_tariffs(self, source_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Return the original country tariffs data without enhancement."""
        print("Using original country tariff data from source file...")
        country_tariffs = source_data.get('country_tariffs', [])
        
        # Add a timestamp to each entry for tracking
        enhanced_tariffs = []
        for tariff in country_tariffs:
            enhanced_tariff = tariff.copy()
            enhanced_tariff['last_verified'] = datetime.now().strftime('%Y-%m-%d')
            enhanced_tariff['notes'] = 'original_data_from_world_scorecard'
            enhanced_tariffs.append(enhanced_tariff)
        
        print(f"Processed {len(enhanced_tariffs)} country tariffs from source data.")
        return enhanced_tariffs
    
    def generate_additional_updates(self, existing_updates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate additional tariff updates using Google Search, ensuring no overlap with existing content."""
        
        # Convert existing updates to JSON string for Gemini to read
        existing_updates_json = json.dumps(existing_updates, indent=2) if existing_updates else "[]"
        
        # Get dates for search - last 2 months for recent updates
        two_months_ago = datetime.now() - timedelta(days=60)
        two_months_ago_str = two_months_ago.strftime('%B %d, %Y')
        current_date = datetime.now().strftime('%B %d, %Y')
        min_date_str = self.min_update_date.strftime('%B %d, %Y')
        
        prompt = f"""
        Generate unique US tariff and trade policy updates - focus on quality over quantity.

        CRITICAL DATE REQUIREMENT: Focus on RECENT developments from the last 2 months ({two_months_ago_str} to {current_date}). If no recent developments are found, you may include updates back to {min_date_str}, but prioritize the most recent actions.

        CRITICAL: Here are the existing tariff updates in the JSON file. Do NOT generate updates about any of these topics, countries, sectors, or events. Read through this carefully and avoid ALL overlap:

        EXISTING UPDATES JSON:
        {existing_updates_json}

        Study the existing updates above carefully. Do NOT create updates about:
        - Any of the same countries, regions, or trade relationships mentioned
        - Any of the same sectors, industries, or product categories covered  
        - Any of the same types of trade actions, policies, or events documented
        - Any similar topics using different wording
        - Any of the same time periods or dates already covered

        RESEARCH COMPLETELY NEW AND DIFFERENT DEVELOPMENTS from the last 2 months:
        - Find countries, sectors, or trade relationships NOT mentioned in the existing updates
        - Identify new trade agreements, policies, or actions NOT covered in existing updates from the last 2 months
        - Look for different types of trade measures NOT already documented
        - Focus on very recent developments from {two_months_ago_str} to {current_date}

        RESEARCH SYSTEMATICALLY for unique developments across diverse areas from the LAST 2 MONTHS:

        1. DIFFERENT COUNTRIES/REGIONS (avoid those in existing updates):
        - Research countries/regions NOT mentioned in the JSON above
        - Look for very recent bilateral agreements, tariff changes with new partners
        - Focus on breaking news and recent implementations from the last 2 months

        2. DIFFERENT SECTORS/INDUSTRIES (avoid those in existing updates):
        - Research industries NOT mentioned in the JSON above
        - Look for recent developments in niche sectors, emerging industries
        - Technology subsectors, specialized manufacturing, services not covered

        3. DIFFERENT TYPES OF ACTIONS (avoid those in existing updates):
        - Very recent policy implementations not mentioned in existing updates
        - Latest trade measures (sanctions, export controls, investment restrictions)
        - Recent WTO disputes, trade remedies, or regulatory changes

        PRIMARY FOCUS: Look for VERY RECENT ACTUAL ACTIONS and IMPLEMENTATIONS from the last 2 months:
        - Policies that have been ENACTED, IMPLEMENTED, or PUT INTO EFFECT in the last 2 months
        - Trade measures that are CURRENTLY ACTIVE and affecting commerce (implemented recently)
        - Concrete actions with real economic impact from the last 2 months

        If no developments from the last 2 months are found, you may research back to {min_date_str}, but strongly prioritize the most recent actions.

        IMPORTANT SOURCE REQUIREMENTS:
        - Each update should have 1-2 reliable sources
        - Format as: "Article Title - Source Name"  
        - Prioritize: Reuters, Bloomberg, BBC, CNN, Wall Street Journal, White House, USTR, Commerce Department
        - AVOID: Wikipedia, ITVX, alcircle, Trade War news, Profit by Pakistan Today, Business and Economy News

        QUALITY OVER QUANTITY: Generate only meaningful, verified updates that are completely different from ALL topics in the existing JSON above. Do not force additional updates if only 1-3 legitimate developments exist.

        For each completely unique update found, respond in this exact JSON format:
        [
            {{
                "title": "specific title about NEW country/sector/action not covered in existing JSON",
                "description": "comprehensive description of what was IMPLEMENTED/ENACTED, focusing on completely different topic from existing updates",
                "status": "implemented/enacted/active/in_effect",
                "announcement_date": "YYYY-MM-DD (prioritize dates from {two_months_ago.strftime('%Y-%m-%d')} onwards, must be on or after {self.min_update_date.strftime('%Y-%m-%d')})",
                "tariff_rate": "actual rate if specified or 'varies' or 'TBD'", 
                "affected_products": "detailed list of products/sectors (different from existing updates)",
                "source_titles": ["Article Title 1 - Source Name 1", "Article Title 2 - Source Name 2"],
                "last_verified": "{datetime.now().strftime('%Y-%m-%d')}",
                "confidence_level": "high"
            }}
        ]

        REQUIREMENTS:
        1. Each must be about completely different countries/sectors/actions than those in the existing JSON
        2. Each must have occurred on or after {min_date_str}, but prioritize developments from the last 2 months ({two_months_ago_str} to {current_date})
        3. Each must represent actual implementations, not proposals
        4. No overlap whatsoever with any topics in the existing JSON above
        5. Quality over quantity - only generate updates for verified, meaningful developments
        
        If you cannot find completely unique topics from recent months that avoid all existing content in the JSON, return fewer updates or an empty array [].
        """
        
        try:
            response = self.generate_with_gemini(prompt)
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                additional_updates = json.loads(json_str)
                
                # No need to enforce a hard limit - let Gemini generate what's appropriate
                if len(additional_updates) > 10:
                    print(f"Limiting to 10 updates (Gemini generated {len(additional_updates)})")
                    additional_updates = additional_updates[:10]
                
                # Filter updates based on date and source validation only (overlap handled by Gemini)
                valid_updates = []
                for update in additional_updates:
                    # Check date validity
                    announcement_date = update.get('announcement_date', '')
                    if not self.is_date_valid(announcement_date):
                        print(f"Rejecting update with invalid date: {announcement_date}")
                        continue
                    
                    # Validate sources (using relaxed validation)
                    if not self.validate_multiple_sources(update):
                        print(f"Rejecting update with insufficient sources: {update.get('title', '')[:50]}...")
                        continue
                    
                    valid_updates.append(update)
                
                print(f"Generated {len(valid_updates)} valid updates (filtered from {len(additional_updates)} candidates)")
                return valid_updates
            else:
                print("No additional updates found")
                return []
                
        except Exception as e:
            print(f"Error generating additional updates: {e}")
            return []
    
    def generate_specific_topic_update(self, topic: str, existing_updates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate an update on a specific topic."""
        min_date_str = self.min_update_date.strftime('%B %d, %Y')
        
        # Check if topic contains a specific date
        extracted_date = self.extract_date_from_topic(topic)
        if extracted_date:
            specific_date_str = extracted_date.strftime('%B %d, %Y')
            print(f"Found specific date in topic: {specific_date_str}")
        else:
            specific_date_str = None
        
        # Convert existing updates to JSON string for Gemini to read
        existing_updates_json = json.dumps(existing_updates, indent=2) if existing_updates else "[]"
        
        # Build date requirement based on whether specific date was found
        if specific_date_str:
            date_requirement = f"CRITICAL DATE REQUIREMENT: Focus EXCLUSIVELY on developments that occurred on {specific_date_str}. Do not include information from other dates unless absolutely necessary for context."
        else:
            date_requirement = f"CRITICAL DATE REQUIREMENT: Only include information about developments that occurred ON OR AFTER {min_date_str}."
        
        prompt = f"""
        Generate updates about the topic: "{topic}" - only create updates for actual, verified developments.

        {date_requirement}

        CRITICAL: Here are the existing tariff updates in the JSON file. Do NOT generate updates about any of these topics, countries, sectors, or events. Read through this carefully and avoid ALL overlap:

        EXISTING UPDATES JSON:
        {existing_updates_json}

        Study the existing updates above carefully. Your new updates about "{topic}" must avoid:
        - Any countries, regions, or trade relationships mentioned in the existing JSON
        - Any sectors, industries, or product categories covered in the existing JSON  
        - Any types of trade actions, policies, or events documented in the existing JSON
        - Any time periods, dates, or events already covered in the existing JSON
        - Any similar topics using different wording

        Research information about "{topic}" that is completely different from all existing content in the JSON above.

        FOCUS ON ACTIONS AND IMPLEMENTATIONS: {"Prioritize information about what has actually been IMPLEMENTED, ENACTED, or PUT INTO PRACTICE regarding the topic on the specific date mentioned." if specific_date_str else f"Prioritize information about what has actually been IMPLEMENTED, ENACTED, or PUT INTO PRACTICE regarding \"{topic}\" since {min_date_str}."}

        Research and create updates covering:
        {"- Specific actions and developments that occurred on " + specific_date_str if specific_date_str else f"- Current implementation status and actual developments since {min_date_str}"}
        {"- Concrete policy actions that were taken on " + specific_date_str if specific_date_str else f"- Concrete policy actions that have been taken since {min_date_str}"}
        - Real impacts and effects that are currently active
        - Affected sectors or products (different from existing JSON)
        {"- Timeline of what was implemented on " + specific_date_str if specific_date_str else f"- Timeline of what has been implemented and when (on or after {min_date_str})"}
        - Economic or political context of actual actions taken

        IMPORTANT SOURCE REQUIREMENTS:
        - Each update should have 1-2 reliable sources
        - Format as: "Article Title - Source Name"
        - Prioritize: Reuters, Bloomberg, BBC, CNN, Wall Street Journal, White House, USTR, Commerce Department
        - AVOID: Wikipedia, ITVX, alcircle, Trade War news, Profit by Pakistan Today, Business and Economy News

        QUALITY OVER QUANTITY: Generate only meaningful, verified updates about "{topic}" that are completely different from ALL topics in the existing JSON above. Do not force additional updates if only 1-2 legitimate developments exist.

        Respond in this exact JSON format:
        [
            {{
                "title": "specific title about ACTIONS/IMPLEMENTATIONS related to {topic} (different from existing JSON)",
                "description": "comprehensive description focusing on what has been IMPLEMENTED/ENACTED regarding {topic} since {min_date_str}, completely different from existing topics",
                "status": "implemented/enacted/active/in_effect/announced",
                "announcement_date": "YYYY-MM-DD when related action was taken ({"must be exactly " + extracted_date.strftime('%Y-%m-%d') if extracted_date else "must be on or after " + self.min_update_date.strftime('%Y-%m-%d')})",
                "tariff_rate": "actual rate if applicable or 'varies' or 'N/A'",
                "affected_products": "detailed list of affected products/sectors (different from existing JSON)",
                "source_titles": ["Article Title 1 - Source Name 1", "Article Title 2 - Source Name 2"],
                "last_verified": "{datetime.now().strftime('%Y-%m-%d')}",
                "confidence_level": "high",
                "user_requested_topic": "{topic}"
            }}
        ]

        {"If no reliable information about ACTUAL ACTIONS or IMPLEMENTATIONS is found about this topic that occurred on " + specific_date_str + " and avoids all existing content in the JSON, return an empty array []." if specific_date_str else f"If no reliable information about ACTUAL ACTIONS or IMPLEMENTATIONS is found about this topic that occurred on or after {min_date_str} and avoids all existing content in the JSON, return an empty array []."}
        """
        
        try:
            response = self.generate_with_gemini(prompt)
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                topic_updates = json.loads(json_str)
                
                # No need to enforce a hard limit - let Gemini generate what's appropriate
                if len(topic_updates) > 10:
                    print(f"Limiting to 10 updates for topic '{topic}' (Gemini generated {len(topic_updates)})")
                    topic_updates = topic_updates[:10]
                
                # Filter updates based on date and source validation only (overlap handled by Gemini)
                valid_updates = []
                for update in topic_updates:
                    # Check date validity
                    announcement_date = update.get('announcement_date', '')
                    if not self.is_date_valid(announcement_date):
                        print(f"Rejecting topic update with invalid date: {announcement_date}")
                        continue
                    
                    # If specific date was provided, ensure the update matches that date
                    if extracted_date:
                        parsed_announcement_date = self.parse_date(announcement_date)
                        if parsed_announcement_date and parsed_announcement_date.date() != extracted_date.date():
                            print(f"Rejecting topic update with date mismatch: {announcement_date} (expected {extracted_date.strftime('%Y-%m-%d')})")
                            continue
                    
                    # Validate sources
                    if not self.validate_multiple_sources(update):
                        print(f"Rejecting topic update with insufficient sources: {update.get('title', '')[:50]}...")
                        continue
                    
                    valid_updates.append(update)
                
                if valid_updates:
                    print(f"Generated {len(valid_updates)} valid update(s) for topic: {topic} (max 5)")
                    return valid_updates
                else:
                    print(f"No valid updates found for topic: {topic} (after filtering for date and sources)")
                    return []
            else:
                print(f"Failed to generate update for topic: {topic}")
                return []
                
        except Exception as e:
            print(f"Error generating update for topic '{topic}': {e}")
            return []

    def check_topic_coverage(self, topic: str, all_updates: List[Dict[str, Any]]) -> bool:
        """Check if a topic is already covered in existing updates."""
        if not topic:
            return False
            
        topic_lower = topic.lower()
        topic_words = set(topic_lower.split())
        
        # Remove common stopwords
        common_stopwords = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'must', 'trump', 'president', 'tariff', 'tariffs', 'trade', 'us', 'usa', 'united', 'states'}
        topic_meaningful_words = topic_words - common_stopwords
        
        if len(topic_meaningful_words) == 0:
            return False
        
        for update in all_updates:
            title = update.get('title', '').lower()
            description = update.get('description', '').lower()
            update_words = set((title + ' ' + description).split())
            update_meaningful_words = update_words - common_stopwords
            
            if len(update_meaningful_words) > 0:
                # Check for overlap - more lenient threshold since Gemini handles detailed overlap detection
                overlap = len(topic_meaningful_words.intersection(update_meaningful_words))
                topic_coverage = overlap / len(topic_meaningful_words) if len(topic_meaningful_words) > 0 else 0
                
                # If more than 70% of topic words are covered, consider it already covered (more lenient)
                if topic_coverage > 0.7:
                    return True
        
        return False

    def display_updates_for_approval(self, updates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Display generated updates and get user approval for specific ones."""
        if not updates:
            return []
        
        print(f"\n{'='*60}")
        print(f"Generated {len(updates)} tariff update(s):")
        print(f"{'='*60}")
        
        for i, update in enumerate(updates, 1):
            title = update.get('title', 'No title')
            date = update.get('announcement_date', 'No date')
            print(f"{i}. {title}")
            print(f"   Date: {date}")
            print()
        
        try:
            response = input(f"Which updates do you approve? (Enter numbers separated by commas, 'all' for all, or 'none' for none): ").strip().lower()
            
            if response == 'none':
                print("No updates approved.")
                return []
            elif response == 'all':
                print(f"All {len(updates)} updates approved!")
                return updates
            else:
                # Parse comma-separated numbers
                try:
                    selected_numbers = [int(num.strip()) for num in response.split(',')]
                    # Validate numbers are in range
                    valid_numbers = [num for num in selected_numbers if 1 <= num <= len(updates)]
                    
                    if not valid_numbers:
                        print("No valid update numbers provided. No updates approved.")
                        return []
                    
                    # Get the approved updates (convert to 0-based indexing)
                    approved_updates = [updates[num - 1] for num in valid_numbers]
                    print(f"Approved {len(approved_updates)} update(s): {', '.join(map(str, valid_numbers))}")
                    return approved_updates
                    
                except ValueError:
                    print("Invalid input format. No updates approved.")
                    return []
                    
        except KeyboardInterrupt:
            print("\nNo updates approved...")
            return []

    def generate_user_requested_updates(self, topic: str, all_existing_updates: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generate updates based on user request - either specific topic or Gemini's choice."""
        if topic:
            # Check if topic is already covered
            if self.check_topic_coverage(topic, all_existing_updates):
                print(f"Topic '{topic}' appears to already be covered in existing updates.")
                user_confirm = input("Would you like to generate an update anyway? (yes/no): ").strip().lower()
                if user_confirm not in ['yes', 'y']:
                    print("Skipping topic generation.")
                    return []
            
            # Generate update for specific topic
            potential_updates = self.generate_specific_topic_update(topic, all_existing_updates)
        else:
            # Let Gemini choose topics
            print("Letting Gemini choose relevant topics...")
            potential_updates = self.generate_additional_updates(all_existing_updates)
        
        # Get user approval for generated updates (returns approved updates)
        if potential_updates:
            approved_updates = self.display_updates_for_approval(potential_updates)
            return approved_updates
        else:
            print("No updates were generated.")
            return []
    
    def prompt_for_additional_updates(self) -> tuple[bool, str]:
        """Prompt user for additional update generation."""
        try:
            response = input("\nWould you like to generate additional updates? (yes/no): ").strip().lower()
            if response in ['yes', 'y']:
                topic = input("Enter a specific topic for the update (or press Enter to let Gemini choose): ").strip()
                return True, topic
            return False, ""
        except KeyboardInterrupt:
            print("\nSkipping additional updates...")
            return False, ""
    
    def create_clean_version(self, gemini_updates: List[Dict], country_tariffs: List[Dict]) -> Dict[str, Any]:
        """Create a clean version for public viewing."""
        
        # Collect all source names
        all_source_names = set()
        
        # Clean gemini updates - remove internal fields and collect sources
        clean_gemini_updates = []
        for update in gemini_updates:
            clean_update = {
                "title": update.get("title", ""),
                "description": update.get("description", ""),
                "status": update.get("status", ""),
                "announcement_date": update.get("announcement_date", ""),
                "tariff_rate": update.get("tariff_rate", ""),
                "affected_products": update.get("affected_products", "")
            }
            clean_gemini_updates.append(clean_update)
            
            # Extract source names
            source_titles = update.get("source_titles", [])
            if source_titles:
                source_names = self.extract_source_names(source_titles)
                all_source_names.update(source_names)
        
        # Clean country tariffs - remove internal fields
        clean_country_tariffs = []
        for tariff in country_tariffs:
            clean_tariff = {
                "country": tariff.get("country", ""),
                "tariff_charged_to_usa": tariff.get("tariff_charged_to_usa", ""),
                "usa_reciprocal_tariff": tariff.get("usa_reciprocal_tariff", "")
            }
            clean_country_tariffs.append(clean_tariff)
        
        return {
            "updates": clean_gemini_updates,
            "country_tariffs": clean_country_tariffs,
            "sources": sorted(list(all_source_names)),  # Alphabetically sorted list of unique sources
            "last_updated": datetime.now().strftime('%Y-%m-%d'),
            "minimum_update_date": self.min_update_date.strftime('%Y-%m-%d')
        }
    
    def save_analysis(self, dirty_data: Dict[str, Any], clean_data: Dict[str, Any]):
        """Save both the detailed analysis and clean version to JSON files."""
        try:
            # Get the script directory and navigate to public/data
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.join(script_dir, '..', '..', '..')
            public_data_dir = os.path.join(project_root, 'public', 'data')
            
            # Create the directory if it doesn't exist
            os.makedirs(public_data_dir, exist_ok=True)
            
            # Save detailed/dirty version to public/data
            public_detailed_file = os.path.join(public_data_dir, 'gemini_tariff_analysis.json')
            with open(public_detailed_file, 'w', encoding='utf-8') as f:
                json.dump(dirty_data, f, indent=2, ensure_ascii=False)
            print(f"Detailed analysis saved to {public_detailed_file}")
            
            # Save clean version to public/data
            public_clean_file = os.path.join(public_data_dir, 'tariff_data_clean.json')
            with open(public_clean_file, 'w', encoding='utf-8') as f:
                json.dump(clean_data, f, indent=2, ensure_ascii=False)
            print(f"Clean version saved to {public_clean_file}")
            
            # Also save to local directory for backward compatibility
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(dirty_data, f, indent=2, ensure_ascii=False)
            print(f"Detailed analysis also saved locally to {self.output_file}")
            
            with open(self.clean_output_file, 'w', encoding='utf-8') as f:
                json.dump(clean_data, f, indent=2, ensure_ascii=False)
            print(f"Clean version also saved locally to {self.clean_output_file}")
            
        except Exception as e:
            print(f"Error saving analysis: {e}")
            sys.exit(1)
    
    def run_analysis(self):
        """Main analysis runner."""
        print("Starting Tariff Data Analysis with Gemini 2.0 Flash...")
        print(f"Only generating updates from {self.min_update_date.strftime('%B %d, %Y')} onwards")
        print("Maximum 5 new updates per generation request")
        print("General updates focus on last 2 months; topic-specific updates can be older")
        print("Overlap detection handled by Gemini reading existing JSON data")
        print("Selective approval: choose specific updates by number")
        print()
        
        # Load data
        source_data = self.load_source_data()
        existing_data = self.load_existing_analysis()
        
        # Check if update is needed
        if not self.needs_update(source_data, existing_data):
            print("No update needed based on timestamps.")
            
            # Check if clean data needs to be regenerated
            if self.needs_clean_data_update() and existing_data:
                print("Regenerating clean data...")
                
                # Load existing data
                existing_gemini = existing_data.get('gemini_generated_updates', [])
                enhanced_country_tariffs = existing_data.get('enhanced_country_tariffs', [])
                
                # Create clean data with sources
                clean_data = self.create_clean_version(
                    existing_gemini, 
                    enhanced_country_tariffs
                )
                
                # Save only the clean version
                try:
                    with open(self.clean_output_file, 'w', encoding='utf-8') as f:
                        json.dump(clean_data, f, indent=2, ensure_ascii=False)
                    print(f"Clean version updated: {self.clean_output_file}")
                    print(f"Found {len(clean_data.get('sources', []))} unique sources")
                except Exception as e:
                    print(f"Error updating clean data: {e}")
            
            # Still prompt user for additional updates
            wants_more, topic = self.prompt_for_additional_updates()
            
            if wants_more:
                print("Generating additional updates (maximum 5)...")
                # Load existing data for overlap checking
                existing_gemini = existing_data.get('gemini_generated_updates', []) if existing_data else []
                
                # Generate user-requested updates with approval
                user_requested_updates = self.generate_user_requested_updates(topic, existing_gemini)
                
                if user_requested_updates:
                    # Update existing data
                    updated_gemini = existing_gemini + user_requested_updates
                    
                    # Update dirty data
                    existing_data["gemini_generated_updates"] = updated_gemini
                    existing_data["analysis_summary"]["total_gemini_updates"] = len(updated_gemini)
                    existing_data["analysis_summary"]["user_requested_updates"] = len(user_requested_updates)
                    existing_data["analysis_timestamp"] = datetime.now().isoformat()
                    
                    # Create clean data
                    clean_data = self.create_clean_version(
                        updated_gemini, 
                        existing_data.get('enhanced_country_tariffs', [])
                    )
                    
                    # Save updated data
                    self.save_analysis(existing_data, clean_data)
                    print(f"Successfully added {len(user_requested_updates)} approved update(s)!")
                else:
                    print("No updates were approved or generated.")
            else:
                print("No additional updates requested.")
            
            return
        
        print("Running full analysis...")
        
        print("Using original country tariff data...")
        enhanced_country_tariffs = self.analyze_country_tariffs(source_data)
        
        # Don't automatically generate new updates when doing timestamp-based update
        # Only update the country tariff data
        existing_gemini = existing_data.get('gemini_generated_updates', []) if existing_data else []
        
        # Compile detailed/dirty data with existing gemini updates
        dirty_data = {
            "analysis_timestamp": datetime.now().isoformat(),
            "source_timestamp": source_data.get('timestamp', ''),
            "source_file": self.source_file,
            "gemini_generated_updates": existing_gemini,  # Keep existing updates
            "enhanced_country_tariffs": enhanced_country_tariffs,
            "analysis_summary": {
                "total_gemini_updates": len(existing_gemini),
                "new_gemini_updates": 0,  # No new updates in timestamp-based update
                "total_countries_analyzed": len(enhanced_country_tariffs),
                "minimum_update_date": self.min_update_date.strftime('%Y-%m-%d'),
                "analysis_method": "Google Gemini 2.0 Flash (without external tools due to API limitations)",
                "update_type": "country_tariffs_only"
            }
        }
        
        # Create clean version
        clean_data = self.create_clean_version(
            existing_gemini,  # Use existing updates
            enhanced_country_tariffs
        )
        
        self.save_analysis(dirty_data, clean_data)
        print("Country tariff data analysis complete!")
        
        # Prompt user for additional updates
        wants_more, topic = self.prompt_for_additional_updates()
        
        if wants_more:
            print("Generating additional updates (maximum 5)...")
            
            # Use existing gemini updates for overlap checking
            user_requested_updates = self.generate_user_requested_updates(topic, existing_gemini)
            
            if user_requested_updates:
                # Update data
                updated_gemini_updates = existing_gemini + user_requested_updates
                
                dirty_data["gemini_generated_updates"] = updated_gemini_updates
                dirty_data["analysis_summary"]["total_gemini_updates"] = len(updated_gemini_updates)
                dirty_data["analysis_summary"]["user_requested_updates"] = len(user_requested_updates)
                dirty_data["analysis_summary"]["update_type"] = "country_tariffs_and_new_updates"
                
                clean_data = self.create_clean_version(
                    updated_gemini_updates, 
                    enhanced_country_tariffs
                )
                
                self.save_analysis(dirty_data, clean_data)
                print(f"Successfully added {len(user_requested_updates)} approved update(s)!")
            else:
                print("No updates were approved or generated.")
        else:
            print("No additional updates requested.")

def main():
    """Main function."""
    # Get API key from environment variable
    api_key = os.environ.get("GEMINI_API_KEY_2")
    
    if not api_key:
        print("Error: GEMINI_API_KEY_2 environment variable not set!")
        print("Please set it using:")
        print("  Linux/Mac: export GEMINI_API_KEY_2='your_api_key_here'")
        print("  Windows: set GEMINI_API_KEY_2=your_api_key_here")
        print("  Or add it to your .env file")
        sys.exit(1)
    
    try:
        analyzer = TariffAnalyzer(api_key)
        analyzer.run_analysis()
    except KeyboardInterrupt:
        print("\nAnalysis interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()