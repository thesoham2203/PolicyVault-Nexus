# app/utils/device_info.py
import re
from typing import Optional

def get_device_name_from_user_agent(user_agent: str) -> str:
    """Extract a friendly device name from User-Agent string"""
    if not user_agent:
        return "Unknown Device"
    
    # Common patterns
    patterns = [
        (r'\((.*?)\)', "Full device info"),  # Extract content within parentheses
        (r'Linux; Android (\d+); (.*?) Build', "Android Device"),  # Android devices
        (r'iPhone OS (\d+_\d+)', "iPhone"),  # iPhones
        (r'Macintosh; Intel Mac OS X (\d+_\d+)', "Mac"),  # Macs
        (r'Windows NT (\d+\.\d+)', "Windows PC"),  # Windows
        (r'CrOS (\w+) (\d+\.\d+)', "Chromebook"),  # Chromebooks
    ]
    
    for pattern, default in patterns:
        match = re.search(pattern, user_agent)
        if match:
            # Return the most specific group that has content
            for group in match.groups():
                if group and group.strip():
                    return f"{default} ({group.strip()})"
            return default
    
    # Fallback to browser detection if no device info found
    browser = get_browser_name(user_agent)
    return f"{browser} on Unknown Device" if browser else "Unknown Device"

def get_browser_name(user_agent: str) -> Optional[str]:
    """Extract browser name from User-Agent"""
    browsers = {
        'Chrome': 'Chrome',
        'Firefox': 'Firefox',
        'Safari': 'Safari',
        'Edge': 'Edge',
        'Opera': 'Opera',
        'MSIE': 'Internet Explorer',
        'Trident': 'Internet Explorer'
    }
    
    for name, display_name in browsers.items():
        if name in user_agent:
            return display_name
    return None