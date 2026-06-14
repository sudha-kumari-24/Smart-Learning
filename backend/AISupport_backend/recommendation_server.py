import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json

from recommendation_service import RecommendationService

app = Flask(__name__)
CORS(app)

recommendation_service = RecommendationService()

@app.route('/api/recommendations/questions', methods=['GET'])
def get_questions():
    """Get the list of questions for user preferences"""
    return jsonify({
        "success": True,
        "questions": recommendation_service.questions
    })

@app.route('/api/recommendations/generate', methods=['POST'])
def generate_recommendations():
    """Generate course recommendations based on user responses"""
    data = request.json
    user_responses = data.get('responses', [])
    user_id = data.get('userId')
    
   
    user_data = None
    if user_id:
        try:
            response = requests.get(f'http://localhost:5000/api/users/{user_id}', timeout=5)
            if response.status_code == 200:
                user_data = response.json()
        except Exception as e:
            print(f"Error fetching user data: {e}")
    
  
    recommendations = recommendation_service.get_course_recommendations(user_responses, user_data)
    
    return jsonify({
        "success": True,
        "recommendations": recommendations['recommendations'],
        "explanation": recommendations['explanation'],
        "user_needs": recommendations['user_needs']
    })

@app.route('/api/recommendations/chat', methods=['POST'])
def chat_recommendation():
    """Chat-based course recommendations"""
    data = request.json
    user_message = data.get('message', '')
    user_responses = data.get('responses', [])
    
    response = recommendation_service.get_ai_chat_response(user_message, user_responses)
    
    return jsonify({
        "success": True,
        "response": response
    })

@app.route('/api/recommendations/courses', methods=['GET'])
def get_all_courses():
    """Fetch all courses from main backend"""
    try:
        response = requests.get('http://localhost:5000/api/courses', timeout=10)
        if response.status_code == 200:
            return jsonify({
                "success": True,
                "courses": response.json()
            })
    except Exception as e:
        print(f"Error fetching courses: {e}")
    
    
    return jsonify({
        "success": True,
        "courses": recommendation_service.get_fallback_courses()
    })

@app.route('/api/recommendations/save-responses', methods=['POST'])
def save_user_responses():
    """Save user responses for future recommendations"""
    data = request.json
    user_id = data.get('userId')
    responses = data.get('responses', [])
    
    return jsonify({
        "success": True,
        "message": "Responses saved successfully"
    })

if __name__ == '__main__':
    print("🎯 Recommendation Service running on port 8002...")
    app.run(debug=True, host='0.0.0.0', port=8002)