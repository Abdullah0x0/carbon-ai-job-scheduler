import os
import groq
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv
load_dotenv()

# Get API key from environment variable
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    print("Groq API key not found in environment variables - using fallback recommendation system")
    client = None
else:
    try:
        # Initialize Groq client with basic configuration
        client = groq.Groq(
            api_key=GROQ_API_KEY,
        )
    except Exception as e:
        print(f"Error initializing Groq client: {e}")
        client = None

def calculate_carbon_savings(baseline_intensity, optimized_intensity, duration_hours, resource_usage):
    """Calculate potential carbon savings based on intensity difference"""
    # Convert resource usage string to numeric value (assume high/medium/low scale)
    usage_factors = {"high": 1.0, "medium": 0.6, "low": 0.3}
    usage_factor = usage_factors.get(resource_usage.lower(), 0.5)
    
    # Calculate savings (in kg CO2)
    intensity_difference = baseline_intensity - optimized_intensity
    hours = float(duration_hours)
    # Assume 1 unit of resource usage = 1 kWh for simplicity
    savings = (intensity_difference * hours * usage_factor) / 1000
    return max(0, savings)  # Ensure non-negative savings

def get_optimal_schedule(task, carbon_data):
    """Get optimal schedule recommendation using Groq's LLM or fallback system"""
    if not client:
        print("Using fallback recommendation system")
        return generate_fallback_recommendation(task, carbon_data)
        
    try:
        # Prepare the prompt with more context and constraints
        prompt = f"""You are an AI scheduling assistant specializing in carbon-aware computing. Your task is to analyze the following job and provide scheduling recommendations in JSON format.

Task Details:
- Name: {task.task_name}
- Duration: {task.duration_hours} hours
- Resource Usage Level: {task.resource_usage}

Current Carbon Intensity: {carbon_data.get('carbon_intensity', 0)} {carbon_data.get('unit', 'gCO2/kWh')}
Time: {datetime.now().isoformat()}

Analyze the task considering:
1. Daily carbon intensity patterns (typically lowest at night/early morning)
2. Task resource usage impact ({task.resource_usage})
3. Duration impact ({task.duration_hours} hours)
4. Current intensity vs historical averages
5. Potential carbon and cost savings

Provide a detailed scheduling recommendation in the following JSON format:
{{
    "recommended_start_time": "ISO datetime string",
    "expected_intensity": "number (gCO2/kWh)",
    "carbon_savings_estimate": "number (kg CO2)",
    "confidence_score": "number between 0-1",
    "reasoning": "detailed explanation including environmental impact analysis",
    "sustainability_impact": {{
        "carbon_reduction_percentage": "number",
        "equivalent_trees_planted": "number",
        "energy_cost_savings": "number"
    }},
    "alternative_windows": [
        {{
            "start_time": "ISO datetime string",
            "expected_intensity": "number (gCO2/kWh)",
            "reason": "explanation for this alternative"
        }}
    ]
}}

Make your reasoning detailed and focused on environmental impact. Include specific sustainability metrics and comparisons.
Respond ONLY with the JSON object, no additional text."""

        # Get completion from Groq
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a carbon-aware computing scheduler that returns ONLY valid JSON responses following the exact format specified in the prompt. No additional text or explanations outside the JSON structure."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="mixtral-8x7b-32768",
            temperature=0.3,  # Lower temperature for more consistent JSON
            max_tokens=1000
        )

        # Parse the response
        response_text = chat_completion.choices[0].message.content.strip()
        
        # Remove any potential markdown code block markers
        response_text = response_text.replace('```json', '').replace('```', '').strip()
        
        try:
            recommendation = json.loads(response_text)
            
            # Ensure all required fields are present
            required_fields = ['recommended_start_time', 'expected_intensity', 'confidence_score', 'reasoning', 'sustainability_impact']
            if not all(field in recommendation for field in required_fields):
                raise ValueError("Missing required fields in recommendation")
            
            # Calculate actual carbon savings
            current_intensity = carbon_data.get("carbon_intensity", 0)
            expected_intensity = recommendation.get("expected_intensity", current_intensity * 0.9)
            carbon_savings = calculate_carbon_savings(
                current_intensity,
                expected_intensity,
                task.duration_hours,
                task.resource_usage
            )
            
            # Calculate sustainability metrics
            carbon_reduction = ((current_intensity - expected_intensity) / current_intensity) * 100
            trees_equivalent = carbon_savings * 0.0165  # Rough estimate: 1 kg CO2 = 0.0165 trees/year
            cost_savings = carbon_savings * 0.05  # Assuming $0.05 per kg CO2 saved
            
            # Update recommendation with calculated metrics
            recommendation["carbon_savings_estimate"] = carbon_savings
            recommendation["sustainability_impact"] = {
                "carbon_reduction_percentage": round(carbon_reduction, 2),
                "equivalent_trees_planted": round(trees_equivalent, 2),
                "energy_cost_savings": round(cost_savings, 2)
            }
            
            # Ensure alternative_windows is a list with reasons
            if "alternative_windows" not in recommendation:
                recommendation["alternative_windows"] = []
            
            return recommendation

        except (json.JSONDecodeError, ValueError) as e:
            print(f"Error parsing Groq response: {e}")
            print(f"Raw response: {response_text}")
            # Enhanced fallback with realistic calculations
            current_time = datetime.now()
            optimal_hour = 2  # 2 AM typically has lower carbon intensity
            recommended_time = current_time.replace(hour=optimal_hour, minute=0)
            if recommended_time < current_time:
                recommended_time += timedelta(days=1)
                
            current_intensity = carbon_data.get("carbon_intensity", 0)
            expected_intensity = current_intensity * 0.8  # Assume 20% reduction during optimal time
            
            carbon_savings = calculate_carbon_savings(
                current_intensity,
                expected_intensity,
                task.duration_hours,
                task.resource_usage
            )
            
            recommendation = {
                "recommended_start_time": recommended_time.isoformat(),
                "expected_intensity": expected_intensity,
                "carbon_savings_estimate": carbon_savings,
                "confidence_score": 0.7,
                "reasoning": "Scheduled for typical low-carbon intensity period (early morning) based on historical patterns",
                "alternative_windows": [
                    {
                        "start_time": (recommended_time + timedelta(days=1)).isoformat(),
                        "expected_intensity": expected_intensity * 1.1
                    }
                ]
            }

            return recommendation

    except Exception as e:
        print(f"Error in get_optimal_schedule: {e}")
        # Improved error fallback
        return {
            "recommended_start_time": (datetime.now() + timedelta(hours=1)).isoformat(),
            "expected_intensity": carbon_data.get("carbon_intensity", 0),
            "carbon_savings_estimate": 0,
            "confidence_score": 0.3,
            "reasoning": f"Error in optimization: {str(e)}. Defaulting to +1 hour schedule.",
            "alternative_windows": []
        }

