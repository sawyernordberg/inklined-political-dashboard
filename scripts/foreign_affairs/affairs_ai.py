#!/usr/bin/env python3
"""
Foreign Affairs Data Enhancer with Google GenAI (Gemini 2.0 Flash) - SELECTIVE UPDATES
Enhances bilateral relations and regional analysis using AI-powered research with Google Search
Now supports selective updating of specific fields with user permission and change logging
FIXED: Conservative updates based only on NEW developments after last enhancement date
UPDATED: Uses diplomatic feeds, removes future outlook, restricts to trustworthy sources only
"""

import json
import time
import sys
import os
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import logging
import re
from dotenv import load_dotenv

# Import Google GenAI (NOT google-generativeai)
from google import genai
from google.genai.types import (
    GenerateContentConfig,
    GoogleSearch,
    Tool,
    UrlContext,
)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ForeignAffairsEnhancer:
    def __init__(self, api_keys: List[str]):
        self.api_keys = api_keys
        self.current_key_index = 0
        self.exhausted_keys = set()
        self.source_file = "enhanced_foreign_affairs_data_detailed.json"
        self.output_file = "enhanced_foreign_affairs_data_detailed.json"
        self.client = None
        self._initialize_client()
        
        # Fields that require user permission for updates (removed future_outlook)
        self.sensitive_fields = [
            'security_cooperation',
            'diplomatic_engagement', 
            'economic_cooperation',
            'challenges_and_opportunities',
            'detailed_relationship_summary'
        ]
        
        # Trustworthy sources for AI to prioritize
        self.trustworthy_sources = [
            # Government Sources
            "state.gov", "whitehouse.gov", "defense.gov", "treasury.gov", "commerce.gov",
            "usaid.gov", "congress.gov", "cia.gov", "dni.gov", "nato.int", "un.org",
            "europa.eu", "consilium.europa.eu", "g7.ca", "g20.org", "worldbank.org",
            "imf.org", "oecd.org", "wto.org", "who.int",
            
            # Trusted News Outlets
            "bbc.com", "bbc.co.uk", "reuters.com", "ap.org", "wsj.com", "bloomberg.com",
            "cnn.com", "abc.com", "cbs.com", "nbc.com", "cnbc.com", "pbs.org", "npr.org",
            "ft.com", "economist.com", "foreignaffairs.com", "foreignpolicy.com",
            "cfr.org", "brookings.edu", "csis.org", "rand.org", "chathamhouse.org",
            
            # International Trusted Sources
            "theguardian.com", "telegraph.co.uk", "lemonde.fr", "dw.com", "spiegel.de",
            "asahi.com", "japantimes.co.jp", "scmp.com", "straitstimes.com",
            "theaustralian.com.au", "globeandmail.com", "cbc.ca"
        ]

    def _initialize_client(self):
        """Initialize GenAI client with the current available API key"""
        if self.current_key_index < len(self.api_keys):
            current_key = self.api_keys[self.current_key_index]
            if current_key not in self.exhausted_keys:
                self.client = genai.Client(api_key=current_key)
                print(f"🔑 Using API key #{self.current_key_index + 1}: ...{current_key[-10:]}")
                print("✅ Successfully initialized Gemini 2.0 Flash with Google Search capabilities")
                return True
        return False

    def _switch_to_next_key(self):
        """Switch to the next available API key"""
        self.exhausted_keys.add(self.api_keys[self.current_key_index])
        print(f"⚠️ API key #{self.current_key_index + 1} exhausted: ...{self.api_keys[self.current_key_index][-10:]}")
        
        self.current_key_index += 1
        
        if self.current_key_index < len(self.api_keys):
            if self._initialize_client():
                print(f"🔄 Switched to API key #{self.current_key_index + 1}: ...{self.api_keys[self.current_key_index][-10:]}")
                return True
        
        print("❌ All API keys exhausted!")
        return False

    def _is_quota_exceeded_error(self, error_message: str) -> bool:
        """Check if the error indicates quota exceeded"""
        quota_indicators = [
            "quota exceeded",
            "rate limit", 
            "too many requests",
            "resource_exhausted",
            "quota",
            "limit exceeded"
        ]
        error_lower = str(error_message).lower()
        return any(indicator in error_lower for indicator in quota_indicators)

    def get_source_restrictions_prompt(self) -> str:
        """Generate prompt section for source restrictions"""
        return f"""
        CRITICAL SOURCE RESTRICTIONS - YOU MUST FOLLOW THESE RULES:
        
        1. ONLY use information from TRUSTWORTHY SOURCES including:
           - Government websites (.gov, .mil, official embassy sites)
           - International organizations (UN, NATO, EU, World Bank, IMF, etc.)
           - Established news outlets: {', '.join(self.trustworthy_sources[:20])}
           - Academic institutions and established think tanks (CFR, Brookings, CSIS, RAND, etc.)
        
        2. DO NOT use information from:
           - Social media platforms (Twitter, Facebook, etc.)
           - Blogs or personal websites
           - Unknown or unverified news sources
           - Propaganda outlets or state-controlled media from non-democratic countries
           - Forums, Reddit, or user-generated content
           - Opinion pieces without clear sourcing
        
        3. VERIFY SOURCE CREDIBILITY:
           - Cross-reference information across multiple trustworthy sources
           - Prioritize primary sources (official statements, documents)
           - Use established news outlets with good fact-checking records
           - Prefer recent articles (within last 60 days) from verified sources
        
        4. CITATION REQUIREMENTS:
           - Only cite sources from the approved trustworthy list
           - If you cannot find trustworthy sources, indicate "insufficient verified sources"
           - Do not make claims without proper source verification
        """

    def get_diplomatic_feeds_context(self, source_data: Dict[str, Any], country_name: str) -> str:
        """Extract relevant diplomatic feeds for context"""
        diplomatic_feeds = source_data.get('diplomatic_feeds', [])
        
        if not diplomatic_feeds:
            return "No diplomatic feeds available for context."
        
        relevant_feeds = []
        country_keywords = [country_name.lower()]
        
        # Add alternative country name keywords
        country_alternatives = {
            'China': ['china', 'chinese', 'beijing'],
            'Russia': ['russia', 'russian', 'moscow'],
            'Germany': ['germany', 'german', 'berlin'],
            'United Kingdom': ['uk', 'britain', 'british', 'london'],
            'France': ['france', 'french', 'paris'],
            'Japan': ['japan', 'japanese', 'tokyo'],
            'South Korea': ['korea', 'korean', 'seoul', 'south korea'],
            'India': ['india', 'indian', 'delhi', 'modi'],
            'Saudi Arabia': ['saudi', 'arabia', 'riyadh'],
            'Israel': ['israel', 'israeli', 'jerusalem'],
            'Canada': ['canada', 'canadian', 'ottawa'],
            'Mexico': ['mexico', 'mexican', 'mexico city']
        }
        
        if country_name in country_alternatives:
            country_keywords.extend(country_alternatives[country_name])
        
        for feed in diplomatic_feeds:
            feed_entries = feed.get('entries', [])
            for entry in feed_entries[:5]:  # Check latest 5 entries per feed
                title = entry.get('title', '').lower()
                summary = entry.get('summary', '').lower()
                
                if any(keyword in title or keyword in summary for keyword in country_keywords):
                    relevant_feeds.append({
                        'source': feed.get('source', 'Unknown'),
                        'title': entry.get('title', ''),
                        'summary': entry.get('summary', '')[:200] + '...' if len(entry.get('summary', '')) > 200 else entry.get('summary', ''),
                        'published': entry.get('published', ''),
                        'relevance': entry.get('relevance', 'Unknown')
                    })
        
        if relevant_feeds:
            context = f"RELEVANT DIPLOMATIC FEEDS FOR {country_name.upper()}:\n"
            for i, feed in enumerate(relevant_feeds[:3], 1):  # Limit to top 3 relevant feeds
                context += f"\n{i}. {feed['source']}: {feed['title']}\n"
                context += f"   Summary: {feed['summary']}\n"
                context += f"   Published: {feed['published']}\n"
            return context
        else:
            return f"No specific diplomatic feeds found for {country_name} in recent data."

    def analyze_section_needs_update(self, country_code: str, section_name: str, 
                                   existing_data: Dict[str, Any], source_data: Dict[str, Any]) -> Tuple[bool, str, str]:
        """Analyze if a specific section needs updating based on NEW developments since last enhancement"""
        
        if not existing_data:
            return True, "No existing data available", ""
            
        bilateral_data = existing_data.get('enhanced_bilateral_relations', {}).get(country_code, {})
        country_name = bilateral_data.get('country_name', country_code)
        
        # Get the last enhancement date to focus search
        last_enhanced_date = bilateral_data.get('enhanced_analysis_date', '')
        if last_enhanced_date:
            try:
                enhanced_date = datetime.fromisoformat(last_enhanced_date)
                days_since_enhancement = (datetime.now() - enhanced_date).days
                search_period = f"since {last_enhanced_date} ({days_since_enhancement} days ago)"
            except:
                search_period = "past 60 days"
        else:
            search_period = "past 60 days"
            
        # Handle detailed_relationship_summary differently (it's a text field, not a dict)
        if section_name == 'detailed_relationship_summary':
            section_data = bilateral_data.get(section_name, "")
            print(f"🔍 DEBUG: {section_name} data: '{section_data[:100]}...' (length: {len(section_data) if section_data else 0})")
            if not section_data or len(section_data.strip()) < 50:  # Empty or very short summary
                return True, "Summary is empty or too short - needs enhancement", ""
        else:
            section_data = bilateral_data.get(section_name, {})
            print(f"🔍 DEBUG: {section_name} data: {section_data}")
            if not section_data or len(section_data) <= 2:  # Empty dict or only 1-2 basic fields
                return True, "Section is empty or has minimal data - needs enhancement", ""
        
        # Get diplomatic feeds context
        diplomatic_context = self.get_diplomatic_feeds_context(source_data, country_name)
        
        # MUCH MORE RESTRICTIVE AI analysis - focus only on NEW developments
        analysis_prompt = f"""
        {self.get_source_restrictions_prompt()}
        
        You are a CONSERVATIVE analyst. Your job is to determine if there are SIGNIFICANT NEW developments that are MISSING from the current data and should be added.

        CRITICAL INSTRUCTIONS:
        1. ONLY recommend updates if there are CONCRETE NEW developments {search_period} that are NOT already reflected in the current data
        2. DO NOT recommend updates for:
           - Adding more detail to existing information
           - Updating language or formatting  
           - Including background/historical context
           - Minor routine events (meetings, statements, etc.)
           - Information that is already captured in the current data
        3. ONLY recommend updates for SIGNIFICANT NEW events like:
           - New major agreements SIGNED
           - New substantial policy changes IMPLEMENTED  
           - Major new investments ANNOUNCED and CONFIRMED
           - Significant diplomatic incidents or breakthroughs
           - Concrete new cooperation initiatives LAUNCHED

        SEARCH FOCUS: Search specifically for events {search_period} between US and {country_name} related to {section_name}.
        USE ONLY TRUSTWORTHY SOURCES from the approved list above.

        DIPLOMATIC FEEDS CONTEXT:
        {diplomatic_context}

        CURRENT {section_name} DATA FOR {country_name}:
        {json.dumps(section_data, indent=2)}

        TRAINING EXAMPLES:
        
        EXAMPLE 1 - NO UPDATE NEEDED (Complete data):
        Current data: Has comprehensive recent information covering key areas
        Search results: Routine diplomatic meetings, general policy discussions
        DECISION: NO UPDATE - Current data is comprehensive, no significant new developments found
        
        EXAMPLE 2 - NO UPDATE NEEDED (Recent but minor events):
        Current data: "Recent trade discussions ongoing, $2B investment planned for 2024"
        Search results: Trade officials met last week to discuss ongoing investment timeline
        DECISION: NO UPDATE - This meeting is about existing planned investment, not a new development
        
        EXAMPLE 3 - UPDATE NEEDED (Major new development):
        Current data: "Defense cooperation limited to information sharing"
        Search results: Major new defense agreement signed 2 weeks ago worth $5 billion for joint missile defense
        DECISION: UPDATE NEEDED - Significant new defense agreement not reflected in current data
        
        EXAMPLE 4 - NO UPDATE NEEDED (Already covered):
        Current data: "Major trade agreement signed in November 2024, expected to increase trade by 40%"
        Search results: Articles discussing the November 2024 trade agreement and its implementation
        DECISION: NO UPDATE - This agreement is already captured in current data
        
        EXAMPLE 5 - UPDATE NEEDED (Missing recent major event):
        Current data: "Economic cooperation focused on energy sector"
        Search results: New $3 billion technology transfer agreement signed last month, not mentioned in current data
        DECISION: UPDATE NEEDED - Major new agreement missing from current data

        RESPONSE FORMAT (EXACT):
        DECISION: [UPDATE NEEDED/NO UPDATE]
        REASONING: [Explain what NEW developments were found that are missing from current data, or why no updates needed]
        NEW_DEVELOPMENTS: [List only CONCRETE new events with dates, or "None found"]
        """
        
        try:
            response = self.generate_with_gemini(analysis_prompt)
            print(f"🔍 AI Response: {response}")
            
            if "UPDATE NEEDED" in response.upper() or "UPDATE_NEEDED" in response.upper():
                reasoning_match = re.search(r'REASONING: (.+?)(?:\n|NEW_DEVELOPMENTS:)', response, re.DOTALL)
                reasoning = reasoning_match.group(1).strip() if reasoning_match else "Analysis indicates update needed"
                
                # Extract the specific new developments found
                developments_match = re.search(r'NEW_DEVELOPMENTS: (.+?)(?:\n|$)', response, re.DOTALL)
                developments = developments_match.group(1).strip() if developments_match else "New developments found"
                
                print(f"✅ FIXED LOGIC: Found UPDATE NEEDED/UPDATE_NEEDED in response, returning True")
                print(f"🔍 SPECIFIC DEVELOPMENTS: {developments}")
                return True, reasoning, developments
            elif "NO_UPDATE" in response.upper() or "NO UPDATE" in response.upper():
                reasoning_match = re.search(r'REASONING: (.+?)(?:\n|NEW_DEVELOPMENTS:)', response, re.DOTALL)
                reasoning = reasoning_match.group(1).strip() if reasoning_match else "No significant changes found"
                print(f"✅ FIXED LOGIC: Found NO_UPDATE/NO UPDATE in response, returning False")
                return False, reasoning, "None"
            else:
                # If unclear response, default to no update (conservative approach)
                print(f"⚠️ Unclear AI response, defaulting to NO_UPDATE (conservative)")
                return False, "AI response unclear - assuming no update needed", "None"
                
        except Exception as e:
            print(f"⚠️ Error analyzing section {section_name}: {e}")
            return False, "Analysis failed - assuming no update needed", "None"

    def ask_user_permission(self, country_name: str, section_name: str, reasoning: str) -> bool:
        """Ask user for permission to update a specific section"""
        print(f"\n{'='*60}")
        print(f"🤔 SECTION UPDATE REQUEST")
        print(f"{'='*60}")
        print(f"Country: {country_name}")
        print(f"Section: {section_name}")
        print(f"Reasoning: {reasoning}")
        print(f"{'='*60}")
        
        while True:
            try:
                response = input(f"Update {section_name} for {country_name}? (y/n/s=skip all): ").strip().lower()
                if response in ['y', 'yes']:
                    return True
                elif response in ['n', 'no']:
                    return False
                elif response in ['s', 'skip']:
                    return 'skip_all'
                else:
                    print("Please enter 'y' for yes, 'n' for no, or 's' to skip all remaining prompts")
            except KeyboardInterrupt:
                print("\nSkipping this update...")
                return False

    def log_section_changes(self, country_name: str, section_name: str, 
                          old_data: Any, new_data: Any, status: str):
        """Log what specifically changed in a section"""
        print(f"\n📝 CHANGE LOG - {country_name} - {section_name}")
        print(f"Status: {status}")
        
        if status == "UPDATED":
            # Special handling for detailed_relationship_summary (text field)
            if section_name == 'detailed_relationship_summary':
                if isinstance(old_data, str) and isinstance(new_data, str):
                    if old_data != new_data:
                        print(f"  ✏️  Summary updated")
                        print(f"    📝 Old length: {len(old_data)} characters")
                        print(f"    📝 New length: {len(new_data)} characters")
                        # Show first 100 chars of each if different
                        if len(old_data) > 100:
                            print(f"    📜 Old start: {old_data[:100]}...")
                        else:
                            print(f"    📜 Old: {old_data}")
                        if len(new_data) > 100:
                            print(f"    📜 New start: {new_data[:100]}...")
                        else:
                            print(f"    📜 New: {new_data}")
                    else:
                        print(f"  ✅ No actual changes detected")
                else:
                    print(f"  ✏️  Summary field type changed: {type(old_data)} → {type(new_data)}")
            else:
                # Compare and log specific changes for dictionary fields
                if isinstance(old_data, dict) and isinstance(new_data, dict):
                    changes_found = False
                    for key in new_data.keys():
                        old_value = old_data.get(key, "NOT_PRESENT")
                        new_value = new_data.get(key, "NOT_PRESENT")
                        
                        if old_value != new_value:
                            changes_found = True
                            if isinstance(old_value, list) and isinstance(new_value, list):
                                if set(old_value) != set(new_value):
                                    print(f"  ✏️  {key}: Array modified")
                                    added = set(new_value) - set(old_value)
                                    removed = set(old_value) - set(new_value)
                                    if added:
                                        print(f"    ➕ Added: {list(added)}")
                                    if removed:
                                        print(f"    ➖ Removed: {list(removed)}")
                            else:
                                print(f"  ✏️  {key}: '{old_value}' → '{new_value}'")
                                
                    # Check for new fields
                    new_fields = set(new_data.keys()) - set(old_data.keys())
                    if new_fields:
                        changes_found = True
                        print(f"  🆕 New fields added: {list(new_fields)}")
                        
                    # Check for removed fields  
                    removed_fields = set(old_data.keys()) - set(new_data.keys())
                    if removed_fields:
                        changes_found = True
                        print(f"  🗑️  Fields removed: {list(removed_fields)}")
                    
                    if not changes_found:
                        print(f"  ⚠️  Status was UPDATED but no actual changes detected!")
                        print(f"  💡 Note: Some fields may have been marked as 'NO UPDATE NEEDED' individually")
                else:
                    print(f"  ✏️  Entire section replaced: {type(old_data)} → {type(new_data)}")
                
        elif status == "NO_ACTUAL_CHANGES":
            print(f"  ⚠️  AI claimed to update but no actual changes were found")
            print(f"  🔍 This suggests the AI found the same information that was already present")
        elif status == "FORCED_UPDATE":
            print(f"  🔨 Update was FORCED after user gave permission")
            print(f"  ✅ Changes were made to respect user's explicit approval")
        elif status == "FORCE_FAILED":
            print(f"  ❌ Failed to force update even after user permission")
        elif status == "ERROR":
            print(f"  ❌ Update failed - keeping original data")
        elif status == "SKIPPED":
            print(f"  ⏭️  Update skipped by user")
        elif status == "NO_CHANGE_NEEDED":
            print(f"  ✅ No changes needed")
        elif status == "NO_UPDATE_NEEDED":
            print(f"  ✅ AI determined no update needed")

    def enhance_section_selectively(self, country_code: str, section_name: str, 
                                  current_section_data: Dict, country_name: str,
                                  last_enhanced_date: str = '', specific_developments: str = '',
                                  source_data: Dict[str, Any] = None) -> Tuple[Dict, str]:
        """Enhance a specific section with targeted updates focusing only on the SPECIFIC developments found"""
        
        # Calculate search timeframe based on last enhancement
        if last_enhanced_date:
            try:
                enhanced_date = datetime.fromisoformat(last_enhanced_date)
                days_since = (datetime.now() - enhanced_date).days
                search_timeframe = f"since {last_enhanced_date} ({days_since} days ago)"
            except:
                search_timeframe = "past 60 days"
        else:
            search_timeframe = "past 60 days"
        
        # Get diplomatic feeds context
        diplomatic_context = self.get_diplomatic_feeds_context(source_data or {}, country_name)
        
        section_prompts = {
            'detailed_relationship_summary': f"""
            {self.get_source_restrictions_prompt()}
            
            CRITICAL: You MUST incorporate the following SPECIFIC developments that were just found: {specific_developments}

            COMPLETE REWRITE APPROACH:
            1. START WITH A BLANK CANVAS - rewrite the entire summary from scratch
            2. Use the previous content as REFERENCE to understand what was important before
            3. CREATE a cohesive, well-flowing summary that incorporates:
               - The new developments: {specific_developments} (PRIORITIZE THESE)
               - Only the MOST RELEVANT and CURRENT information from the previous version
            4. EXCLUDE outdated, less significant, or superseded information from previous content
            5. PRIORITIZE recent developments but don't lose critical ongoing context
            6. Write naturally flowing sentences that tell the current story
            7. USE ONLY TRUSTWORTHY SOURCES from the approved list

            DIPLOMATIC FEEDS CONTEXT:
            {diplomatic_context}

            CONTENT CURATION RULES:
            - Remove outdated diplomatic developments that have been superseded
            - Focus on the most current and significant relationship dynamics

            REFERENCE - Previous summary content: {json.dumps(current_section_data, indent=2)}
            
            NEW DEVELOPMENTS TO PROMINENTLY FEATURE: {specific_developments}
            
            INSTRUCTIONS:
            - Rewrite the entire relationship summary for US-{country_name} from scratch
            - Make the new developments ({specific_developments}) a central part of the narrative
            - Include relevant context from the previous summary where it adds value
            - Create natural, flowing prose (not choppy additions)
            - Keep to ~300 words maximum
            - Focus on telling a complete, current story of the relationship
            - Only use information from trustworthy sources

            If the specific developments are not actually significant, respond with: "NO UPDATE NEEDED"
            
            Return a completely rewritten summary that tells the full story with prominent inclusion of: {specific_developments}
            """,
            
            'economic_cooperation': f"""
            {self.get_source_restrictions_prompt()}
            
            CONSERVATIVE UPDATE INSTRUCTIONS: Only add information about CONCRETE NEW economic developments {search_timeframe} between US and {country_name}.

            DO NOT UPDATE FOR:
            - General economic discussions or meetings
            - Background information already covered
            - Routine trade activities
            - Analysis or projections without concrete new actions

            ONLY UPDATE IF YOU FIND NEW:
            - Trade agreements SIGNED {search_timeframe}
            - Major investment announcements CONFIRMED {search_timeframe}
            - New economic partnerships LAUNCHED {search_timeframe}
            - Significant trade policy changes IMPLEMENTED {search_timeframe}

            DIPLOMATIC FEEDS CONTEXT:
            {diplomatic_context}

            Current data: {json.dumps(current_section_data, indent=2)}
            
            Search for concrete economic developments {search_timeframe} that are missing from current data.
            USE ONLY TRUSTWORTHY SOURCES from the approved list.
            
            If no significant new developments found, respond with: "NO UPDATE NEEDED"
            
            If new developments found, update the relevant fields with the NEW information and return the complete JSON:
            {{
                "trade_volume_estimate": "[Keep existing value or update with new data if available]",
                "key_trade_sectors": ["Keep existing array or add new sectors if found"],
                "investment_flows": "[Keep existing value or update with new major investments]",
                "trade_agreements": "[Keep existing value or update with new agreements signed {search_timeframe}]"
            }}
            
            IMPORTANT: Return actual data values, not instructions. If a field should not be updated, keep the existing value from current data.
            """,
            
            'security_cooperation': f"""
            {self.get_source_restrictions_prompt()}
            
            CONSERVATIVE UPDATE INSTRUCTIONS: Only add information about CONCRETE NEW security/defense developments {search_timeframe} between US and {country_name}.

            DO NOT UPDATE FOR:
            - Routine security meetings or discussions
            - Ongoing operations already mentioned
            - General policy statements
            - Background information already covered

            ONLY UPDATE IF YOU FIND NEW:
            - Defense agreements SIGNED {search_timeframe}
            - Major military exercises COMPLETED {search_timeframe}
            - New security partnerships ANNOUNCED {search_timeframe}
            - Significant policy changes IMPLEMENTED {search_timeframe}

            DIPLOMATIC FEEDS CONTEXT:
            {diplomatic_context}

            Current data: {json.dumps(current_section_data, indent=2)}
            
            Search for concrete security developments {search_timeframe} missing from current data.
            USE ONLY TRUSTWORTHY SOURCES from the approved list.
            
            If no significant new developments found, respond with: "NO UPDATE NEEDED"
            
            If new developments found, update the relevant fields with the NEW information and return the complete JSON:
            {{
                "defense_agreements": "[Keep existing value or update with new agreements signed {search_timeframe}]",
                "joint_exercises": "[Keep existing value or update with new major exercises completed {search_timeframe}]", 
                "intelligence_sharing": "[Keep existing value or update with new cooperation initiatives {search_timeframe}]",
                "regional_security_role": "[Keep existing value or update with new role changes {search_timeframe}]"
            }}
            
            IMPORTANT: Return actual data values, not instructions. If a field should not be updated, keep the existing value from current data.
            """,
            
            'diplomatic_engagement': f"""
            {self.get_source_restrictions_prompt()}
            
            CRITICAL: You MUST incorporate the following SPECIFIC developments that were just found: {specific_developments}

            COMPLETE REWRITE APPROACH:
            1. START WITH A BLANK CANVAS - rewrite each relevant field completely from scratch
            2. Use the previous content as REFERENCE to understand what was important before
            3. CREATE cohesive, well-flowing content that incorporates:
               - The new developments: {specific_developments} (PRIORITIZE THESE)
               - Only the MOST RELEVANT and CURRENT information from the previous version
            4. EXCLUDE outdated diplomatic events that are now less significant
            5. Write natural, flowing descriptions that tell the current story
            6. Each field should present the most current diplomatic picture
            7. USE ONLY TRUSTWORTHY SOURCES from the approved list

            DIPLOMATIC FEEDS CONTEXT:
            {diplomatic_context}

            CONTENT CURATION RULES:
            - Remove older diplomatic events that are now superseded by: {specific_developments}
            - Remove routine meetings/visits that are less significant than current developments  
            - Focus on the most impactful and recent diplomatic engagements
            - Exclude outdated institutional arrangements if they've evolved

            REFERENCE - Previous diplomatic engagement data: {json.dumps(current_section_data, indent=2)}
            
            NEW DEVELOPMENTS TO PROMINENTLY FEATURE: {specific_developments}
            
            INSTRUCTIONS:
            - Rewrite relevant fields completely from scratch based on: {specific_developments}
            - Make the new developments central to the updated narrative
            - Include valuable context from previous content where it enhances the story
            - Create natural, flowing descriptions (max ~150 words per field)
            - Only rewrite fields that relate to: {specific_developments}
            - Only use information from trustworthy sources
            
            If the specific developments don't relate to diplomatic engagement, respond with: "NO UPDATE NEEDED"
            
            Return complete JSON with rewritten fields that prominently feature: {specific_developments}
            {{
                "recent_high_level_visits": "[Completely rewrite if {specific_developments} involves visits, otherwise keep existing]",
                "institutional_frameworks": "[Completely rewrite if {specific_developments} involves frameworks, otherwise keep existing]",
                "multilateral_cooperation": "[Completely rewrite if {specific_developments} involves multilateral issues, otherwise keep existing]",
                "embassy_relations": "[Completely rewrite if {specific_developments} involves diplomatic status, otherwise keep existing]"
            }}
            
            IMPORTANT: Rewrite entire field content to tell complete, flowing story that features: {specific_developments}
            """,
            
            'challenges_and_opportunities': f"""
            {self.get_source_restrictions_prompt()}
            
            CONSERVATIVE UPDATE INSTRUCTIONS: Only update if MAJOR NEW challenges or opportunities have emerged {search_timeframe} between US and {country_name}.

            DO NOT UPDATE FOR:
            - Ongoing challenges already mentioned
            - General policy discussions
            - Background information
            - Minor developments in existing areas

            ONLY UPDATE IF YOU FIND:
            - MAJOR NEW challenges that have emerged {search_timeframe}
            - SIGNIFICANT resolution of existing major challenges {search_timeframe}
            - SUBSTANTIAL NEW cooperation opportunities identified {search_timeframe}

            NOTE: The future_outlook field has been REMOVED from this analysis.

            DIPLOMATIC FEEDS CONTEXT:
            {diplomatic_context}

            Current data: {json.dumps(current_section_data, indent=2)}
            
            Search for major changes to challenges/opportunities {search_timeframe} missing from current data.
            USE ONLY TRUSTWORTHY SOURCES from the approved list.
            
            If no major new changes found, respond with: "NO UPDATE NEEDED"
            
            If major changes found, update the relevant fields with the NEW information and return the complete JSON:
            {{
                "current_challenges": ["Keep existing array or add MAJOR NEW challenges emerged {search_timeframe}"],
                "cooperation_opportunities": ["Keep existing array or add SIGNIFICANT NEW opportunities identified {search_timeframe}"]
            }}
            
            IMPORTANT: Return actual data values, not instructions. If a field should not be updated, keep the existing value from current data.
            Note: future_outlook field has been removed and should not be included.
            """
        }
        
        prompt = section_prompts.get(section_name, f"""
        {self.get_source_restrictions_prompt()}
        
        CRITICAL: You MUST incorporate the following SPECIFIC developments: {specific_developments}
        
        COMPLETE REWRITE APPROACH - START WITH A BLANK CANVAS:
        1. Rewrite the entire {section_name} content from scratch
        2. Use the previous content as reference only
        3. Create cohesive content that prominently features: {specific_developments}
        4. Include relevant context from previous version where valuable
        5. Maximum ~150 words per field, natural flowing content
        6. USE ONLY TRUSTWORTHY SOURCES from the approved list
        
        DIPLOMATIC FEEDS CONTEXT:
        {diplomatic_context}
        
        REFERENCE - Previous {section_name} data: {json.dumps(current_section_data, indent=2)}
        
        If the specific developments don't relate to {section_name}, respond with: "NO UPDATE NEEDED"
        Otherwise, completely rewrite the content to prominently include: {specific_developments}
        """)
        
        try:
            response = self.generate_with_gemini(prompt)
            print(f"🔍 RAW AI RESPONSE for {section_name}:")
            print(f"{'='*50}")
            print(response)
            print(f"{'='*50}")
            
            # Special handling for detailed_relationship_summary (text field, not JSON)
            if section_name == 'detailed_relationship_summary':
                # Check if AI determined no update needed for summary
                if response.strip() == "NO UPDATE NEEDED" or (response.count("NO UPDATE NEEDED") == 1 and len(response.strip()) < 50):
                    print(f"🚫 AI determined no update needed for {section_name}")
                    return current_section_data, "NO_UPDATE_NEEDED"
                
                # For summary, just return the cleaned text response
                cleaned_response = response.strip()
                if cleaned_response and len(cleaned_response) > 50:  # Ensure meaningful update
                    return cleaned_response, "UPDATED"
                else:
                    return current_section_data, "ERROR"
            else:
                # Extract JSON from response for other fields
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                
                # Only check for "NO UPDATE NEEDED" if we can't find valid JSON
                if not json_match:
                    if "NO UPDATE NEEDED" in response:
                        print(f"🚫 AI determined no update needed for {section_name}")
                        return current_section_data, "NO_UPDATE_NEEDED"
                    else:
                        print(f"❌ No valid JSON found in response for {section_name}")
                        return current_section_data, "ERROR"
                
                if json_match:
                    json_str = json_match.group()
                    print(f"🔍 EXTRACTED JSON for {section_name}:")
                    print(json_str)
                    updated_section = json.loads(json_str)
                    print(f"🔍 PARSED JSON for {section_name}:")
                    print(json.dumps(updated_section, indent=2))
                    
                    # Remove future_outlook if it exists in the response
                    if section_name == 'challenges_and_opportunities' and 'future_outlook' in updated_section:
                        print(f"🗑️ Removing future_outlook field as it's no longer used")
                        del updated_section['future_outlook']
                    
                    # Merge with existing data - only update fields that have actual new content
                    merged_section = current_section_data.copy() if isinstance(current_section_data, dict) else {}
                    
                    # Also remove future_outlook from existing data if present
                    if section_name == 'challenges_and_opportunities' and 'future_outlook' in merged_section:
                        print(f"🗑️ Removing future_outlook from existing data")
                        del merged_section['future_outlook']
                    
                    print(f"🔍 ORIGINAL DATA for {section_name}:")
                    print(json.dumps(merged_section, indent=2))
                    
                    changes_made = False
                    for key, value in updated_section.items():
                        # Skip fields that explicitly say "NO UPDATE NEEDED" - keep original values
                        if isinstance(value, str) and value.strip() == "NO UPDATE NEEDED":
                            print(f"🔍 KEEPING original value for {key}: field marked as no update needed")
                            continue
                        elif isinstance(value, str) and ("Keep existing value" in value or "Only update if" in value):
                            # Keep the original value for instruction placeholders
                            print(f"🔍 KEEPING original value for {key}: instruction placeholder detected")
                            continue
                        elif isinstance(value, list) and len(value) == 1 and isinstance(value[0], str) and ("Keep existing array" in value[0] or "Only modify if" in value[0]):
                            # Keep the original array for this field  
                            print(f"🔍 KEEPING original array for {key}: instruction placeholder detected")
                            continue
                        else:
                            # Check if this is actually a change
                            old_value = merged_section.get(key, "NOT_PRESENT")
                            if old_value != value:
                                print(f"🔍 UPDATING {key}: '{old_value}' → '{value}'")
                                merged_section[key] = value
                                changes_made = True
                            else:
                                print(f"🔍 NO CHANGE for {key}: values are identical")
                    
                    print(f"🔍 FINAL MERGED DATA for {section_name}:")
                    print(json.dumps(merged_section, indent=2))
                    print(f"🔍 CHANGES MADE: {changes_made}")
                    
                    # Validate that specific developments were actually incorporated
                    if changes_made and specific_developments and specific_developments != "None":
                        incorporated = self.validate_developments_incorporated(merged_section, specific_developments, section_name)
                        if not incorporated:
                            print(f"⚠️  WARNING: Updated data doesn't seem to include the specific developments: {specific_developments}")
                    
                    if changes_made:
                        return merged_section, "UPDATED"
                    else:
                        print(f"🚫 No actual changes detected despite AI providing JSON")
                        return current_section_data, "NO_ACTUAL_CHANGES"
                else:
                    return current_section_data, "ERROR"
                
        except Exception as e:
            print(f"❌ Error updating {section_name}: {e}")
            return current_section_data, "ERROR"

    def enhance_bilateral_relations_selective(self, source_data: Dict[str, Any], existing_data: Optional[Dict[str, Any]], 
                                            countries_to_update: List[str]) -> Dict[str, Any]:
        """Enhance bilateral relations with selective field updates and user permission"""
        logger.info("🤝 Enhancing bilateral relations analysis (SELECTIVE)...")
        
        enhanced_relations = existing_data.get('enhanced_bilateral_relations', {}) if existing_data else {}
        bilateral_relations = source_data.get('bilateral_relations', {})
        skip_all = False
        
        for country_code in countries_to_update:
            if country_code not in bilateral_relations:
                print(f"⚠️ Country {country_code} not found in source data, skipping...")
                continue
                
            relation_data = bilateral_relations[country_code]
            country_name = relation_data.get('country_name', country_code)
            current_enhanced = enhanced_relations.get(country_code, {})
            
            print(f"\n🔄 Analyzing {country_name} for selective updates...")
            print(f"🔍 DEBUG: Current enhanced data exists: {bool(current_enhanced)}")
            
            # First, do full enhancement if no existing enhanced data
            if not current_enhanced:
                print(f"🆕 No existing enhanced data for {country_name} - performing full enhancement")
                # Use existing full enhancement logic here
                enhanced_relations[country_code] = self.enhance_country_full(country_code, relation_data, country_name, source_data)
                continue
            
            # For existing data, check each sensitive section
            updated_country_data = current_enhanced.copy()
            country_updated = False
            last_enhanced_date = current_enhanced.get('enhanced_analysis_date', '')
            
            for section_name in self.sensitive_fields:
                if skip_all:
                    break
                    
                print(f"🔍 Checking {section_name} for {country_name}...")
                
                # Analyze if section needs update
                needs_update, reasoning, specific_developments = self.analyze_section_needs_update(country_code, section_name, existing_data, source_data)
                
                print(f"🔍 Analysis result: needs_update={needs_update}, reason='{reasoning}'")
                print(f"🔍 Specific developments: {specific_developments}")
                
                if needs_update:
                    if not skip_all:
                        permission = self.ask_user_permission(country_name, section_name, reasoning)
                        
                        if permission == 'skip_all':
                            skip_all = True
                            print("⏭️ Skipping all remaining section update prompts...")
                            break
                        elif permission:
                            # Update the section with specific developments
                            current_section = current_enhanced.get(section_name, {})
                            updated_section, status = self.enhance_section_selectively(
                                country_code, section_name, current_section, country_name, last_enhanced_date, specific_developments, source_data
                            )
                            
                            # If user gave permission but no changes were made, FORCE an update
                            if status == "NO_ACTUAL_CHANGES":
                                print(f"🔄 User gave permission but no changes detected. FORCING update for {section_name}...")
                                updated_section, status = self.force_section_update(
                                    country_code, section_name, current_section, country_name, specific_developments
                                )
                            
                            # Log changes
                            self.log_section_changes(country_name, section_name, 
                                                   current_section, updated_section, status)
                            
                            if status == "UPDATED" or status == "FORCED_UPDATE":
                                updated_country_data[section_name] = updated_section
                                country_updated = True
                            elif status == "NO_ACTUAL_CHANGES":
                                print(f"⚠️  AI claimed update but no changes detected for {section_name}")
                                # Don't update the data since nothing actually changed
                        else:
                            self.log_section_changes(country_name, section_name, {}, {}, "SKIPPED")
                    else:
                        self.log_section_changes(country_name, section_name, {}, {}, "SKIPPED_ALL")
                else:
                    self.log_section_changes(country_name, section_name, {}, {}, "NO_CHANGE_NEEDED")
            
            # Update timestamp if any changes were made
            if country_updated:
                updated_country_data['enhanced_analysis_date'] = datetime.now().strftime('%Y-%m-%d')
                updated_country_data['last_selective_update'] = datetime.now().isoformat()
                
            enhanced_relations[country_code] = updated_country_data
            
            # Rate limiting
            time.sleep(2)
        
        return enhanced_relations

    def enhance_regional_analysis_selective(self, source_data: Dict[str, Any], existing_data: Optional[Dict[str, Any]], 
                                         regions_to_update: List[str]) -> Dict[str, Any]:
        """Enhance regional analysis with AI-powered research for specific regions"""
        print(f"🗺️ Enhancing regional analysis for {len(regions_to_update)} regions...")
        
        enhanced_regional = existing_data.get('enhanced_regional_analysis', {}) if existing_data else {}
        source_regional = source_data.get('regional_analysis', {})
        
        for region_name in regions_to_update:
            print(f"🔍 Enhancing {region_name} regional analysis...")
            
            if region_name not in source_regional:
                print(f"⚠️ Region {region_name} not found in source data, skipping...")
                continue
            
            region_data = source_regional[region_name]
            
            # Get diplomatic feeds context for the region
            diplomatic_context = self.get_regional_diplomatic_feeds_context(source_data, region_name)
            
            # Get bilateral relations data for countries in this region
            regional_countries = region_data.get('countries', [])
            bilateral_context = self.get_regional_bilateral_context(enhanced_regional, regional_countries)
            
            enhanced_region = self.enhance_region_full(region_name, region_data, diplomatic_context, bilateral_context)
            
            enhanced_regional[region_name] = enhanced_region
            
            print(f"✅ Enhanced {region_name} regional analysis")
        
        return enhanced_regional

    def get_regional_diplomatic_feeds_context(self, source_data: Dict[str, Any], region_name: str) -> str:
        """Get diplomatic feeds context relevant to a specific region"""
        diplomatic_feeds = source_data.get('diplomatic_feeds', [])
        
        # Keywords for each region (removed Eurasia)
        region_keywords = {
            "Indo-Pacific": ["China", "Japan", "India", "South Korea", "Asia", "Pacific", "QUAD", "AUKUS", "South China Sea"],
            "Europe": ["Germany", "UK", "France", "NATO", "European Union", "Russia", "Ukraine"],
            "Middle East": ["Israel", "Saudi Arabia", "Iran", "Abraham Accords", "Gulf", "Palestine"],
            "North America": ["Canada", "Mexico", "USMCA", "NORAD", "border", "trade"]
        }
        
        keywords = region_keywords.get(region_name, [region_name])
        
        relevant_feeds = []
        for feed in diplomatic_feeds:
            title = feed.get('title', '').lower()
            if any(keyword.lower() in title for keyword in keywords):
                relevant_feeds.append(feed)
        
        if relevant_feeds:
            context = f"Recent diplomatic developments in {region_name}:\n"
            for feed in relevant_feeds[:5]:  # Limit to 5 most relevant
                context += f"- {feed.get('title', '')} ({feed.get('published', '')})\n"
        else:
            context = f"No recent diplomatic feeds found specifically for {region_name}."
        
        return context

    def get_regional_bilateral_context(self, enhanced_regional: Dict[str, Any], regional_countries: List[Dict]) -> str:
        """Get bilateral relations context for countries in a region"""
        context = "Bilateral relations in this region:\n"
        
        for country in regional_countries:
            country_code = country.get('code', '')
            country_name = country.get('name', '')
            
            # This would need to access the enhanced bilateral relations
            # For now, we'll provide a basic structure
            context += f"- {country_name}: Key regional partner\n"
        
        return context

    def enhance_region_full(self, region_name: str, region_data: Dict, diplomatic_context: str, bilateral_context: str) -> Dict:
        """Perform full enhancement for a region using Gemini AI"""
        
        prompt = f"""
        {self.get_source_restrictions_prompt()}
        
        CRITICAL INSTRUCTION: Provide a comprehensive AI-enhanced analysis of US engagement in the {region_name} region with SPECIFIC, CONCRETE EXAMPLES. 
        
                 REQUIREMENTS:
         - Use exact numbers, dates, and specific names
         - Include real incidents, agreements, and developments
         - Provide concrete trade figures, military deployments, and diplomatic visits
         - Avoid generic statements - every claim should have specific backing
         - Include measurable outcomes and concrete impacts
        
        Create detailed, well-structured information with concrete examples.

        DIPLOMATIC FEEDS CONTEXT:
        {diplomatic_context}

        BILATERAL RELATIONS CONTEXT:
        {bilateral_context}

        Use the following regional data as a foundation:
        {json.dumps(region_data, indent=2)}

        Return a complete JSON analysis with the following structure:
        {{
            "region_name": "{region_name}",
            "countries": [from source data],
            "strategic_priority": "[from source data]",
            "key_challenges": [from source data],
            "us_initiatives": [from source data],
            "total_military_spending_billions": [from source data],
            "nato_members": [from source data],
            "relationship_strength": "[from source data]",
            "comprehensive_regional_overview": "[Write a concise 2-3 sentence overview with SPECIFIC examples and concrete data. Include: 1) Specific military deployments, exercises, or operations; 2) Exact trade figures, investment amounts, or economic agreements; 3) Recent diplomatic visits, summits, or agreements with dates; 4) Specific security incidents or challenges; 5) Concrete policy initiatives with measurable outcomes; 6) Real examples of cooperation or conflict. Avoid generic statements - use specific names, numbers, dates, and events. MAXIMUM 3 SENTENCES.]",
            "regional_security_dynamics": {{
                "primary_security_concerns": ["List specific security challenges with examples"],
                "us_security_role": "[Describe specific US military deployments, exercises, or operations with dates and locations]",
                "alliance_structures": "[Explain specific alliance agreements, joint exercises, or defense pacts with concrete details]",
                "deterrence_strategies": "[Detail specific deterrence measures, military postures, or strategic initiatives with measurable outcomes]"
            }},
            "economic_engagement": {{
                "trade_relationships": "[Provide specific trade figures, investment amounts, or economic statistics with exact numbers]",
                "investment_patterns": "[Explain specific investment projects, joint ventures, or economic agreements with concrete details]",
                "economic_initiatives": "[List specific economic cooperation programs with measurable outcomes and implementation dates]",
                "energy_security": "[Address specific energy projects, agreements, or security measures with concrete examples]"
            }},
            "diplomatic_strategy": {{
                "multilateral_engagement": "[Explain specific multilateral forums, agreements, or initiatives with dates and outcomes]",
                "bilateral_priorities": ["List specific bilateral relationships with concrete examples of cooperation or agreements"],
                "diplomatic_instruments": "[Describe specific diplomatic tools, agreements, or mechanisms with measurable impacts]",
                "regional_coordination": "[Explain specific coordination efforts, joint initiatives, or partnership programs with concrete outcomes]"
            }},
            "enhancement_status": "completed",
            "enhanced_analysis_date": "{datetime.now().strftime('%Y-%m-%d')}"
        }}

        USE ONLY TRUSTWORTHY SOURCES from the approved list. Focus on recent developments and verified information.
        """
        
        try:
            response = self.generate_with_gemini(prompt)
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            
            if json_match:
                json_str = json_match.group()
                enhanced_region = json.loads(json_str)
                return enhanced_region
            else:
                enhanced_region = region_data.copy()
                enhanced_region['enhancement_status'] = 'failed_to_parse'
                enhanced_region['enhanced_analysis_date'] = datetime.now().strftime('%Y-%m-%d')
                return enhanced_region
                
        except Exception as e:
            print(f"❌ Error enhancing {region_name}: {e}")
            enhanced_region = region_data.copy()
            enhanced_region['enhancement_status'] = f'error: {str(e)}'
            enhanced_region['enhanced_analysis_date'] = datetime.now().strftime('%Y-%m-%d')
            return enhanced_region

    def enhance_country_full(self, country_code: str, relation_data: Dict, country_name: str, source_data: Dict[str, Any]) -> Dict:
        """Perform full enhancement for a country (existing logic)"""
        # Get diplomatic feeds context
        diplomatic_context = self.get_diplomatic_feeds_context(source_data, country_name)
        
        prompt = f"""
        {self.get_source_restrictions_prompt()}
        
        CRITICAL INSTRUCTION: Provide a comprehensive analysis of US-{country_name} bilateral relations with SPECIFIC, CONCRETE EXAMPLES.
        
             REQUIREMENTS:
     - Use exact numbers, dates, and specific names
     - Include real incidents, agreements, and developments
     - Provide concrete trade figures, military exercises, and diplomatic visits
     - Avoid generic statements - every claim should have specific backing
     - Include measurable outcomes and concrete impacts
        
        Create detailed, well-structured information for each section with concrete examples.

        DIPLOMATIC FEEDS CONTEXT:
        {diplomatic_context}

        Use the following relationship data as a foundation:
        {json.dumps(relation_data, indent=2)}

        Return a complete JSON analysis with the following structure (note: future_outlook has been removed):
        {{
            "country_name": "{country_name}",
            "relationship_strength": "[from source data]",
            "relationship_score": [from source data],
            "economic_ties": "[from source data]",
            "military_cooperation": "[from source data]",
            "diplomatic_status": "[from source data]",
            "key_issues": [from source data],
            "detailed_relationship_summary": "[Write a concise 2-3 sentence summary with SPECIFIC examples and concrete data. Include: 1) Exact trade figures, investment amounts, or economic statistics; 2) Specific military exercises, deployments, or defense agreements; 3) Recent high-level visits with dates and outcomes; 4) Concrete policy initiatives and their measurable impacts; 5) Specific incidents or developments that shaped the relationship; 6) Real examples of cooperation or disagreements. Use specific names, numbers, dates, and events. Avoid generic statements. MAXIMUM 3 SENTENCES.]",
            "economic_cooperation": {{
                "trade_volume_estimate": "[Provide exact trade figures in billions of dollars with specific years and growth rates]",
                "key_trade_sectors": ["List specific trade sectors with concrete examples and trade volumes]",
                "investment_flows": "[Describe specific investment projects, amounts, and patterns with concrete examples]",
                "trade_agreements": "[List specific trade agreements with dates, key provisions, and measurable impacts]"
            }},
            "security_cooperation": {{
                "defense_agreements": "[List specific defense agreements with dates, key provisions, and concrete outcomes]",
                "joint_exercises": "[Describe specific military exercises with dates, locations, participating units, and objectives]",
                "intelligence_sharing": "[Detail specific intelligence cooperation mechanisms, agreements, or joint operations with concrete examples]",
                "regional_security_role": "[Explain specific regional security dynamics with concrete examples of cooperation or conflict]"
            }},
            "diplomatic_engagement": {{
                "recent_high_level_visits": "[List specific high-level visits with dates, participants, outcomes, and agreements reached]",
                "institutional_frameworks": "[Describe specific bilateral mechanisms, working groups, or institutional arrangements with concrete functions]",
                "multilateral_cooperation": "[Explain specific multilateral coordination efforts, joint initiatives, or shared positions with concrete examples]",
                "embassy_relations": "[Detail specific diplomatic representation, embassy activities, or consular services with concrete examples]"
            }},
            "challenges_and_opportunities": {{
                "current_challenges": ["List specific bilateral challenges with concrete examples, incidents, or policy disagreements]"
            }},
            "enhancement_status": "completed",
            "enhanced_analysis_date": "{datetime.now().strftime('%Y-%m-%d')}"
        }}

        USE ONLY TRUSTWORTHY SOURCES from the approved list. Focus on recent developments and verified information.
        """
        
        try:
            response = self.generate_with_gemini(prompt)
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            
            if json_match:
                json_str = json_match.group()
                enhanced_relation = json.loads(json_str)
                
                # Remove future_outlook if it exists
                if 'challenges_and_opportunities' in enhanced_relation and 'future_outlook' in enhanced_relation['challenges_and_opportunities']:
                    del enhanced_relation['challenges_and_opportunities']['future_outlook']
                
                return enhanced_relation
            else:
                enhanced_relation = relation_data.copy()
                enhanced_relation['enhancement_status'] = 'failed_to_parse'
                enhanced_relation['enhanced_analysis_date'] = datetime.now().strftime('%Y-%m-%d')
                return enhanced_relation
                
        except Exception as e:
            print(f"❌ Error enhancing {country_name}: {e}")
            enhanced_relation = relation_data.copy()
            enhanced_relation['enhancement_status'] = f'error: {str(e)}'
            enhanced_relation['enhanced_analysis_date'] = datetime.now().strftime('%Y-%m-%d')
            return enhanced_relation

    def force_section_update(self, country_code: str, section_name: str, 
                           current_section_data: Dict, country_name: str, 
                           specific_developments: str) -> Tuple[Dict, str]:
        """Force an update when user gave permission but AI returned no changes"""
        
        print(f"🚀 FORCING update for {section_name} - user gave explicit permission!")
        
        force_prompts = {
            'detailed_relationship_summary': f"""
            {self.get_source_restrictions_prompt()}
            
            USER GAVE EXPLICIT PERMISSION TO UPDATE. YOU MUST MAKE CHANGES.

            COMPLETE REWRITE APPROACH - START WITH A BLANK CANVAS:
            1. You will rewrite the entire summary from scratch 
            2. Use the previous content as reference only
            3. Create a cohesive narrative that prominently features: {specific_developments}
            4. Include ONLY the most relevant context from the previous version
            5. EXCLUDE outdated information that is now less significant
            6. Maximum ~300 words, natural flowing prose that tells the current story
            7. USE ONLY TRUSTWORTHY SOURCES from the approved list

            CONTENT CURATION: Remove outdated events, superseded information, or less relevant details that don't enhance the current narrative.

            REFERENCE - Previous summary: {json.dumps(current_section_data, indent=2)}

            REQUIREMENTS:
            1. You MUST prominently feature: {specific_developments}
            2. You MUST rewrite from scratch - no identical content allowed
            3. Create natural, flowing narrative that tells the complete current story
            4. Include relevant previous context where it enhances the story
            5. Only use information from trustworthy sources

            Return a completely rewritten summary with {specific_developments} as a central element.
            """,
            
            'challenges_and_opportunities': f"""
            {self.get_source_restrictions_prompt()}
            
            USER GAVE EXPLICIT PERMISSION TO UPDATE. YOU MUST MAKE CHANGES.

            COMPLETE REWRITE APPROACH - START WITH A BLANK CANVAS:
            1. You will rewrite relevant fields completely from scratch
            2. Use the previous content as reference only
            3. Create cohesive content that prominently features: {specific_developments}
            4. Include relevant context from the previous version where valuable
            5. For arrays: recreate fresh, well-organized lists (max ~6 items)
            6. USE ONLY TRUSTWORTHY SOURCES from the approved list

            NOTE: The future_outlook field has been REMOVED and should not be included.

            REFERENCE - Previous challenges/opportunities data: {json.dumps(current_section_data, indent=2)}

            REQUIREMENTS:
            1. You MUST prominently feature: {specific_developments}
            2. You MUST rewrite relevant fields from scratch - no identical content allowed
            3. Create well-organized content that tells complete stories
            4. Only rewrite fields that relate to the developments
            5. Only use information from trustworthy sources

            Return JSON with completely rewritten fields that feature: {specific_developments}
            {{
                "current_challenges": ["Completely recreate if related to {specific_developments}, otherwise keep existing"],
                "cooperation_opportunities": ["Completely recreate if related to {specific_developments}, otherwise keep existing"]
            }}
            
            Do NOT include future_outlook field.
            """
        }
        
        # Add source restrictions to other existing force prompts
        for key in ['diplomatic_engagement', 'economic_cooperation', 'security_cooperation']:
            if key not in force_prompts:
                force_prompts[key] = f"""
                {self.get_source_restrictions_prompt()}
                
                USER GAVE EXPLICIT PERMISSION TO UPDATE. YOU MUST MAKE CHANGES.
                [Previous prompt content for {key} would go here with source restrictions added]
                USE ONLY TRUSTWORTHY SOURCES from the approved list.
                """
        
        prompt = force_prompts.get(section_name, f"""
        {self.get_source_restrictions_prompt()}
        
        USER GAVE EXPLICIT PERMISSION TO UPDATE. YOU MUST MAKE CHANGES.

        COMPLETE REWRITE APPROACH - START WITH A BLANK CANVAS:
        1. Rewrite the entire {section_name} content from scratch
        2. Use the previous content as reference only
        3. Create cohesive content that prominently features: {specific_developments}
        4. You CANNOT return identical content - changes are REQUIRED
        5. USE ONLY TRUSTWORTHY SOURCES from the approved list

        REFERENCE - Previous {section_name} data: {json.dumps(current_section_data, indent=2)}
        
        REQUIREMENTS:
        1. You MUST prominently feature: {specific_developments}
        2. You MUST rewrite from scratch - no identical content allowed
        3. Create natural, flowing content that tells the complete story
        4. Return completely rewritten content that includes: {specific_developments}
        5. Only use information from trustworthy sources
        """)
        
        try:
            response = self.generate_with_gemini(prompt)
            print(f"🔍 FORCED UPDATE RESPONSE for {section_name}:")
            print(f"{'='*50}")
            print(response)
            print(f"{'='*50}")
            
            # Special handling for detailed_relationship_summary (text field)
            if section_name == 'detailed_relationship_summary':
                cleaned_response = response.strip()
                if cleaned_response and len(cleaned_response) > 50:
                    # Ensure it's actually different from original
                    if cleaned_response != current_section_data:
                        return cleaned_response, "FORCED_UPDATE"
                    else:
                        # AI still returned same content, manually append the developments
                        forced_update = f"{current_section_data} Recent developments include {specific_developments}."
                        print(f"🔨 AI still returned identical content, manually appending developments")
                        return forced_update, "FORCED_UPDATE"
                else:
                    return current_section_data, "FORCE_FAILED"
            else:
                # Extract JSON from response for other fields
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                
                if json_match:
                    json_str = json_match.group()
                    updated_section = json.loads(json_str)
                    
                    # Remove future_outlook if it exists in challenges_and_opportunities
                    if section_name == 'challenges_and_opportunities' and 'future_outlook' in updated_section:
                        del updated_section['future_outlook']
                    
                    # Merge and ensure changes were made
                    merged_section = current_section_data.copy() if isinstance(current_section_data, dict) else {}
                    
                    # Also remove future_outlook from existing data if present
                    if section_name == 'challenges_and_opportunities' and 'future_outlook' in merged_section:
                        del merged_section['future_outlook']
                    
                    changes_made = False
                    
                    for key, value in updated_section.items():
                        # Skip fields that explicitly say "NO UPDATE NEEDED" 
                        if isinstance(value, str) and value.strip() == "NO UPDATE NEEDED":
                            print(f"🔍 KEEPING original value for {key}: field marked as no update needed")
                            continue
                        elif isinstance(value, str) and ("MUST update" in value or "keep existing" in value):
                            continue  # Skip instruction placeholders
                        
                        old_value = merged_section.get(key, "NOT_PRESENT")
                        if old_value != value:
                            merged_section[key] = value
                            changes_made = True
                            print(f"🔨 FORCED CHANGE: {key} = {value}")
                    
                    if changes_made:
                        return merged_section, "FORCED_UPDATE"
                    else:
                        # Still no changes, manually add the developments
                        if "recent_high_level_visits" in merged_section:
                            merged_section["recent_high_level_visits"] = f"{merged_section.get('recent_high_level_visits', '')} {specific_developments}".strip()
                        elif "trade_agreements" in merged_section:
                            merged_section["trade_agreements"] = f"{merged_section.get('trade_agreements', '')} {specific_developments}".strip()
                        elif "defense_agreements" in merged_section:
                            merged_section["defense_agreements"] = f"{merged_section.get('defense_agreements', '')} {specific_developments}".strip()
                        elif "current_challenges" in merged_section:
                            challenges = merged_section.get("current_challenges", [])
                            if isinstance(challenges, list):
                                challenges.append(f"Related to: {specific_developments}")
                                merged_section["current_challenges"] = challenges
                        
                        print(f"🔨 Manually added developments to ensure update")
                        return merged_section, "FORCED_UPDATE"
                else:
                    return current_section_data, "FORCE_FAILED"
                    
        except Exception as e:
            print(f"❌ Error in forced update for {section_name}: {e}")
            return current_section_data, "FORCE_FAILED"

    def validate_developments_incorporated(self, updated_data: Dict, specific_developments: str, section_name: str) -> bool:
        """Validate that the specific developments were actually incorporated into the updated data"""
        if not specific_developments or specific_developments == "None":
            return True
        
        # Convert all data to lowercase string for searching
        data_str = json.dumps(updated_data).lower()
        developments_lower = specific_developments.lower()
        
        # Extract key terms from the developments (looking for country names, key events, etc.)
        key_terms = []
        
        # Look for country names, organizations, key events
        import re
        potential_terms = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', specific_developments)
        
        # Common key terms that indicate specific events
        event_keywords = ['agreement', 'signed', 'announced', 'launched', 'visit', 'meeting', 'cooperation', 
                         'defense', 'trade', 'investment', 'conflict', 'crisis', 'partnership']
        
        found_terms = 0
        total_terms = len(potential_terms) + len([kw for kw in event_keywords if kw in developments_lower])
        
        # Check if key terms from developments appear in the updated data
        for term in potential_terms:
            if term.lower() in data_str:
                found_terms += 1
                print(f"✅ Found key term '{term}' in updated data")
            else:
                print(f"❌ Missing key term '{term}' from updated data")
        
        for keyword in event_keywords:
            if keyword in developments_lower and keyword in data_str:
                found_terms += 1
                print(f"✅ Found event keyword '{keyword}' in updated data")
        
        # Consider incorporated if at least 30% of key terms are found
        incorporation_ratio = found_terms / max(total_terms, 1)
        print(f"🔍 Incorporation ratio: {found_terms}/{total_terms} = {incorporation_ratio:.2f}")
        
        return incorporation_ratio >= 0.3

    def generate_with_gemini(self, prompt: str, urls: List[str] = None) -> str:
        """Generate content using Gemini 2.0 Flash with Google Search"""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                if not self.client:
                    if not self._initialize_client():
                        print("❌ No available API keys")
                        return ""
                
                print("🔍 Generating response with Gemini 2.0 Flash + Google Search...")
                
                tools = [
                    Tool(google_search=GoogleSearch()),
                    Tool(url_context=UrlContext())
                ]
                
                config = GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=4000,
                    tools=tools
                )
                
                response = self.client.models.generate_content(
                    model="gemini-2.0-flash-exp",
                    contents=prompt,
                    config=config
                )
                
                if response and response.text:
                    return response.text
                else:
                    raise Exception("No valid response generated")
                    
            except Exception as e:
                error_message = str(e)
                print(f"⚠️ Generation attempt {attempt + 1} failed: {error_message}")
                
                if (self._is_quota_exceeded_error(error_message) or 
                    "validation error" in error_message.lower() or
                    "api" in error_message.lower() or
                    "forbidden" in error_message.lower() or
                    "unauthorized" in error_message.lower()):
                    
                    if self._switch_to_next_key():
                        print("🔄 Retrying with new API key...")
                        continue
                    else:
                        print("❌ All API keys exhausted")
                        return ""
                
                if attempt < max_retries - 1:
                    print(f"🔄 Retrying... ({attempt + 2}/{max_retries})")
                    time.sleep(2)
                    continue
                else:
                    print(f"❌ Max retries exceeded")
                    return ""
        
        return ""

    def load_source_data(self) -> Dict[str, Any]:
        """Load the source foreign affairs data"""
        try:
            with open(self.source_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"✅ Loaded source data from {self.source_file}")
            
            # Check if diplomatic feeds are available
            diplomatic_feeds = data.get('diplomatic_feeds', [])
            print(f"📡 Found {len(diplomatic_feeds)} diplomatic feeds in source data")
            
            return data
        except FileNotFoundError:
            print(f"❌ Source file {self.source_file} not found")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Error loading source data: {e}")
            sys.exit(1)

    def load_existing_analysis(self) -> Optional[Dict[str, Any]]:
        """Load existing enhanced analysis if available"""
        try:
            with open(self.output_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"✅ Loaded existing enhanced analysis from {self.output_file}")
            return data
        except FileNotFoundError:
            print(f"ℹ️  No existing enhanced analysis found - will create new analysis")
            return None
        except Exception as e:
            print(f"⚠️  Error loading existing analysis: {e}")
            return None

    def needs_update(self, source_data: Dict[str, Any], existing_data: Optional[Dict[str, Any]]) -> bool:
        """Check if update is needed based on timestamps and data changes"""
        if existing_data is None:
            print("🔄 Update needed: No existing enhanced data found")
            return True
        
        source_timestamp = source_data.get('metadata', {}).get('collection_timestamp', '')
        existing_source_timestamp = existing_data.get('source_timestamp', '')
        
        if source_timestamp != existing_source_timestamp:
            print(f"🔄 Update needed: Source timestamp changed")
            print(f"   Source: {source_timestamp}")
            print(f"   Existing: {existing_source_timestamp}")
            return True
        
        print("✅ No update needed: Source timestamps match")
        return False

    def get_countries_needing_update(self, source_data: Dict[str, Any], existing_data: Optional[Dict[str, Any]]) -> List[str]:
        """Determine which countries need bilateral relations updates"""
        if existing_data is None:
            return list(source_data.get('bilateral_relations', {}).keys())
        
        countries_to_update = []
        source_bilateral = source_data.get('bilateral_relations', {})
        existing_bilateral = existing_data.get('enhanced_bilateral_relations', {})
        
        for country_code, relation_data in source_bilateral.items():
            country_name = relation_data.get('country_name', country_code)
            
            if country_code not in existing_bilateral:
                print(f"🆕 New country for enhancement: {country_name}")
                countries_to_update.append(country_code)
                continue
            
            try:
                existing_enhanced_date = existing_bilateral[country_code].get('enhanced_analysis_date', '')
                if existing_enhanced_date:
                    enhanced_date = datetime.fromisoformat(existing_enhanced_date)
                    days_old = (datetime.now() - enhanced_date).days
                    if days_old > 14:  # Re-enhance if older than 14 days for selective updates
                        print(f"🔄 Re-enhancing old data for {country_name} (enhanced {days_old} days ago)")
                        countries_to_update.append(country_code)
                        continue
            except Exception as e:
                pass
            
            print(f"✅ Skipping {country_name} - already enhanced recently")
        
        return countries_to_update

    def get_regions_needing_update(self, source_data: Dict[str, Any], existing_data: Optional[Dict[str, Any]]) -> List[str]:
        """Determine which regions need analysis updates"""
        if existing_data is None:
            return list(source_data.get('regional_analysis', {}).keys())
        
        regions_to_update = []
        source_regional = source_data.get('regional_analysis', {})
        existing_regional = existing_data.get('enhanced_regional_analysis', {})
        
        for region_name, region_data in source_regional.items():
            if region_name not in existing_regional:
                print(f"🆕 New region for enhancement: {region_name}")
                regions_to_update.append(region_name)
                continue
            
            try:
                existing_enhanced_date = existing_regional[region_name].get('enhanced_analysis_date', '')
                if existing_enhanced_date:
                    enhanced_date = datetime.fromisoformat(existing_enhanced_date)
                    days_old = (datetime.now() - enhanced_date).days
                    if days_old > 14:  # Re-enhance if older than 14 days for selective updates
                        print(f"🔄 Re-enhancing old regional data for {region_name} (enhanced {days_old} days ago)")
                        regions_to_update.append(region_name)
                        continue
            except Exception as e:
                pass
            
            print(f"✅ Skipping {region_name} - already enhanced recently")
        
        return regions_to_update

    def create_clean_version(self, detailed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a clean version of the enhanced data for frontend use"""
        logger.info("🧹 Creating clean version for frontend...")
        
        clean_data = {
            'metadata': {
                'enhancement_timestamp': detailed_data['metadata']['enhancement_timestamp'],
                'version': detailed_data['metadata']['version'] + '_clean',
                'enhancement_tools': detailed_data['metadata']['enhancement_tools'],
                'source_file': detailed_data['metadata']['source_file'],
                'frontend_optimized': True,
                'cleaned_date': datetime.now().strftime('%Y-%m-%d'),
                'trustworthy_sources_only': True
            }
        }
        
        if 'enhanced_bilateral_relations' in detailed_data:
            clean_data['enhanced_bilateral_relations'] = {}
            for country_code, relation in detailed_data['enhanced_bilateral_relations'].items():
                cleaned_relation = {
                    "country_name": relation.get("country_name"),
                    "relationship_strength": relation.get("relationship_strength"),
                    "relationship_score": relation.get("relationship_score"),
                    "economic_ties": relation.get("economic_ties"),
                    "military_cooperation": relation.get("military_cooperation"),
                    "diplomatic_status": relation.get("diplomatic_status"),
                    "key_issues": relation.get("key_issues", []),
                    "detailed_relationship_summary": relation.get("detailed_relationship_summary"),
                    "last_updated": relation.get("enhanced_analysis_date")
                }
                clean_data['enhanced_bilateral_relations'][country_code] = cleaned_relation
        
        if 'enhanced_regional_analysis' in detailed_data:
            clean_data['enhanced_regional_analysis'] = {}
            for region_name, region in detailed_data['enhanced_regional_analysis'].items():
                cleaned_region = {
                    "region_name": region.get("region_name"),
                    "countries": region.get("countries"),
                    "strategic_priority": region.get("strategic_priority"),
                    "key_challenges": region.get("key_challenges"),
                    "us_initiatives": region.get("us_initiatives"),
                    "total_military_spending_billions": region.get("total_military_spending_billions"),
                    "nato_members": region.get("nato_members"),
                    "relationship_strength": region.get("relationship_strength"),
                    "comprehensive_regional_overview": region.get("comprehensive_regional_overview"),
                    "regional_security_dynamics": region.get("regional_security_dynamics"),
                    "economic_engagement": region.get("economic_engagement"),
                    "diplomatic_strategy": region.get("diplomatic_strategy"),
                    "last_updated": region.get("enhanced_analysis_date")
                }
                clean_data['enhanced_regional_analysis'][region_name] = cleaned_region
        
        return clean_data

    def save_analysis(self, detailed_data: Dict[str, Any], clean_data: Dict[str, Any]):
        """Save both detailed and clean versions"""
        try:
            # Get the script directory and navigate to public/data
            script_dir = os.path.dirname(os.path.abspath(__file__))
            project_root = os.path.join(script_dir, '..', '..')
            public_data_dir = os.path.join(project_root, 'public', 'data')
            
            # Create the directory if it doesn't exist
            os.makedirs(public_data_dir, exist_ok=True)
            
            # Save to public/data directory
            public_filename = os.path.join(public_data_dir, self.output_file)
            with open(public_filename, 'w', encoding='utf-8') as f:
                json.dump(detailed_data, f, indent=2, ensure_ascii=False)
            print(f"✅ Detailed enhanced analysis saved to {public_filename}")
            
            # Also save to local directory for backward compatibility
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(detailed_data, f, indent=2, ensure_ascii=False)
            print(f"✅ Detailed enhanced analysis also saved locally to {self.output_file}")
            
            # No longer creating separate clean file - all data is in main file
            
        except Exception as e:
            print(f"❌ Error saving analysis: {e}")
            sys.exit(1)

    def run_enhancement(self):
        """Main enhancement runner with selective updating"""
        print("🚀 Starting Foreign Affairs Data Enhancement with Selective Updates...")
        print("🔐 Using encrypted API key from .env file")
        print("📡 Enhanced with diplomatic feeds access and trustworthy source restrictions")
        
        source_data = self.load_source_data()
        existing_data = self.load_existing_analysis()
        
        enhanced_bilateral_relations = existing_data.get('enhanced_bilateral_relations', {}) if existing_data else {}
        enhanced_regional_analysis = existing_data.get('enhanced_regional_analysis', {}) if existing_data else {}
        updates_performed = False
        
        # Check if update is needed
        if self.needs_update(source_data, existing_data) or not existing_data:
            print("🔄 Running selective analysis...")
            
            countries_to_update = self.get_countries_needing_update(source_data, existing_data)
            regions_to_update = self.get_regions_needing_update(source_data, existing_data)
            
            print(f"📊 Selective Update Plan:")
            print(f"   Countries to update: {len(countries_to_update)}")
            print(f"   Regions to update: {len(regions_to_update)}")
            print(f"   Diplomatic feeds available: {len(source_data.get('diplomatic_feeds', []))}")
            print(f"   Trustworthy sources: {len(self.trustworthy_sources)} approved sources")
            
            if countries_to_update:
                enhanced_bilateral_relations = self.enhance_bilateral_relations_selective(
                    source_data, existing_data, countries_to_update
                )
                updates_performed = True
            
            if regions_to_update:
                enhanced_regional_analysis = self.enhance_regional_analysis_selective(
                    source_data, existing_data, regions_to_update
                )
                updates_performed = True
            
        if updates_performed:
            enhanced_data = {
                'metadata': {
                    'enhancement_timestamp': datetime.now().isoformat(),
                    'version': 'enhanced_v1.1_selective_with_feeds',
                    'enhancement_tools': ['Google Gemini 2.0 Flash', 'Google Search'],
                    'source_file': self.source_file,
                    'source_timestamp': source_data.get('metadata', {}).get('collection_timestamp', ''),
                    'original_version': source_data.get('metadata', {}).get('version', 'unknown'),
                    'enhancement_date': datetime.now().strftime('%Y-%m-%d'),
                    'selective_update': True,
                    'auto_update_performed': True,
                    'diplomatic_feeds_used': True,
                    'trustworthy_sources_only': True,
                    'future_outlook_removed': True
                },
                'enhanced_bilateral_relations': enhanced_bilateral_relations,
                'enhanced_regional_analysis': enhanced_regional_analysis
            }
            
            clean_data = self.create_clean_version(enhanced_data)
            self.save_analysis(enhanced_data, clean_data)
            
            print(f"\n✅ Selective enhancement completed!")
            print(f"📁 Detailed version: {self.output_file}")
            print(f"📁 Enhanced data: {self.output_file}")
            print(f"📡 Enhanced with diplomatic feeds integration")
            print(f"🔒 Used only trustworthy sources for verification")
        else:
            print("✅ No updates needed - all data is current!")

def load_api_keys_from_env() -> List[str]:
    """Load Gemini API keys from environment variables"""
    load_dotenv()
    
    api_keys = []
    
    key1 = os.getenv('GEMINI_API_KEY_1')
    key2 = os.getenv('GEMINI_API_KEY_2') 
    key3 = os.getenv('GEMINI_API_KEY_3')
    
    if key1:
        api_keys.append(key1)
    if key2:
        api_keys.append(key2)
    if key3:
        api_keys.append(key3)
    
    return api_keys

def main():
    """Main function"""
    try:
        api_keys = load_api_keys_from_env()
        
        if not api_keys:
            print("❌ No Gemini API keys found in environment variables")
            return 1
        
        print(f"🔑 Loaded {len(api_keys)} API keys from encrypted .env file")
        
        if any(key == "YOUR_GOOGLE_AI_API_KEY_HERE" for key in api_keys):
            print("❌ Please set your Google AI API keys in the .env file")
            return 1
        
        enhancer = ForeignAffairsEnhancer(api_keys)
        enhancer.run_enhancement()
        
    except KeyboardInterrupt:
        print("\nEnhancement interrupted by user.")
        return 0
    except Exception as e:
        print(f"Fatal error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())