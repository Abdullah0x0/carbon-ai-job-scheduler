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
    Task: {task.task_name} ({task.duration_hours} hours, {task.resource_usage})
    Current Carbon Intensity: {carbon_data['carbon_intensity']} {carbon_data.get('unit', 'gCO2/kWh')}
    Location: {carbon_data.get('location', 'Unknown')}

    Provide 3 key insights about this task's environmental impact and optimization.
    Format each insight as a bullet point starting with •
    
    Example format:
    • Current carbon intensity is 20% above average
    • Schedule during 2-6 AM for optimal efficiency
    • Potential savings of 45 kg CO2 (30% reduction)
    """
    
    messages = [
        {
            "role": "system",
            "content": "You are a sustainability advisor providing quick, actionable insights for compute task scheduling. Format all insights as bullet points starting with •. Be concise and specific, focusing on immediate actions and concrete numbers."
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
            messages=messages,
            temperature=0.5,  # More consistent responses
            max_tokens=250    # Keep it brief
        )
        insights = response.choices[0].message.content.strip()
        # Ensure each line starts with a bullet point
        insights = '\n'.join([
            f"• {line.lstrip('• -').strip()}" 
            for line in insights.split('\n') 
            if line.strip()
        ])
        return insights
        
    except Exception as e:
        print(f"Error calling Perplexity API: {str(e)}")
        return "• Consider scheduling during off-peak hours (typically night time) for optimal efficiency."

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
