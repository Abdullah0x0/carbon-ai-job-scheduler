import os
import groq
from dotenv import load_dotenv
load_dotenv()

# Load Groq API key from environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = groq.Groq(api_key=GROQ_API_KEY)

def get_optimal_schedule(task, carbon_data):
    """
    Use Groq's API to perform AI inference for scheduling.
    """
    payload = {
        "task_name": task.task_name,
        "duration": task.duration_hours,
        "resource_usage": task.resource_usage,
        "carbon_intensity": carbon_data["carbon_intensity"]
    }
    
    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{
                "role": "user",
                "content": f"Given this task information: {payload}, provide scheduling recommendations considering the carbon intensity."
            }]
        )
        # Extract the response content
        recommendation_text = response.choices[0].message.content if response.choices else "No recommendation available"
        
        # Calculate expected optimized intensity
        # For demonstration, assume we can achieve 20-40% reduction based on task duration
        reduction_factor = min(0.4, 0.2 + (task.duration_hours / 24) * 0.2)  # More flexible tasks can achieve greater reductions
        expected_intensity = carbon_data["carbon_intensity"] * (1 - reduction_factor)
        
        return {
            "recommendation": recommendation_text,
            "expected_intensity": expected_intensity
        }
    except Exception as e:
        # Fallback recommendation in case of an error with Groq API call
        return {
            "option": "Fallback",
            "message": f"Error with Groq API: {str(e)}. Using fallback recommendation.",
            "expected_intensity": carbon_data["carbon_intensity"]
        }
