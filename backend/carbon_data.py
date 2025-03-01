import random

def get_carbon_intensity():
    """
    Simulate fetching real-time carbon intensity data.
    Replace this simulation with API call to a service like WattTime.
    """
    # For testing, return a random carbon intensity (gCO2/kWh)
    carbon_intensity = random.randint(100, 500)
    return {"carbon_intensity": carbon_intensity, "unit": "gCO2/kWh"}

# Test the function
if __name__ == "__main__":
    data = get_carbon_intensity()
    print("Carbon Intensity Data:", data)