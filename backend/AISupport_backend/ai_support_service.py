import os
import time
import requests
from together import Together
from dotenv import load_dotenv
import os
import random

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class AISupportService:
    def __init__(self):
        self.api_key = os.getenv('TOGETHER_API_KEY') or os.getenv('AI_API_KEY')
        self.client = Together(api_key=self.api_key) if self.api_key else None
        
        # Predefined responses for common queries
        self.predefined_responses = {
            # Greetings
            "hello": "Hello! I'm your AI Study Assistant. How can I help with your studies today?",
            "hi": "Hi there! Ready to tackle some studying? What subject are you working on?",
            "hey": "Hey! I'm here to support your learning journey. What can I help you with?",
            
            # Study help
            "how to study": "Great question! Here are some effective study techniques: Pomodoro (25 min focus, 5 min break), active recall, spaced repetition, and the Feynman technique. Would you like me to explain any of these?",
            "procrastination": "Procrastination is common! Try breaking tasks into smaller chunks, using the 2-minute rule, or the Pomodoro technique. Need help creating a study schedule?",
            "stress": "Study stress is real. Take deep breaths, step away for 5 minutes, or try a quick meditation. I'm here to support you! Want some stress-relief exercises?",
            "motivation": "You've got this! Remember why you started. Set small goals and celebrate each win. What subject are you working on? Let's tackle it together!",
            "exam": "Exam preparation tip: Start early, create a study schedule, practice past papers, and get enough sleep. What subject exam are you preparing for?",
            
            # Subjects
            "math": "Math requires practice! Focus on understanding concepts first, then solve problems step by step. Need help with algebra, calculus, or geometry?",
            "programming": "Programming is learned by doing! Start with basics, practice coding daily, and debug errors patiently. What language are you learning?",
            "science": "Science is fascinating! Use diagrams, conduct experiments mentally, and connect concepts to real life. Which branch - physics, chemistry, or biology?",
            
            # Technical
            "dsa": "Data Structures and Algorithms are key for coding interviews! Focus on arrays, linked lists, trees, and practice problem-solving on LeetCode. Want specific topic help?",
            "react": "React is component-based! Learn hooks, state management, and props. Need help with functional components or class components?",
            "python": "Python is great for beginners! Practice with lists, dictionaries, and functions. Want to learn about libraries like NumPy or Pandas?",
            
            # Wellbeing
            "break": "Taking breaks improves focus! Try a 5-minute stretch, grab water, or do some deep breathing. Come back refreshed!",
            "sleep": "Sleep is crucial for memory! Aim for 7-8 hours. Studying when well-rested is more effective than late-night cramming.",
            
            # Default help
            "help": "I can help with: Study tips, subject explanations, stress management, motivation, and technical concepts. What would you like to know?",
            "what can you do": "I'm your AI Study Assistant! I can: 📚 Explain concepts, 💡 Share study tips, 🧘 Help with stress, 📝 Answer questions, and 💪 Keep you motivated! Try asking me about math, programming, exams, or anything study-related!"
        }
        
        # Study resources mapping
        self.study_resources = {
            "leetcode": "https://leetcode.com",
            "khan academy": "https://khanacademy.org",
            "coursera": "https://coursera.org",
            "udemy": "https://udemy.com",
            "github": "https://github.com",
            "stack overflow": "https://stackoverflow.com",
            "w3schools": "https://w3schools.com",
            "mdn": "https://developer.mozilla.org"
        }
    
    def get_response(self, command):
        """Get response for user command"""
        if not command or command.strip() == "":
            return "I didn't catch that. Could you please repeat?"
        
        command_lower = command.lower().strip()
        
        # Check for resource opening
        for resource_name, url in self.study_resources.items():
            if f"open {resource_name}" in command_lower or f"go to {resource_name}" in command_lower:
                return f"Opening {resource_name.title()} for you! It's a great learning resource."
        
        # Check predefined responses
        for keyword, response in self.predefined_responses.items():
            if keyword in command_lower:
                return response
        
        # Handle study tips
        if "study tip" in command_lower or "learning tip" in command_lower:
            tips = [
                "Use active recall: Test yourself instead of just re-reading notes!",
                "Try the Pomodoro Technique: 25 minutes study, 5 minutes break.",
                "Teach what you learn to someone else - it reinforces understanding!",
                "Create mind maps to visualize connections between concepts.",
                "Practice problems daily, especially for math and programming."
            ]
            return random.choice(tips)
        
        # Handle motivational quotes
        if "motivate" in command_lower or "inspire" in command_lower:
            quotes = [
                "The expert in anything was once a beginner.",
                "Small daily improvements lead to stunning results.",
                "Don't watch the clock; do what it does. Keep going.",
                "Your future self will thank you for studying today.",
                "Every expert was once a beginner. Keep going!"
            ]
            return random.choice(quotes)
        
        # Try AI response if API key is available
        if self.api_key and self.client:
            return self.get_ai_response(command)
        
        # Default fallback
        return self.get_helpful_response(command)
    
    def get_ai_response(self, command):
        """Get response from AI API"""
        try:
            completion = self.client.chat.completions.create(
                model="mistralai/Mistral-7B-Instruct-v0.1",
                messages=[
                    {
                        "role": "system", 
                        "content": """You are a supportive AI Study Assistant focused on helping students with:
                        - Study techniques and learning strategies
                        - Explaining academic concepts (math, programming, science)
                        - Managing stress and maintaining motivation
                        - Providing encouragement and study tips
                        
                        Keep responses concise (2-3 sentences max), friendly, and actionable. 
                        Use emojis occasionally for warmth. Focus on being helpful and supportive."""
                    },
                    {"role": "user", "content": command}
                ],
                max_tokens=150,
                temperature=0.7
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"AI Error: {e}")
            return self.get_helpful_response(command)
    
    def get_helpful_response(self, command):
        """Fallback helpful response"""
        responses = [
            f"That's an interesting question about '{command[:50]}...' Let me think. As your study assistant, I'd suggest breaking it down into smaller parts. Want to rephrase or ask something specific?",
            "I'm here to help with your studies! Could you tell me more specifically what you're working on?",
            "Great question! For better study support, could you share which subject or topic you need help with?",
            "I hear you! Let me help you learn better. What specific aspect would you like to explore?"
        ]
        return random.choice(responses)
    
    def get_websocket_response(self, command):
        """Get response with metadata for WebSocket"""
        response = self.get_response(command)
        
        # Check if this command should open a URL
        should_open = False
        url_to_open = None
        
        command_lower = command.lower()
        for resource_name, url in self.study_resources.items():
            if f"open {resource_name}" in command_lower or f"go to {resource_name}" in command_lower:
                should_open = True
                url_to_open = url
                break
        
        return {
            'response': response,
            'should_open': should_open,
            'url': url_to_open,
            'timestamp': time.time()
        }