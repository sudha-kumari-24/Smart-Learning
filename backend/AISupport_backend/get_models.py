import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('OPENROUTER_API_KEY')

# Fetch all available models
response = requests.get(
    "https://openrouter.ai/api/v1/models",
    headers={"Authorization": f"Bearer {api_key}"}
)

if response.status_code == 200:
    models = response.json().get('data', [])
    
    # Find all free models
    free_models = [m for m in models if m.get('pricing', {}).get('prompt') == '0']
    
    print(f"Found {len(free_models)} free models:\n")
    for m in free_models[:20]:  # Show first 20
        print(f"  {m['id']}")
else:
    print(f"Error: {response.status_code}")
    print(response.text)