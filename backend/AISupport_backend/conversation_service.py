import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')


SCENARIO_PROMPTS = {

    'restaurant': """You are a friendly restaurant waiter. Your goal is to take the customer's order naturally.
        - Greet the customer warmly
        - Ask about drinks, appetizers, main course
        - Be polite and helpful
        - When order is complete, confirm and say goodbye
        - Keep responses SHORT (1-2 sentences max)
        - Speak like a real waiter""",
    
    'police': """You are a police officer at a station. Your goal is to take a report from a citizen.
        - Be professional and formal
        - Ask about what happened, when, where
        - Show empathy and professionalism
        - When report is complete, thank and provide next steps
        - Keep responses SHORT (1-2 sentences max)""",
    
    'ambulance': """You are an emergency dispatcher. Your goal is to get critical information quickly.
        - Be calm and professional
        - Ask about location, condition of patient, any dangers
        - Give first aid instructions if needed
        - When info is complete, confirm ambulance is dispatched
        - Keep responses SHORT (1-2 sentences max)""",
    
    'friend': """You are a close friend. Your goal is to have a natural casual conversation.
        - Be warm and friendly
        - Ask about how they're doing, weekend plans, shared interests
        - Use casual language and maybe some emojis in text
        - When conversation feels complete, suggest meeting up
        - Keep responses SHORT (1-2 sentences max)"""
}


FALLBACK_SCRIPTS = {
    'restaurant': [
        {"ai": "Welcome to our restaurant! What would you like to order?", "keywords": ["menu", "order", "eat", "food"]},
        {"ai": "Would you like anything to drink with that?", "keywords": ["drink", "water", "soda", "juice", "coffee", "tea"]},
        {"ai": "Great choice! Would you like anything else?", "keywords": ["else", "more", "additional", "another"]},
        {"ai": "Thank you for your order! It will be ready shortly. Have a great day!", "keywords": ["thanks", "thank", "goodbye", "bye"]}
    ],
    'police': [
        {"ai": "Police station. How can I help you today?", "keywords": ["report", "theft", "stolen", "accident", "crime"]},
        {"ai": "Can you tell me when and where this happened?", "keywords": ["when", "where", "time", "location", "address"]},
        {"ai": "Thank you for the information. We will look into this.", "keywords": ["thanks", "help", "appreciate"]},
        {"ai": "Is there anything else you'd like to report?", "keywords": ["else", "more", "additional", "no", "that's all"]},
        {"ai": "Thank you for your cooperation. We'll contact you if we need more information.", "keywords": ["thanks", "goodbye", "bye"]}
    ],
    'ambulance': [
        {"ai": "Emergency services. What's your emergency?", "keywords": ["emergency", "help", "accident", "unconscious", "bleeding"]},
        {"ai": "What is your exact location?", "keywords": ["location", "address", "where", "street", "city"]},
        {"ai": "Can you describe the person's condition?", "keywords": ["condition", "breathing", "conscious", "bleeding", "pain"]},
        {"ai": "Stay calm. An ambulance is on the way.", "keywords": ["thanks", "thank", "ok", "good"]},
        {"ai": "Is there anything else we should know?", "keywords": ["else", "more", "additional", "no"]},
        {"ai": "Help is on the way. Stay on the line if possible.", "keywords": ["thanks", "goodbye", "bye"]}
    ],
    'friend': [
        {"ai": "Hey! How have you been?", "keywords": ["good", "busy", "fine", "great", "well"]},
        {"ai": "That's great! What have you been up to lately?", "keywords": ["work", "study", "project", "hobby", "weekend"]},
        {"ai": "Sounds fun! Want to catch up sometime?", "keywords": ["yes", "sure", "definitely", "love", "would"]},
        {"ai": "Awesome! Let's plan something soon.", "keywords": ["yes", "sure", "ok", "great", "perfect"]},
        {"ai": "Great talking to you! Talk to you soon!", "keywords": ["goodbye", "bye", "later", "see you"]}
    ]
}



