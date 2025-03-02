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
    Task Analysis Request:
    - Task Name: {task.task_name}
    - Duration: {task.duration_hours} hours
    - Resource Profile: {task.resource_usage}
    - Region: {carbon_data.get('location', 'Unknown')}
    - Current Grid Load: {carbon_data['carbon_intensity']} {carbon_data.get('unit', 'gCO2/kWh')}

    Provide technical optimization insights focusing on:
    1. Resource utilization patterns
    2. Performance vs. energy tradeoffs
    3. System-level optimization opportunities
    """
    
    messages = [
        {
            "role": "system",
            "content": """You are a technical optimization advisor specializing in high-performance computing and resource scheduling. Structure your response in 2-3 paragraphs:

1. First paragraph: Provide context about the current conditions and task requirements
2. Following paragraphs: Give specific technical recommendations focusing on:
   - Resource optimization strategies
   - System-level improvements
   - Performance/energy tradeoffs

Keep each paragraph focused and concise. Use technical language but remain clear and actionable. Total response should be under 200 words."""
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
            temperature=0.4,  # More consistent responses
            max_tokens=300    # Allow for slightly longer, structured response
        )
        insights = response.choices[0].message.content.strip()
        return insights
        
    except Exception as e:
        print(f"Error calling Perplexity API: {str(e)}")
        return """Current system conditions indicate high resource availability with moderate load levels. Task parameters suggest standard compute requirements.

Consider implementing dynamic voltage and frequency scaling (DVFS) to optimize power consumption while maintaining performance targets. This approach typically yields 15-30% energy savings with minimal impact on execution time."""

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