def generate_fallback_recommendation(task, carbon_data):
    """Generate a fallback recommendation when Groq API is not available"""
    try:
        current_time = datetime.now()
        # Schedule for early morning (2 AM) when carbon intensity is typically lower
        optimal_hour = 2
        recommended_time = current_time.replace(hour=optimal_hour, minute=0)
        if recommended_time < current_time:
            recommended_time += timedelta(days=1)
            
        current_intensity = carbon_data.get("carbon_intensity", 0)
        expected_intensity = current_intensity * 0.8  # Assume 20% reduction during optimal time
        
        carbon_savings = calculate_carbon_savings(
            current_intensity,
            expected_intensity,
            task.duration_hours,
            task.resource_usage
        )
        
        # Calculate sustainability metrics
        carbon_reduction = ((current_intensity - expected_intensity) / current_intensity) * 100
        trees_equivalent = carbon_savings * 0.0165  # Rough estimate: 1 kg CO2 = 0.0165 trees/year
        cost_savings = carbon_savings * 0.05  # Assuming $0.05 per kg CO2 saved
        
        return {
            "recommended_start_time": recommended_time.isoformat(),
            "expected_intensity": expected_intensity,
            "carbon_savings_estimate": carbon_savings,
            "confidence_score": 0.7,
            "reasoning": "Scheduled for typical low-carbon intensity period (early morning) based on historical patterns",
            "sustainability_impact": {
                "carbon_reduction_percentage": round(carbon_reduction, 2),
                "equivalent_trees_planted": round(trees_equivalent, 2),
                "energy_cost_savings": round(cost_savings, 2)
            },
            "alternative_windows": [
                {
                    "start_time": (recommended_time + timedelta(days=1)).isoformat(),
                    "expected_intensity": expected_intensity * 1.1,
                    "reason": "Alternative window with slightly higher carbon intensity"
                }
            ]
        }
    except Exception as e:
        print(f"Error in fallback recommendation: {e}")
        return {
            "recommended_start_time": (datetime.now() + timedelta(hours=1)).isoformat(),
            "expected_intensity": carbon_data.get("carbon_intensity", 0),
            "carbon_savings_estimate": 0,
            "confidence_score": 0.3,
            "reasoning": "Using simple +1 hour schedule due to error in optimization",
            "sustainability_impact": {
                "carbon_reduction_percentage": 0,
                "equivalent_trees_planted": 0,
                "energy_cost_savings": 0
            },
            "alternative_windows": []
        }
