import os
import time
import random
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class AISupportService:
    def __init__(self):
        self.openrouter_api_key = os.getenv('OPENROUTER_API_KEY')
        print(f"🔑 API Key loaded: {'Yes' if self.openrouter_api_key else 'No'}")
        
        
        self.predefined_responses = {
            "hello": "Hello! I'm your AI Study Assistant. How can I help with your studies today?",
            "hi": "Hi there! Ready to study? What subject are you working on?",
            "how to study": "Try the Pomodoro Technique: 25 minutes focus, 5 minutes break!",
            "motivation": "You've got this! Small daily improvements lead to great results.",
            "stress": "Take a deep breath. Step away for 2 minutes. You've got this!",
            "what can you do": "I can explain concepts, share study tips, help with stress, and keep you motivated!"
        }
        
        self.study_resources = {
            "leetcode": "https://leetcode.com",
            "github": "https://github.com",
            "khan academy": "https://khanacademy.org"
        }
    
    def get_response(self, command):
        if not command or command.strip() == "":
            return "I didn't catch that. Could you please repeat?"
        
        command_lower = command.lower().strip()
        
        
        for keyword, response in self.predefined_responses.items():
            if keyword in command_lower:
                return response
        
        
        for resource_name, url in self.study_resources.items():
            if f"open {resource_name}" in command_lower:
                return f"Opening {resource_name.title()} for you!"
        
      
        if self.openrouter_api_key:
            return self.get_openrouter_response(command)
        
        return "I'm here to help! Could you tell me more about what you're studying?"
    



    def get_openrouter_response(self, command):
        """Get response from OpenRouter using auto-router"""
        
        try:
            print(f"🔄 Calling OpenRouter API...")
            
            response = requests.post(
                url="https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openrouter_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openrouter/free",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a supportive AI Study Assistant. Keep responses very concise (2-3 sentences max). Be friendly and helpful."
                        },
                        {
                            "role": "user",
                            "content": command
                        }
                    ],
                    "max_tokens": 150,
                    "temperature": 0.7
                },
                timeout=30
            )
            
            print(f"📡 Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                ai_response = result["choices"][0]["message"]["content"]
                print(f"✅ Got response")
                return ai_response
            else:
                print(f"❌ Error: {response.status_code}")
                return self.get_helpful_response(command)
                
        except Exception as e:
            print(f"⚠️ Exception: {e}")
            return self.get_helpful_response(command)
    


    
    def get_helpful_response(self, command):
        """Fallback response"""
        responses = [
            f"That's an interesting question! Let me help you learn. Could you rephrase or ask something specific?",
            "I'm here to help with your studies! What specific topic would you like to explore?",
            "Great question! For better support, could you share which subject you're working on?"
        ]
        return random.choice(responses)
    
    def get_websocket_response(self, command):
        response = self.get_response(command)
        
        should_open = False
        url_to_open = None
        
        command_lower = command.lower()
        for resource_name, url in self.study_resources.items():
            if f"open {resource_name}" in command_lower:
                should_open = True
                url_to_open = url
                break
        
        return {
            'response': response,
            'should_open': should_open,
            'url': url_to_open,
            'timestamp': time.time()
        }