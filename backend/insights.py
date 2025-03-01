# backend/insights.py
import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
if not PERPLEXITY_API_KEY:
    raise ValueError("Perplexity API key not found in environment variables")

def get_insights(task, carbon_data):
    """
    Call the Perplexity API to fetch energy-saving insights using their chat completions endpoint.
    """
    prompt = f"""
    Task: {task.task_name}
    Duration: {task.duration_hours} hours
    Current Carbon Intensity: {carbon_data['carbon_intensity']} {carbon_data.get('unit', 'gCO2/kWh')}
    Location: {carbon_data.get('location', 'Unknown')}
    
    Please provide specific insights and recommendations for scheduling this compute task 
    to minimize carbon emissions. Consider the current carbon intensity and task duration.
    """
    
    messages = [
        {
            "role": "system",
            "content": "You are an AI assistant providing insights on energy-efficient task scheduling."
        },
        {
            "role": "user", 
            "content": prompt
        }
    ]

    client = OpenAI(api_key=PERPLEXITY_API_KEY, base_url="https://api.perplexity.ai")
    
    try:
        response = client.chat.completions.create(
            model="sonar-pro",
            messages=messages
        )
        return response.choices[0].message.content
        
    except Exception as e:
        print(f"Error calling Perplexity API: {str(e)}")
        return "Unable to fetch insights at this time. Please try again later."

# # Test function
# if __name__ == "__main__":
#     # Create a dummy task object with required attributes
#     class DummyTask:
#         def __init__(self, task_name, duration_hours):
#             self.task_name = task_name
#             self.duration_hours = duration_hours
    
#     # Create dummy data
#     test_task = DummyTask("ML Model Training", 4)
#     test_carbon_data = {
#         "carbon_intensity": 250,
#         "unit": "gCO2/kWh",
#         "location": "California"
#     }
    
#     # Test the get_insights function
#     insights = get_insights(test_task, test_carbon_data)
#     print("\nTest Results:")
#     print("Task:", test_task.task_name)
#     print("Duration:", test_task.duration_hours, "hours")
#     print("\nInsights:")
#     print(insights)
