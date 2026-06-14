import os
import json
import time
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
CORS(app)


GROQ_API_KEY = os.getenv('GROQ_API_KEY')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

COLOR_MAPPING = {
    "spelling": "red",
    "grammar": "red",
    "punctuation": "orange",
    "style": "blue",
    "word_choice": "purple",
    "clarity": "blue",
    "formality": "purple"
}

def call_groq_api(text):
    """Call Groq API (fastest)"""
    if not GROQ_API_KEY:
        return None
    
    prompt = f"""Analyze this text for writing quality. Return ONLY valid JSON.

Text: "{text}"

Return JSON:
{{"score": 0-100, "errors": [{{"word": "...", "suggestion": "...", "reason": "...", "type": "grammar|spelling|punctuation|style|word_choice"}}], "improved_text": "...", "suggestions": ["tip1", "tip2"]}}"""

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
                    {"role": "system", "content": "You are a writing coach. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3,
                "max_tokens": 1500
            },
            timeout=30
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

def call_openrouter_api(text):
    """Fallback to OpenRouter"""
    if not OPENROUTER_API_KEY:
        return None
    
    prompt = f"""Analyze this text for writing quality. Return ONLY valid JSON.

Text: "{text}"

Return JSON:
{{"score": 0-100, "errors": [{{"word": "...", "suggestion": "...", "reason": "...", "type": "grammar|spelling|punctuation|style|word_choice"}}], "improved_text": "...", "suggestions": ["tip1", "tip2"]}}"""

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
                    {"role": "system", "content": "You are a writing coach. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1500,
                "temperature": 0.3
            },
            timeout=45
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
        print(f"OpenRouter API error: {e}")
    
    return None

def get_writing_analysis(text):
    """Get analysis using fastest available API"""
    
    
    analysis = call_groq_api(text)
    
    
    if not analysis:
        analysis = call_openrouter_api(text)
    
    
    if not analysis:
        return get_fallback_analysis(text)
    
   
    for error in analysis.get("errors", []):
        error["color"] = COLOR_MAPPING.get(error.get("type", "grammar"), "red")
    
    return analysis


def get_fallback_analysis(text):
    """Fallback when all APIs fail"""
    words = text.split()
    word_count = len(words)
    score = min(100, max(0, 70 + (word_count // 10)))
    
    errors = []
    suggestions = ["Review your text for spelling and grammar errors"]
    
    if "  " in text:
        errors.append({
            "word": "double space",
            "suggestion": "single space",
            "reason": "Multiple spaces found",
            "type": "style",
            "color": "blue"
        })
    
    if text.isupper():
        errors.append({
            "word": "ALL CAPS",
            "suggestion": "normal case",
            "reason": "All caps is hard to read",
            "type": "style",
            "color": "blue"
        })
    
    return {
        "score": score,
        "errors": errors,
        "improved_text": text,
        "suggestions": suggestions
    }

@app.route('/api/writing/analyze', methods=['POST'])
def analyze_writing():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text or not text.strip():
            return jsonify({"success": False, "error": "No text provided"}), 400
        
        is_demo = data.get('is_demo', False)
        
        if is_demo:
            return jsonify({
                "success": True,
                "analysis": {
                    "score": 45,
                    "errors": [
                        {"word": "their", "suggestion": "there", "reason": "Wrong word usage", "type": "grammar", "color": "red"},
                        {"word": "Im", "suggestion": "I'm", "reason": "Missing apostrophe", "type": "punctuation", "color": "orange"},
                        {"word": "writeing", "suggestion": "writing", "reason": "Spelling error", "type": "spelling", "color": "red"},
                        {"word": "have", "suggestion": "has", "reason": "Subject-verb agreement", "type": "grammar", "color": "red"},
                        {"word": "discusses", "suggestion": "discuss", "reason": "Verb form error", "type": "grammar", "color": "red"},
                        {"word": "it's", "suggestion": "its", "reason": "Wrong apostrophe usage", "type": "punctuation", "color": "orange"},
                        {"word": "bringing", "suggestion": "bring", "reason": "Verb form error", "type": "grammar", "color": "red"}
                    ],
                    "improved_text": "Hi there! I'm writing to inform you that the meeting has been moved to tomorrow. We should discuss the new project and its deadlines. Please bring your notes.",
                    "suggestions": ["Use proper contractions", "Check subject-verb agreement", "Review possessive pronouns"]
                }
            })
        
        analysis = get_writing_analysis(text)
        
        return jsonify({"success": True, "analysis": analysis})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/writing/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "writing-analysis"})


if __name__ == '__main__':
    print("✍️ Writing Analysis Service running on port 8003...")
    print(f"   Groq API: {'✅ Configured' if GROQ_API_KEY else '❌ Not configured'}")
    print(f"   OpenRouter API: {'✅ Configured' if OPENROUTER_API_KEY else '❌ Not configured'}")
    app.run(debug=True, host='0.0.0.0', port=8003)