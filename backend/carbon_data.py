import os
import random
import requests
from datetime import datetime, timedelta
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv
load_dotenv()

def check_watttime_access(token):
    """Check access status for WattTime API"""
    url = "https://api.watttime.org/v3/my-access"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        print(f"Checking WattTime access with token: {token[:10]}...")
        response = requests.get(url, headers=headers)
        print(f"Access check response status: {response.status_code}")
        if response.status_code != 200:
            print(f"Access check error response: {response.text}")
        response.raise_for_status()
        access_data = response.json()
        print("Access check response:", access_data)
        return access_data
    except Exception as e:
        print(f"Error checking WattTime access: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        if isinstance(e, requests.exceptions.RequestException):
            print(f"Request error details: {e.response.text if e.response else 'No response'}")
        return None

def get_watttime_token():
    """Get login token from WattTime API"""
    username = os.getenv("WATTTIME_USERNAME")
    password = os.getenv("WATTTIME_PASSWORD")
    
    print(f"Checking WattTime credentials - Username present: {bool(username)}, Password present: {bool(password)}")
    
    if not username or not password:
        print("WattTime credentials not found in environment variables")
        return None
    
    login_url = "https://api.watttime.org/login"
    try:
        print(f"Attempting to login to WattTime API with username: {username}")
        response = requests.get(login_url, auth=HTTPBasicAuth(username, password))
        print(f"WattTime login response status: {response.status_code}")
        if response.status_code != 200:
            print(f"WattTime login error response: {response.text}")
        response.raise_for_status()
        print("Login successful")
        token = response.json()['token']
        # Check access after getting token
        access_data = check_watttime_access(token)
        print(f"Access check result: {access_data}")
        return token
    except Exception as e:
        print(f"Error getting WattTime token: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        if isinstance(e, requests.exceptions.RequestException):
            print(f"Request error details: {e.response.text if e.response else 'No response'}")
        return None

def generate_simulated_data():
    """Generate simulated carbon intensity data with a realistic pattern"""
    base_intensity = random.randint(600, 800)
    current_time = datetime.utcnow()
    
    # Simulate 24 hours of data with 15-minute intervals
    data = []
    for i in range(96):  # 24 hours * 4 (15-minute intervals)
        time_offset = timedelta(minutes=15 * i)
        # Add some random variation to create a realistic pattern
        variation = random.randint(-50, 50)
        # Time of day variation (lower at night, higher during peak hours)
        hour = (current_time + time_offset).hour
        if 0 <= hour < 6:  # Night hours
            time_factor = -100
        elif 12 <= hour < 18:  # Peak hours
            time_factor = 100
        else:  # Other hours
            time_factor = 0
            
        value = base_intensity + variation + time_factor
        data.append({
            "point_time": (current_time + time_offset).isoformat(),
            "value": max(300, min(1200, value))  # Keep values in realistic range
        })
    
    return {
        "carbon_intensity": data[0]["value"],
        "unit": "lbs_co2_per_mwh",
        "location": "SIMULATED_CAISO_NORTH",
        "timestamp": data[0]["point_time"],
        "forecast": data
    }

def get_carbon_intensity():
    """
    Fetch real-time carbon intensity data from the WattTime API.
    Falls back to simulated data if the API is unavailable.
    """
    token = get_watttime_token()
    if not token:
        print("Using simulated data due to authentication failure")
        return generate_simulated_data()
    
    # First get the region for the coordinates
    region_url = "https://api.watttime.org/v3/region-from-loc"
    headers = {"Authorization": f"Bearer {token}"}
    params = {
        "latitude": "37.7749",  # San Francisco coordinates
        "longitude": "-122.4194",
        "signal_type": "co2_moer"
    }
    
    try:
        region_response = requests.get(region_url, headers=headers, params=params)
        region_response.raise_for_status()
        region_data = region_response.json()
        region = region_data["region"]
        print(f"Region: {region}")
        
        # Get forecast data for the region
        forecast_url = "https://api.watttime.org/v3/forecast"
        forecast_params = {
            "region": region,
            "signal_type": "co2_moer"
        }
        
        forecast_response = requests.get(forecast_url, headers=headers, params=forecast_params)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()
        
        return {
            "carbon_intensity": forecast_data["data"][0]["value"],
            "unit": "lbs_co2_per_mwh",
            "location": region,
            "timestamp": forecast_data["data"][0]["point_time"],
            "forecast": forecast_data["data"]
        }
    except Exception as e:
        print(f"Error fetching carbon intensity from WattTime API: {e}")
        print("Using simulated data")
        return generate_simulated_data()

# Test the function
if __name__ == "__main__":
    data = get_carbon_intensity()
    print("Carbon Intensity Data:", data)