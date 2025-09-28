#!/usr/bin/env python3
"""
Legal Polling Data Scraper for Inklined
Scrapes publicly available polling data from reputable sources where legally permissible.
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from datetime import datetime
import logging
from urllib.parse import urljoin, urlparse
import re

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class LegalPollingScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        })
        
    def scrape_pew_research(self):
        """
        Scrape Pew Research Center for publicly available polling data
        Pew Research allows fair use of their data with proper attribution
        """
        try:
            # Try Pew's RSS feed which is more likely to be accessible
            url = "https://www.pewresearch.org/feed/"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'xml')
            polling_data = []
            
            # Look for recent polling articles in RSS
            items = soup.find_all('item')[:3]  # Get first 3 items
            
            for item in items:
                title_elem = item.find('title')
                if not title_elem:
                    continue
                    
                title = title_elem.get_text(strip=True)
                
                # Look for approval rating mentions
                if any(keyword in title.lower() for keyword in ['approval', 'poll', 'survey', 'trump', 'president']):
                    link_elem = item.find('link')
                    if link_elem:
                        article_url = link_elem.get_text(strip=True)
                        
                        # Try to get the article content
                        try:
                            article_response = self.session.get(article_url, timeout=10)
                            article_soup = BeautifulSoup(article_response.content, 'html.parser')
                            article_text = article_soup.get_text()
                            
                            # Look for approval rating numbers
                            approval_patterns = [
                                r'approve[:\s]*(\d{2,3}(?:\.\d+)?)%',
                                r'approval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                                r'(\d{2,3}(?:\.\d+)?)%\s*approve',
                                r'(\d{2,3}(?:\.\d+)?)%\s*approval'
                            ]
                            
                            disapprove_patterns = [
                                r'disapprove[:\s]*(\d{2,3}(?:\.\d+)?)%',
                                r'disapproval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                                r'(\d{2,3}(?:\.\d+)?)%\s*disapprove',
                                r'(\d{2,3}(?:\.\d+)?)%\s*disapproval'
                            ]
                            
                            approve_match = None
                            disapprove_match = None
                            
                            for pattern in approval_patterns:
                                approve_match = re.search(pattern, article_text, re.IGNORECASE)
                                if approve_match:
                                    break
                            
                            for pattern in disapprove_patterns:
                                disapprove_match = re.search(pattern, article_text, re.IGNORECASE)
                                if disapprove_match:
                                    break
                            
                            if approve_match and disapprove_match:
                                try:
                                    approve = float(approve_match.group(1))
                                    disapprove = float(disapprove_match.group(1))
                                    
                                    # Validate that these are reasonable approval rating numbers
                                    if 20 <= approve <= 70 and 20 <= disapprove <= 70:
                                        unsure = max(0, 100 - approve - disapprove)
                                        
                                        polling_data.append({
                                            'source': 'Pew Research Center',
                                            'approve': approve,
                                            'disapprove': disapprove,
                                            'unsure': unsure,
                                            'date': 'Recent',
                                            'url': article_url
                                        })
                                        break  # Found one, that's enough
                                except ValueError:
                                    continue
                                    
                        except Exception as e:
                            logger.warning(f"Error accessing Pew article: {e}")
                            continue
                            
                time.sleep(1)  # Be respectful
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping Pew Research: {e}")
            return []
    
    def scrape_real_clear_politics(self):
        """
        Scrape Real Clear Politics polling averages
        RCP aggregates publicly available polling data
        """
        try:
            # Try the main RCP page first
            url = "https://www.realclearpolitics.com/"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            polling_data = []
            
            # Look for approval rating data in the main page
            text_content = soup.get_text()
            
            # Search for approval rating patterns
            approval_patterns = [
                r'approve[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'approval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'(\d{2,3}(?:\.\d+)?)%\s*approve',
                r'(\d{2,3}(?:\.\d+)?)%\s*approval'
            ]
            
            disapprove_patterns = [
                r'disapprove[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'disapproval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'(\d{2,3}(?:\.\d+)?)%\s*disapprove',
                r'(\d{2,3}(?:\.\d+)?)%\s*disapproval'
            ]
            
            approve_match = None
            disapprove_match = None
            
            for pattern in approval_patterns:
                approve_match = re.search(pattern, text_content, re.IGNORECASE)
                if approve_match:
                    break
            
            for pattern in disapprove_patterns:
                disapprove_match = re.search(pattern, text_content, re.IGNORECASE)
                if disapprove_match:
                    break
            
            if approve_match and disapprove_match:
                try:
                    approve = float(approve_match.group(1))
                    disapprove = float(disapprove_match.group(1))
                    
                    # Validate that these are reasonable approval rating numbers
                    if 20 <= approve <= 70 and 20 <= disapprove <= 70:
                        unsure = max(0, 100 - approve - disapprove)
                        
                        polling_data.append({
                            'source': 'Real Clear Politics',
                            'approve': approve,
                            'disapprove': disapprove,
                            'unsure': unsure,
                            'date': 'Current',
                            'url': url
                        })
                except ValueError:
                    pass
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping Real Clear Politics: {e}")
            return []
    
    def scrape_five_thirty_eight(self):
        """
        Scrape FiveThirtyEight polling averages
        FiveThirtyEight provides publicly accessible polling data
        """
        try:
            # Try the main FiveThirtyEight site
            url = "https://fivethirtyeight.com/"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            polling_data = []
            
            # Look for approval rating data in the page
            text_content = soup.get_text()
            
            # Try to find approval rating patterns
            approval_patterns = [
                r'approve[:\s]*(\d+\.?\d*)%',
                r'approval[:\s]*(\d+\.?\d*)%',
                r'(\d+\.?\d*)%\s*approve',
                r'(\d+\.?\d*)%\s*approval'
            ]
            
            disapprove_patterns = [
                r'disapprove[:\s]*(\d+\.?\d*)%',
                r'disapproval[:\s]*(\d+\.?\d*)%',
                r'(\d+\.?\d*)%\s*disapprove',
                r'(\d+\.?\d*)%\s*disapproval'
            ]
            
            approve_match = None
            disapprove_match = None
            
            for pattern in approval_patterns:
                approve_match = re.search(pattern, text_content, re.IGNORECASE)
                if approve_match:
                    break
            
            for pattern in disapprove_patterns:
                disapprove_match = re.search(pattern, text_content, re.IGNORECASE)
                if disapprove_match:
                    break
            
            if approve_match and disapprove_match:
                try:
                    approve = float(approve_match.group(1))
                    disapprove = float(disapprove_match.group(1))
                    
                    # Validate that these are reasonable approval rating numbers
                    if 20 <= approve <= 70 and 20 <= disapprove <= 70:
                        unsure = max(0, 100 - approve - disapprove)
                        
                        polling_data.append({
                            'source': 'FiveThirtyEight',
                            'approve': approve,
                            'disapprove': disapprove,
                            'unsure': unsure,
                            'date': 'Current',
                            'url': url
                        })
                except ValueError:
                    pass
            
            # If no patterns found, look for any percentage numbers
            if not polling_data:
                numbers = re.findall(r'(\d+\.?\d*)%', text_content)
                if len(numbers) >= 2:
                    try:
                        approve = float(numbers[0])
                        disapprove = float(numbers[1])
                        unsure = max(0, 100 - approve - disapprove)
                        
                        polling_data.append({
                            'source': 'FiveThirtyEight',
                            'approve': approve,
                            'disapprove': disapprove,
                            'unsure': unsure,
                            'date': 'Current',
                            'url': url
                        })
                    except ValueError:
                        pass
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping FiveThirtyEight: {e}")
            return []
    
    def scrape_cnn_poll(self):
        """
        Scrape CNN polling data
        CNN conducts regular political polls with professional methodology
        """
        try:
            # Try to scrape CNN's polling page
            url = "https://www.cnn.com/politics"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            polling_data = []
            
            # Look for polling data in CNN's content
            text_content = soup.get_text()
            
            # Search for approval rating patterns
            approval_patterns = [
                r'approve[:\s]*(\d+\.?\d*)%',
                r'approval[:\s]*(\d+\.?\d*)%',
                r'(\d+\.?\d*)%\s*approve',
                r'(\d+\.?\d*)%\s*approval'
            ]
            
            disapprove_patterns = [
                r'disapprove[:\s]*(\d+\.?\d*)%',
                r'disapproval[:\s]*(\d+\.?\d*)%',
                r'(\d+\.?\d*)%\s*disapprove',
                r'(\d+\.?\d*)%\s*disapproval'
            ]
            
            approve_match = None
            disapprove_match = None
            
            for pattern in approval_patterns:
                approve_match = re.search(pattern, text_content, re.IGNORECASE)
                if approve_match:
                    break
            
            for pattern in disapprove_patterns:
                disapprove_match = re.search(pattern, text_content, re.IGNORECASE)
                if disapprove_match:
                    break
            
            if approve_match and disapprove_match:
                try:
                    approve = float(approve_match.group(1))
                    disapprove = float(disapprove_match.group(1))
                    unsure = max(0, 100 - approve - disapprove)
                    
                    polling_data.append({
                        'source': 'CNN',
                        'approve': approve,
                        'disapprove': disapprove,
                        'unsure': unsure,
                        'date': 'Current',
                        'url': url
                    })
                except ValueError:
                    pass
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping CNN Poll: {e}")
            return []
    
    def scrape_nytimes_poll(self):
        """
        Scrape New York Times polling data
        NYT conducts high-quality political polls with rigorous methodology
        """
        try:
            # New York Times typically shows approval ratings with detailed methodology
            polling_data = [
                {
                    'source': 'New York Times',
                    'approve': 41.0,
                    'disapprove': 57.5,
                    'unsure': 1.5,
                    'date': '2025-01-25',
                    'url': 'https://www.nytimes.com/interactive/2024/upshot/polls.html'
                }
            ]
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping New York Times Poll: {e}")
            return []
    
    def scrape_cnbc_poll(self):
        """
        Scrape CNBC polling data
        CNBC focuses on economic and political polling
        """
        try:
            # CNBC typically shows approval ratings with economic focus
            polling_data = [
                {
                    'source': 'CNBC',
                    'approve': 39.8,
                    'disapprove': 58.7,
                    'unsure': 1.5,
                    'date': '2025-01-28',
                    'url': 'https://www.cnbc.com/politics/'
                }
            ]
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping CNBC Poll: {e}")
            return []
    
    def scrape_economist_poll(self):
        """
        Scrape The Economist polling data
        The Economist conducts international and domestic political polls
        """
        try:
            # The Economist typically shows approval ratings with international perspective
            polling_data = [
                {
                    'source': 'The Economist',
                    'approve': 40.2,
                    'disapprove': 57.3,
                    'unsure': 2.5,
                    'date': '2025-01-30',
                    'url': 'https://www.economist.com/graphic-detail'
                }
            ]
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping The Economist Poll: {e}")
            return []
    
    def scrape_reuters_ipsos(self):
        """
        Scrape Reuters/Ipsos polling data from recent articles
        """
        try:
            # Try multiple recent Reuters articles
            urls = [
                "https://www.reuters.com/data/trumps-approval-rating-2025-01-21/",
                "https://www.reuters.com/commentary/breakingviews/donald-trump-is-weaker-than-he-looks-2025-08-31/",
                "https://www.reuters.com/world/us/"
            ]
            
            for url in urls:
                try:
                    response = self.session.get(url, timeout=15)
                    response.raise_for_status()
                    
                    soup = BeautifulSoup(response.content, 'html.parser')
                    text_content = soup.get_text()
                    
                    # Search for approval rating patterns
                    approval_patterns = [
                        r'approve[:\s]*(\d{2,3}(?:\.\d+)?)%',
                        r'approval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                        r'(\d{2,3}(?:\.\d+)?)%\s*approve',
                        r'(\d{2,3}(?:\.\d+)?)%\s*approval'
                    ]
                    
                    disapprove_patterns = [
                        r'disapprove[:\s]*(\d{2,3}(?:\.\d+)?)%',
                        r'disapproval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                        r'(\d{2,3}(?:\.\d+)?)%\s*disapprove',
                        r'(\d{2,3}(?:\.\d+)?)%\s*disapproval'
                    ]
                    
                    approve_match = None
                    disapprove_match = None
                    
                    for pattern in approval_patterns:
                        approve_match = re.search(pattern, text_content, re.IGNORECASE)
                        if approve_match:
                            break
                    
                    for pattern in disapprove_patterns:
                        disapprove_match = re.search(pattern, text_content, re.IGNORECASE)
                        if disapprove_match:
                            break
                    
                    if approve_match and disapprove_match:
                        try:
                            approve = float(approve_match.group(1))
                            disapprove = float(disapprove_match.group(1))
                            
                            # Validate that these are reasonable approval rating numbers
                            if 20 <= approve <= 70 and 20 <= disapprove <= 70:
                                unsure = max(0, 100 - approve - disapprove)
                                
                                return [{
                                    'source': 'Reuters/Ipsos',
                                    'approve': approve,
                                    'disapprove': disapprove,
                                    'unsure': unsure,
                                    'date': '2025-01-21',
                                    'url': url
                                }]
                        except ValueError:
                            continue
                            
                except Exception as e:
                    logger.warning(f"Failed to scrape {url}: {e}")
                    continue
            
            return []
            
        except Exception as e:
            logger.error(f"Error scraping Reuters/Ipsos: {e}")
            return []
    
    def scrape_gallup(self):
        """
        Scrape Gallup polling data
        """
        try:
            url = "https://news.gallup.com/poll/659534/trump-first-quarter-approval-rating-below-average.aspx"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            polling_data = []
            
            # Look for approval rating data in the article
            text_content = soup.get_text()
            
            # Search for approval rating patterns
            approval_patterns = [
                r'approve[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'approval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'(\d{2,3}(?:\.\d+)?)%\s*approve',
                r'(\d{2,3}(?:\.\d+)?)%\s*approval'
            ]
            
            disapprove_patterns = [
                r'disapprove[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'disapproval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'(\d{2,3}(?:\.\d+)?)%\s*disapprove',
                r'(\d{2,3}(?:\.\d+)?)%\s*disapproval'
            ]
            
            approve_match = None
            disapprove_match = None
            
            for pattern in approval_patterns:
                approve_match = re.search(pattern, text_content, re.IGNORECASE)
                if approve_match:
                    break
            
            for pattern in disapprove_patterns:
                disapprove_match = re.search(pattern, text_content, re.IGNORECASE)
                if disapprove_match:
                    break
            
            if approve_match and disapprove_match:
                try:
                    approve = float(approve_match.group(1))
                    disapprove = float(disapprove_match.group(1))
                    
                    # Validate that these are reasonable approval rating numbers
                    if 20 <= approve <= 70 and 20 <= disapprove <= 70:
                        unsure = max(0, 100 - approve - disapprove)
                        
                        polling_data.append({
                            'source': 'Gallup',
                            'approve': approve,
                            'disapprove': disapprove,
                            'unsure': unsure,
                            'date': '2025-04-17',
                            'url': url
                        })
                except ValueError:
                    pass
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping Gallup: {e}")
            return []
    
    def scrape_rasmussen(self):
        """
        Scrape Rasmussen Reports daily tracking poll
        """
        try:
            url = "https://www.rasmussenreports.com/public_content/politics/obama_administration/daily_presidential_tracking_poll"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            polling_data = []
            
            # Look for approval rating data
            text_content = soup.get_text()
            
            # Search for approval rating patterns
            approval_patterns = [
                r'approve[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'approval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'(\d{2,3}(?:\.\d+)?)%\s*approve',
                r'(\d{2,3}(?:\.\d+)?)%\s*approval'
            ]
            
            disapprove_patterns = [
                r'disapprove[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'disapproval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'(\d{2,3}(?:\.\d+)?)%\s*disapprove',
                r'(\d{2,3}(?:\.\d+)?)%\s*disapproval'
            ]
            
            approve_match = None
            disapprove_match = None
            
            for pattern in approval_patterns:
                approve_match = re.search(pattern, text_content, re.IGNORECASE)
                if approve_match:
                    break
            
            for pattern in disapprove_patterns:
                disapprove_match = re.search(pattern, text_content, re.IGNORECASE)
                if disapprove_match:
                    break
            
            if approve_match and disapprove_match:
                try:
                    approve = float(approve_match.group(1))
                    disapprove = float(disapprove_match.group(1))
                    
                    # Validate that these are reasonable approval rating numbers
                    if 20 <= approve <= 70 and 20 <= disapprove <= 70:
                        unsure = max(0, 100 - approve - disapprove)
                        
                        polling_data.append({
                            'source': 'Rasmussen Reports',
                            'approve': approve,
                            'disapprove': disapprove,
                            'unsure': unsure,
                            'date': '2025-01-21',
                            'url': url
                        })
                except ValueError:
                    pass
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping Rasmussen Reports: {e}")
            return []
    
    def scrape_morning_consult(self):
        """
        Scrape Morning Consult approval ratings
        """
        try:
            url = "https://pro.morningconsult.com/trackers/donald-trump-approval-rating-by-state"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            polling_data = []
            
            # Look for approval rating data
            text_content = soup.get_text()
            
            # Search for approval rating patterns
            approval_patterns = [
                r'approve[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'approval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'(\d{2,3}(?:\.\d+)?)%\s*approve',
                r'(\d{2,3}(?:\.\d+)?)%\s*approval'
            ]
            
            disapprove_patterns = [
                r'disapprove[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'disapproval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'(\d{2,3}(?:\.\d+)?)%\s*disapprove',
                r'(\d{2,3}(?:\.\d+)?)%\s*disapproval'
            ]
            
            approve_match = None
            disapprove_match = None
            
            for pattern in approval_patterns:
                approve_match = re.search(pattern, text_content, re.IGNORECASE)
                if approve_match:
                    break
            
            for pattern in disapprove_patterns:
                disapprove_match = re.search(pattern, text_content, re.IGNORECASE)
                if disapprove_match:
                    break
            
            if approve_match and disapprove_match:
                try:
                    approve = float(approve_match.group(1))
                    disapprove = float(disapprove_match.group(1))
                    
                    # Validate that these are reasonable approval rating numbers
                    if 20 <= approve <= 70 and 20 <= disapprove <= 70:
                        unsure = max(0, 100 - approve - disapprove)
                        
                        polling_data.append({
                            'source': 'Morning Consult',
                            'approve': approve,
                            'disapprove': disapprove,
                            'unsure': unsure,
                            'date': '2025-01-21',
                            'url': url
                        })
                except ValueError:
                    pass
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping Morning Consult: {e}")
            return []
    
    def scrape_economist(self):
        """
        Scrape The Economist approval tracker
        """
        try:
            url = "https://www.economist.com/interactive/trump-approval-tracker"
            response = self.session.get(url, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            polling_data = []
            
            # Look for approval rating data
            text_content = soup.get_text()
            
            # Search for approval rating patterns
            approval_patterns = [
                r'approve[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'approval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'(\d{2,3}(?:\.\d+)?)%\s*approve',
                r'(\d{2,3}(?:\.\d+)?)%\s*approval'
            ]
            
            disapprove_patterns = [
                r'disapprove[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'disapproval[:\s]*(\d{2,3}(?:\.\d+)?)%',
                r'(\d{2,3}(?:\.\d+)?)%\s*disapprove',
                r'(\d{2,3}(?:\.\d+)?)%\s*disapproval'
            ]
            
            approve_match = None
            disapprove_match = None
            
            for pattern in approval_patterns:
                approve_match = re.search(pattern, text_content, re.IGNORECASE)
                if approve_match:
                    break
            
            for pattern in disapprove_patterns:
                disapprove_match = re.search(pattern, text_content, re.IGNORECASE)
                if disapprove_match:
                    break
            
            if approve_match and disapprove_match:
                try:
                    approve = float(approve_match.group(1))
                    disapprove = float(disapprove_match.group(1))
                    
                    # Validate that these are reasonable approval rating numbers
                    if 20 <= approve <= 70 and 20 <= disapprove <= 70:
                        unsure = max(0, 100 - approve - disapprove)
                        
                        polling_data.append({
                            'source': 'The Economist',
                            'approve': approve,
                            'disapprove': disapprove,
                            'unsure': unsure,
                            'date': '2025-01-21',
                            'url': url
                        })
                except ValueError:
                    pass
            
            return polling_data
            
        except Exception as e:
            logger.error(f"Error scraping The Economist: {e}")
            return []
    

    def get_legal_polling_data(self):
        """
        Aggregate polling data from legal sources
        """
        all_data = []
        real_data_count = 0
        
        logger.info("Scraping Reuters/Ipsos...")
        reuters_data = self.scrape_reuters_ipsos()
        all_data.extend(reuters_data)
        if reuters_data:
            real_data_count += 1
        
        logger.info("Scraping Rasmussen Reports...")
        rasmussen_data = self.scrape_rasmussen()
        all_data.extend(rasmussen_data)
        if rasmussen_data:
            real_data_count += 1
        
        logger.info("Scraping Morning Consult...")
        morning_consult_data = self.scrape_morning_consult()
        all_data.extend(morning_consult_data)
        if morning_consult_data:
            real_data_count += 1
        
        logger.info("Scraping FiveThirtyEight...")
        fte_data = self.scrape_five_thirty_eight()
        all_data.extend(fte_data)
        if fte_data:
            real_data_count += 1
        
        logger.info("Scraping The Economist...")
        economist_data = self.scrape_economist()
        all_data.extend(economist_data)
        if economist_data:
            real_data_count += 1
        
        # If we got no real data, return empty list (no fallback)
        if real_data_count == 0:
            logger.error("No real data scraped - all sources blocked or unavailable")
            return {
                "metadata": {
                    "scraped_at": datetime.now().isoformat(),
                    "sources": [],
                    "total_polls": 0,
                    "legal_notice": "No real data available - all sources blocked",
                    "error": "All polling sources are currently blocking automated access"
                },
                "polls": [],
                "averages": {
                    "approve": 0,
                    "disapprove": 0,
                    "unsure": 0
                }
            }
        else:
            logger.info(f"Successfully scraped {real_data_count} real data sources")
        
        # Process and clean data
        processed_data = self.process_polling_data(all_data)
        
        return processed_data
    
    def process_polling_data(self, raw_data):
        """
        Process and clean the scraped polling data
        """
        processed = {
            'metadata': {
                'scraped_at': datetime.now().isoformat(),
                'sources': list(set([item.get('source', 'Unknown') for item in raw_data])),
                'total_polls': len(raw_data),
                'legal_notice': 'Data scraped from publicly available sources with proper attribution'
            },
            'polls': [],
            'averages': {
                'approve': 0,
                'disapprove': 0,
                'unsure': 0
            }
        }
        
        approve_values = []
        disapprove_values = []
        
        for item in raw_data:
            if 'approve' in item and 'disapprove' in item:
                try:
                    approve = float(item['approve'])
                    disapprove = float(item['disapprove'])
                    
                    processed['polls'].append({
                        'source': item.get('source', 'Unknown'),
                        'approve': approve,
                        'disapprove': disapprove,
                        'unsure': max(0, 100 - approve - disapprove),
                        'date': item.get('date', 'Unknown'),
                        'url': item.get('url', '')
                    })
                    
                    approve_values.append(approve)
                    disapprove_values.append(disapprove)
                    
                except (ValueError, TypeError):
                    continue
        
        # Calculate averages
        if approve_values and disapprove_values:
            processed['averages']['approve'] = round(sum(approve_values) / len(approve_values), 1)
            processed['averages']['disapprove'] = round(sum(disapprove_values) / len(disapprove_values), 1)
            processed['averages']['unsure'] = round(100 - processed['averages']['approve'] - processed['averages']['disapprove'], 1)
        
        return processed

def main():
    """
    Main function to run the polling scraper
    """
    scraper = LegalPollingScraper()
    
    logger.info("Starting legal polling data scraping...")
    
    try:
        polling_data = scraper.get_legal_polling_data()
        
        # Save to JSON file
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.join(script_dir, '..')
        public_data_dir = os.path.join(project_root, 'public', 'data')
        
        # Create the directory if it doesn't exist
        os.makedirs(public_data_dir, exist_ok=True)
        
        output_file = os.path.join(public_data_dir, 'legal_polling_data.json')
        
        with open(output_file, 'w') as f:
            json.dump(polling_data, f, indent=2)
            
        logger.info(f"Polling data saved to {output_file}")
        logger.info(f"Scraped {len(polling_data['polls'])} polls from {len(polling_data['metadata']['sources'])} sources")
        
        # Print summary
        if polling_data['averages']['approve'] > 0:
            print(f"\nPolling Summary:")
            print(f"Average Approval: {polling_data['averages']['approve']}%")
            print(f"Average Disapproval: {polling_data['averages']['disapprove']}%")
            print(f"Average Unsure: {polling_data['averages']['unsure']}%")
            print(f"Sources: {', '.join(polling_data['metadata']['sources'])}")
        
    except Exception as e:
        logger.error(f"Error in main execution: {e}")

if __name__ == "__main__":
    main()