def call_groq_api(scenario, difficulty, history, user_message):
    """Call Groq API for dynamic conversation"""
    if not GROQ_API_KEY:
        return None
    
    system_prompt = SCENARIO_PROMPTS.get(scenario, SCENARIO_PROMPTS['friend'])
    
   
    difficulty_instruction = {
        'easy': 'Be very helpful and forgiving. Give hints if the user seems stuck. Evaluate generously.',
        'medium': 'Be natural. Evaluate fairly. Give occasional hints.',
        'hard': 'Be strict but polite. Minimal hints. Evaluate accurately.'
    }.get(difficulty, 'Be natural and fair.')
    
   
    history_text = ""
    for msg in history[-4:]:  # Last 4 exchanges for context
        history_text += f"{msg['role']}: {msg['content']}\n"
    
    prompt = f"""{system_prompt}

Difficulty: {difficulty.upper()}
{difficulty_instruction}

Conversation so far:
{history_text}

User just said: "{user_message}"

Return ONLY valid JSON in this exact format:
{{
    "ai_response": "Your response as the waiter/officer/dispatcher/friend (1 sentence max)",
    "evaluation": {{
        "score": 0-10,
        "feedback": "Short positive feedback (1 sentence)"
    }},
    "is_complete": false,
    "hint": "Helpful hint if user is stuck (empty string if not needed)"
}}

If the conversation goal has been reached (order taken, report filed, ambulance dispatched, conversation ended naturally), set is_complete to true and add a warm closing message as ai_response."""

    try:
        response = requests.post(
            url="https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": "You are an AI conversation partner. Return ONLY valid JSON. No markdown, no extra text."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 300
            },
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content.strip())
    except Exception as e:
        print(f"Groq API error: {e}")
    
    return None

def call_openrouter_api(scenario, difficulty, history, user_message):
    """Fallback to OpenRouter API"""
    if not OPENROUTER_API_KEY:
        return None
    
    system_prompt = SCENARIO_PROMPTS.get(scenario, SCENARIO_PROMPTS['friend'])
    
    difficulty_instruction = {
        'easy': 'Be very helpful and forgiving.',
        'medium': 'Be natural and fair.',
        'hard': 'Be strict but polite.'
    }.get(difficulty, 'Be natural and fair.')
    
    history_text = ""
    for msg in history[-4:]:
        history_text += f"{msg['role']}: {msg['content']}\n"
    
    prompt = f"""{system_prompt}

Difficulty: {difficulty.upper()}
{difficulty_instruction}

Conversation so far:
{history_text}

User: "{user_message}"

Return JSON: {{"ai_response": "...", "evaluation": {{"score": 0-10, "feedback": "..."}}, "is_complete": false, "hint": "..."}}"""

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "microsoft/phi-3.5-mini-instruct:free",
                "messages": [
                    {"role": "system", "content": "Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 300,
                "temperature": 0.7
            },
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content)
    except Exception as e:
        print(f"OpenRouter API error: {e}")
    
    return None

def get_fallback_response(scenario, user_message, current_step):
    """Fallback keyword-matching response"""
    script = FALLBACK_SCRIPTS.get(scenario, FALLBACK_SCRIPTS['friend'])
    
    if current_step >= len(script):
        return {
            "ai_response": "Thank you for the conversation! Have a great day!",
            "evaluation": {"score": 10, "feedback": "Conversation completed!"},
            "is_complete": True,
            "hint": ""
        }
    
    current_line = script[current_step]
    user_lower = user_message.lower()
    
    
    matched = any(keyword in user_lower for keyword in current_line.get('keywords', []))
    
    if matched or current_step == 0: 
        next_step = current_step + 1
        if next_step >= len(script):
            return {
                "ai_response": script[-1]["ai"],
                "evaluation": {"score": 9, "feedback": "Great job! You completed the conversation."},
                "is_complete": True,
                "hint": ""
            }
        else:
            return {
                "ai_response": script[next_step]["ai"],
                "evaluation": {"score": 8, "feedback": "Good response! Keep going."},
                "is_complete": False,
                "hint": ""
            }
    else:
       
        expected_keywords = ', '.join(current_line.get('keywords', [])[:3])
        return {
            "ai_response": current_line["ai"],
            "evaluation": {"score": 5, "feedback": f"Almost there! Try using words like: {expected_keywords}"},
            "is_complete": False,
            "hint": f"Try saying something like: {current_line.get('keywords', ['respond appropriately'])[0]}"
        }




@app.route('/api/conversation/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        scenario = data.get('scenario', 'friend')
        difficulty = data.get('difficulty', 'medium')
        history = data.get('history', [])
        user_message = data.get('message', '')
        current_step = data.get('step', 0)
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
      
        response = call_groq_api(scenario, difficulty, history, user_message)
        
        if not response:
            response = call_openrouter_api(scenario, difficulty, history, user_message)
        
        
        if not response:
            response = get_fallback_response(scenario, user_message, current_step)
        
        return jsonify({
            "success": True,
            "ai_response": response.get("ai_response", ""),
            "evaluation": response.get("evaluation", {"score": 7, "feedback": "Good effort!"}),
            "is_complete": response.get("is_complete", False),
            "hint": response.get("hint", "")
        })
        
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/conversation/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "conversation"})

if __name__ == '__main__':
    print("💬 Conversation Service running on port 8004...")
    print(f"   Groq API: {'✅ Configured' if GROQ_API_KEY else '❌ Not configured'}")
    print(f"   OpenRouter API: {'✅ Configured' if OPENROUTER_API_KEY else '❌ Not configured'}")
    app.run(debug=True, host='0.0.0.0', port=8004)