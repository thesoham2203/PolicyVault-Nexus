import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime
import pytz
from app.config import settings
from typing import Optional, Dict, Any
import json
from supabase import create_client, Client

# Initialize Supabase client
supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

class LoginAnomalyDetector:
    def __init__(self):
        self.global_model = IsolationForest(n_estimators=100, contamination=0.01, random_state=42)
        self.admin_models = {}
        self.is_global_fitted = False
        self.initialize_tables()

    def initialize_tables(self):
        """Ensure required tables exist"""
        try:
            # This will fail gracefully if table already exists
            supabase.rpc('create_admin_login_patterns_table').execute()
        except Exception as e:
            print(f"Table initialization note: {str(e)}")

    def preprocess_features(self, login_time: datetime, ip_location: Dict[str, Any], admin_id: Optional[str] = None) -> np.ndarray:
        """Convert login data into features for anomaly detection"""
        # Basic time features
        login_hour = login_time.hour
        login_minute = login_time.minute
        login_day_of_week = login_time.weekday()
        
        # Timezone handling
        try:
            timezone = ip_location.get("timezone", "UTC")
            user_tz = pytz.timezone(timezone)
            local_time = login_time.astimezone(user_tz)
            local_hour = local_time.hour
            is_daytime = 6 <= local_hour <= 18
        except:
            local_hour = login_hour
            is_daytime = 6 <= login_hour <= 18

        # Country risk (simplified example)
        country_risk = 0.0
        country = ip_location.get("country", "").upper()
        if country in ["CN", "RU", "KP", "IR"]:  # Example high-risk countries
            country_risk = 1.0

        features = [
            login_hour / 24.0,
            login_minute / 60.0,
            login_day_of_week / 7.0,
            local_hour / 24.0,
            float(is_daytime),
            country_risk
        ]

        # Add admin-specific features if available
        if admin_id:
            pattern = self.get_admin_pattern(admin_id)
            if pattern:
                usual_hour = pattern.get("avg_hour", 12)
                main_country = max(
                    pattern.get("common_countries", {}).items(),
                    key=lambda x: x[1],
                    default=(country, 0)
                )[0]
                
                features.extend([
                    usual_hour / 24.0,
                    1.0 if country == main_country else 0.0
                ])

        return np.array(features).reshape(1, -1)
    
    def get_admin_pattern(self, admin_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve admin's login patterns safely"""
        try:
            response = supabase.table("admin_login_patterns")\
                .select("*")\
                .eq("admin_id", admin_id)\
                .execute()
            
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Safe pattern retrieval error: {str(e)}")
            return None

    def update_admin_pattern(self, admin_id: str, login_time: datetime, ip_location: Dict[str, Any]):
        """Update admin patterns with proper error handling"""
        try:
            country = ip_location.get("country", "UNKNOWN").upper()
            hour = login_time.hour + login_time.minute/60.0
            
            # Get or create pattern
            pattern = self.get_admin_pattern(admin_id)
            
            if pattern:
                # Update existing pattern
                new_count = pattern["login_count"] + 1
                new_avg = (pattern["avg_hour"] * pattern["login_count"] + hour) / new_count
                
                countries = pattern.get("common_countries", {})
                countries[country] = countries.get(country, 0) + 1
                
                supabase.table("admin_login_patterns").update({
                    "login_count": new_count,
                    "avg_hour": new_avg,
                    "common_countries": countries
                }).eq("admin_id", admin_id).execute()
            else:
                # Create new pattern
                supabase.table("admin_login_patterns").insert({
                    "admin_id": admin_id,
                    "login_count": 1,
                    "avg_hour": hour,
                    "common_countries": {country: 1}
                }).execute()
                
        except Exception as e:
            print(f"Safe pattern update error: {str(e)}")

    def detect_anomaly(self, timestamp: datetime, location: Dict[str, Any], admin_id: Optional[str] = None) -> float:
        """Safe anomaly detection with fallbacks"""
        try:
            features = self.preprocess_features(timestamp, location, admin_id)
            
            # Global score
            if self.is_global_fitted:
                global_score = 0.5 - (self.global_model.decision_function(features)[0] / 2.0)
            else:
                global_score = 0.5
                
            # Admin-specific score if available
            final_score = global_score
            if admin_id and admin_id in self.admin_models:
                admin_score = 0.5 - (self.admin_models[admin_id].decision_function(features)[0] / 2.0)
                final_score = 0.3 * global_score + 0.7 * admin_score

            # Update patterns for non-anomalous logins
            if admin_id and final_score < 0.7:
                self.update_admin_pattern(admin_id, timestamp, location)
                
            return max(0.0, min(1.0, final_score))
            
        except Exception as e:
            print(f"Anomaly detection error: {str(e)}")
            return 0.5  # Neutral score on error