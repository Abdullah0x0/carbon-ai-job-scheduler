import os
import groq
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv
load_dotenv()

# Get API key from environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

try:
    # Initialize Groq client with basic configuration
    client = groq.Groq(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/v1"
    )
except Exception as e:
    print(f"Error initializing Groq client: {e}")
    # Fallback to a simple client initialization
    client = groq.Groq(api_key=GROQ_API_KEY)

def get_optimal_schedule(task, carbon_data):
    """Get optimal schedule recommendation using Groq's LLM"""
    try:
        # Prepare the prompt
        prompt = f"""Given a task with the following details:
- Task Name: {task.task_name}
- Duration: {task.duration_hours} hours
- Resource Usage: {task.resource_usage}

And current carbon intensity data:
{json.dumps(carbon_data, indent=2)}

Provide scheduling recommendations to minimize carbon impact. Consider:
1. Best time to run the task
2. Expected carbon intensity during that time
3. Potential carbon savings

Return the response as a JSON object with:
- recommended_start_time
- expected_intensity
- carbon_savings_estimate
- reasoning
"""

        # Get completion from Groq
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that provides scheduling recommendations to minimize carbon impact of computing tasks."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="mixtral-8x7b-32768",
            temperature=0.7,
            max_tokens=1000
        )

        # Parse the response
        response_text = chat_completion.choices[0].message.content
        try:
            recommendation = json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback if response is not valid JSON
            recommendation = {
                "recommended_start_time": (datetime.now() + timedelta(hours=1)).isoformat(),
                "expected_intensity": carbon_data.get("carbon_intensity", 0) * 0.9,
                "carbon_savings_estimate": 10,
                "reasoning": "Based on current carbon intensity trends"
            }

        return recommendation

    except Exception as e:
        print(f"Error in get_optimal_schedule: {e}")
        # Return a default recommendation if there's an error
        return {
            "recommended_start_time": (datetime.now() + timedelta(hours=1)).isoformat(),
            "expected_intensity": carbon_data.get("carbon_intensity", 0),
            "carbon_savings_estimate": 0,
            "reasoning": "Error occurred while getting recommendations"
        }
