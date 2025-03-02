# backend/insights.py
import os
import json
import requests
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv(override=True)

def debug_env_vars():
    """Debug function to check environment variables"""
    perplexity_key = os.getenv("PERPLEXITY_API_KEY")
    groq_key = os.getenv("GROQ_API_KEY")
    watttime_user = os.getenv("WATTTIME_USERNAME")
    watttime_pass = os.getenv("WATTTIME_PASSWORD")
    
    print("\nEnvironment Variables Status:")
    print(f"PERPLEXITY_API_KEY present: {bool(perplexity_key)}")
    print(f"GROQ_API_KEY present: {bool(groq_key)}")
    print(f"WATTTIME_USERNAME present: {bool(watttime_user)}")
    print(f"WATTTIME_PASSWORD present: {bool(watttime_pass)}")
    
    if perplexity_key:
        print(f"Perplexity key length: {len(perplexity_key)}")
        print(f"Perplexity key starts with: {perplexity_key[:10]}...")

def get_fallback_insights(task, carbon_data):
    """Generate fallback insights when API is unavailable"""
    task_type = task.task_name.lower()
    resource_profile = task.resource_usage.lower()
    duration = task.duration_hours
    intensity = carbon_data['carbon_intensity']
    unit = carbon_data.get('unit', 'gCO2/kWh')
    
    # Determine task category
    compute_intensive = any(word in task_type for word in ['training', 'processing', 'analysis', 'compute'])
    io_intensive = any(word in task_type for word in ['backup', 'transfer', 'download', 'upload'])
    
    base_insights = f"""Current grid carbon intensity is {intensity} {unit}. Based on your {duration}-hour {task_type} task with {resource_profile} resource profile, here are key optimization insights:

"""
    
    if compute_intensive:
        base_insights += """• Consider implementing dynamic voltage and frequency scaling (DVFS) to optimize power consumption while maintaining performance targets. This typically yields 15-30% energy savings.
• Batch processing and workload consolidation can improve resource utilization and reduce idle power consumption.
• Monitor and adjust CPU/GPU clock speeds based on workload demands."""
    elif io_intensive:
        base_insights += """• Schedule data transfers during periods of lower grid carbon intensity to minimize environmental impact.
• Implement data compression to reduce transfer volumes and storage requirements.
• Consider using local caching and incremental processing where applicable."""
    else:
        base_insights += """• Implement automated resource scaling based on actual usage patterns.
• Consider containerization to improve resource isolation and utilization.
• Use task checkpointing to enable flexible scheduling around optimal grid conditions."""
        
    return base_insights

def get_insights(task, carbon_data):
    """
    Generate insights using Perplexity API with fallback to local generation.
    """
    # Debug environment variables
    debug_env_vars()
    
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

    # Try to use Perplexity API if available
    perplexity_key = os.getenv("PERPLEXITY_API_KEY")
    if not perplexity_key:
        print("\nNo Perplexity API key found in environment")
        return get_fallback_insights(task, carbon_data)

    try:
        print("\nAttempting to call Perplexity API...")
        
        # First try a direct API call to verify the key
        verify_url = "https://api.perplexity.ai/chat/completions"
        headers = {
            "Authorization": f"Bearer {perplexity_key}",
            "Content-Type": "application/json"
        }
        
        # Simple test request
        test_data = {
            "model": "sonar-pro-2",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 5
        }
        
        print("\nTesting API connection...")
        try:
            test_response = requests.post(verify_url, headers=headers, json=test_data)
            print(f"Test API Status: {test_response.status_code}")
            print(f"Test API Response: {test_response.text[:200]}")
        except Exception as e:
            print(f"Test API call failed: {str(e)}")
            return get_fallback_insights(task, carbon_data)

        if test_response.status_code != 200:
            print(f"API test failed with status {test_response.status_code}")
            return get_fallback_insights(task, carbon_data)

        print("\nAPI test successful, making main API call...")
        
        # Make the actual API call
        try:
            response = requests.post(
                verify_url,
                headers=headers,
                json={
                    "model": "sonar-pro-2",
                    "messages": messages,
                    "temperature": 0.4,
                    "max_tokens": 300
                },
                timeout=30
            )
            
            print(f"\nAPI Response Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                insights = result['choices'][0]['message']['content'].strip()
                if insights:
                    print("Successfully received insights from API")
                    return insights
                else:
                    print("Received empty insights from API")
            else:
                print(f"API error: {response.text}")
                
        except Exception as e:
            print(f"\nAPI call failed: {str(e)}")
            if hasattr(e, 'response'):
                print(f"Response status: {e.response.status_code}")
                print(f"Response body: {e.response.text}")
            return get_fallback_insights(task, carbon_data)

    except Exception as e:
        print(f"\nUnexpected error: {str(e)}")
        return get_fallback_insights(task, carbon_data)

    print("\nFalling back to local insights generation")
    return get_fallback_insights(task, carbon_data)

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
