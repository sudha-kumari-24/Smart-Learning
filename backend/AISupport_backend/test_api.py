import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('OPENROUTER_API_KEY')
print(f"API Key loaded: {'Yes' if api_key else 'No'}")

# Use models from your get_models.py output
models_to_try = [
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "google/gemma-4-26b-a4b-it:free",
    "openrouter/free",
]

for model in models_to_try:
    print(f"\n🔄 Testing: {model}")
    
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "model": model,
            "messages": [
                {"role": "user", "content": "What is the theory of relativity? Answer in one short sentence."}
            ],
            "max_tokens": 100,
            "temperature": 0.7
        }
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"✅ WORKING! Response: {result['choices'][0]['message']['content']}")
        break
    else:
        print(f"❌ Error: {response.text[:200]}")