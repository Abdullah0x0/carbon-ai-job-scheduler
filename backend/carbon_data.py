import os
import random
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv
load_dotenv()

def check_watttime_access(token):
    """Check access status for WattTime API"""
    url = "https://api.watttime.org/v3/my-access"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        print("Access check response:", response.json())
        return response.json()
    except Exception as e:
        print(f"Error checking WattTime access: {e}")
        return None

def get_watttime_token():
    """Get login token from WattTime API"""
    username = os.getenv("WATTTIME_USERNAME")
    password = os.getenv("WATTTIME_PASSWORD")
    
    if not username or not password:
        raise ValueError("WattTime credentials not found in environment variables")
    
    login_url = "https://api.watttime.org/login"
    try:
        response = requests.get(login_url, auth=HTTPBasicAuth(username, password))
        response.raise_for_status()
        print("Login successful")
        token = response.json()['token']
        # Check access after getting token
        check_watttime_access(token)
        return token
    except Exception as e:
        print(f"Error getting WattTime token: {e}")
        return None

def get_carbon_intensity():
    """
    Fetch real-time carbon intensity data from the WattTime API.
    Documentation: https://www.watttime.org/api-documentation/
    """
    token = get_watttime_token()
    if not token:
        # Fallback to simulated data if authentication fails
        print("Authentication failed!!!!!")
        carbon_intensity = random.randint(300, 500)  # Use a reasonable default range
        return {"carbon_intensity": carbon_intensity, "unit": "gCO2/kWh"}
    
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
        #print(f"Forecast data: {forecast_data}")
        
        # Get the current carbon intensity from the first data point
        current_intensity = forecast_data["data"][0]["value"]
        current_timestamp = forecast_data["data"][0]["point_time"]
        
        return {
            "carbon_intensity": current_intensity,
            "unit": "lbs_co2_per_mwh",
            "location": region,
            "timestamp": current_timestamp
        }
    except Exception as e:
        print("Error fetching carbon intensity from WattTime API:", e)
        print("Using simulated data")
        # Fallback: return a simulated random value
        carbon_intensity = random.randint(300, 500)  # Use same range as above for consistency
        return {"carbon_intensity": carbon_intensity, "unit": "gCO2/kWh"}


# # Test the function
# if __name__ == "__main__":
#     data = get_carbon_intensity()
#     print("Carbon Intensity Data:", data)