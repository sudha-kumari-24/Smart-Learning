import os
import json
import random
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class RecommendationService:
    def __init__(self):
        self.openrouter_api_key = os.getenv('OPENROUTER_API_KEY')
        print(f"🔑 Recommendation Service API Key loaded: {'Yes' if self.openrouter_api_key else 'No'}")
        
        self.courses = []
        
        self.questions = [
            {
                "id": 1,
                "question": "What is your current academic year or professional level?",
                "options": ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Professional"]
            },
            {
                "id": 2,
                "question": "Which programming languages are you interested in?",
                "options": ["Python", "JavaScript", "Java", "C++", "React", "Node.js", "None"]
            },
            {
                "id": 3,
                "question": "What's your primary learning goal right now?",
                "options": ["Career Growth", "Interview Preparation", "Academic Excellence", "Skill Development", "Project Building"]
            },
            {
                "id": 4,
                "question": "How much time can you dedicate to learning daily?",
                "options": ["30 minutes", "1 hour", "2 hours", "3+ hours", "Weekends only"]
            },
            {
                "id": 5,
                "question": "Which area interests you the most?",
                "options": ["Data Science & AI", "Web Development", "Soft Skills", "Machine Learning", "Communication", "DSA"]
            }
        ]
    
    def fetch_courses_from_backend(self):
        try:
            response = requests.get('http://localhost:5000/api/courses', timeout=10)
            if response.status_code == 200:
                self.courses = response.json()
                return True
        except Exception as e:
            print(f"Error fetching courses: {e}")
        
        self.courses = self.get_fallback_courses()
        return False
    
    def get_fallback_courses(self):
        return [
            {
                "_id": "course1",
                "title": "Machine Learning for Students",
                "description": "Learn ML concepts with practical projects",
                "category": "Data Science",
                "level": "Intermediate",
                "tags": ["ML", "AI", "Python"],
                "durationHours": 10,
                "instructor": "Industry Expert",
                "enrolled": 8900
            },
            {
                "_id": "course2",
                "title": "Communication Skills for Techies",
                "description": "Improve your communication for interviews",
                "category": "Soft Skills",
                "level": "All",
                "tags": ["Communication", "Interview", "Soft Skills"],
                "durationHours": 4,
                "instructor": "Industry Expert",
                "enrolled": 5400
            },
            {
                "_id": "course3",
                "title": "Full Stack Web Development",
                "description": "Become a complete web developer",
                "category": "Web Development",
                "level": "Beginner",
                "tags": ["React", "Node.js", "JavaScript", "MongoDB"],
                "durationHours": 25,
                "instructor": "Senior Developer",
                "enrolled": 15000
            },
            {
                "_id": "course4",
                "title": "Data Structures & Algorithms",
                "description": "Master DSA for coding interviews",
                "category": "Programming",
                "level": "Intermediate",
                "tags": ["DSA", "Algorithms", "Interview Prep"],
                "durationHours": 20,
                "instructor": "FAANG Engineer",
                "enrolled": 12500
            }
        ]
    
    def get_course_recommendations(self, user_responses, user_data=None):
        if not self.courses:
            self.fetch_courses_from_backend()
        
        user_needs = self.analyze_responses(user_responses)
        scored_courses = []
        
        for course in self.courses:
            score = 0
            reasons = []
            
            if course.get('category', '').lower() in user_needs.get('categories', []):
                score += 30
                reasons.append(f"Matches your interest in {course.get('category')}")
            
            course_tags = [tag.lower() for tag in course.get('tags', [])]
            user_interests = [interest.lower() for interest in user_needs.get('interests', [])]
            
            tag_matches = set(course_tags) & set(user_interests)
            score += len(tag_matches) * 15
            if tag_matches:
                reasons.append(f"Contains: {', '.join(tag_matches)}")
            
            user_level = user_needs.get('level', '').lower()
            course_level = course.get('level', '').lower()
            if user_level in course_level or course_level == 'all':
                score += 10
                reasons.append(f"Level matches your expertise")
            
            user_goal = user_needs.get('goal', '').lower()
            if user_goal:
                if 'career' in user_goal and 'soft' in course.get('category', '').lower():
                    score += 20
                    reasons.append("Helps with career growth")
                elif 'interview' in user_goal and ('dsa' in str(course_tags) or 'interview' in str(course_tags)):
                    score += 25
                    reasons.append("Excellent for interview prep")
            
            enrolled = course.get('enrolled', 0)
            if enrolled > 5000:
                score += 10
                reasons.append("Popular among students")
            
            scored_courses.append({
                "course": course,
                "score": score,
                "reasons": reasons[:3]
            })
        
        scored_courses.sort(key=lambda x: x['score'], reverse=True)
        top_courses = scored_courses[:5]
        explanation = self.generate_ai_explanation(user_responses, top_courses)
        
        return {
            "recommendations": top_courses,
            "explanation": explanation,
            "user_needs": user_needs
        }
    
    def analyze_responses(self, responses):
        needs = {
            "categories": [],
            "interests": [],
            "level": "Beginner",
            "goal": "",
            "time_per_day": 60
        }
        
        for resp in responses:
            question_id = resp.get('question_id')
            answer = resp.get('answer', '').lower()
            
            if question_id == 1:
                if '3rd' in answer or '4th' in answer or 'graduate' in answer:
                    needs['level'] = "Advanced"
                elif '2nd' in answer or '1st' in answer:
                    needs['level'] = "Intermediate"
                else:
                    needs['level'] = "Beginner"
            
            elif question_id == 2:
                interests = {
                    "python": ["Python", "Data Science", "Machine Learning", "AI"],
                    "javascript": ["Web Development", "React", "Node.js"],
                    "java": ["Java", "Backend"],
                    "c++": ["C++", "DSA", "Algorithms"],
                    "react": ["React", "Frontend", "Web Development"],
                    "node.js": ["Node.js", "Backend", "Full Stack"]
                }
                for lang, categories in interests.items():
                    if lang in answer:
                        needs['interests'].extend(categories)
                        needs['categories'].extend(categories)
            
            elif question_id == 3:
                if 'career' in answer:
                    needs['goal'] = "career"
                    needs['categories'].append("Soft Skills")
                elif 'interview' in answer:
                    needs['goal'] = "interview"
                    needs['interests'].extend(["DSA", "Algorithms"])
            
            elif question_id == 4:
                if '30' in answer:
                    needs['time_per_day'] = 30
                elif '1 hour' in answer:
                    needs['time_per_day'] = 60
                elif '2 hours' in answer:
                    needs['time_per_day'] = 120
                elif '3+' in answer:
                    needs['time_per_day'] = 180
            
            elif question_id == 5:
                if 'data science' in answer or 'ai' in answer:
                    needs['categories'].append("Data Science")
                    needs['interests'].extend(["ML", "AI", "Python"])
                elif 'web development' in answer:
                    needs['categories'].append("Web Development")
                    needs['interests'].extend(["React", "Node.js", "JavaScript"])
                elif 'soft skills' in answer or 'communication' in answer:
                    needs['categories'].append("Soft Skills")
                    needs['interests'].extend(["Communication", "Interview"])
                elif 'dsa' in answer:
                    needs['interests'].extend(["DSA", "Algorithms", "Programming"])
        
        return needs
    
    def generate_ai_explanation(self, responses, recommendations):
        """Generate AI explanation using OpenRouter"""
        try:
            if self.openrouter_api_key:
                responses_text = "\n".join([f"- {r.get('question')}: {r.get('answer')}" for r in responses])
                recommendations_text = "\n".join([
                    f"- {rec['course']['title']}"
                    for rec in recommendations[:3]
                ])
                
                response = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openrouter_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "openrouter/free",
                        "messages": [
                            {"role": "system", "content": "You are a friendly learning advisor. Provide short, encouraging explanations for course recommendations. Keep to 2 sentences max."},
                            {"role": "user", "content": f"User preferences: {responses_text}\nRecommended courses: {recommendations_text}\nExplain why these courses are good for this user in 2 sentences."}
                        ],
                        "max_tokens": 100,
                        "temperature": 0.7
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"AI explanation error: {e}")
        
        return "Based on your interests and learning goals, we've hand-picked these courses to help you grow!"
    
    def get_ai_chat_response(self, user_message, user_responses=None):
        """AI-powered chatbot response for the learning advisor"""
        try:
            if self.openrouter_api_key:
                context = ""
                if user_responses:
                    responses_summary = "\n".join([f"- {r['question']}: {r['answer']}" for r in user_responses])
                    context = f"User preferences:\n{responses_summary}\n\n"
                
                response = requests.post(
                    url="https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openrouter_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "openrouter/free",
                        "messages": [
                            {"role": "system", "content": "You are a friendly learning advisor chatbot. Help users with course recommendations, study advice, career guidance, and learning paths. Keep responses very concise (2 sentences max). Be helpful and encouraging."},
                            {"role": "user", "content": f"{context}User asks: {user_message}"}
                        ],
                        "max_tokens": 150,
                        "temperature": 0.7
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                    
        except Exception as e:
            print(f"AI chat error: {e}")
        
       
        fallbacks = [
            "I'd recommend checking out our courses in Data Science, Web Development, or Soft Skills based on your interests. Which area excites you most?",
            "That's a great question! Based on your learning goals, I suggest exploring our recommended courses above. Would you like more details on any specific course?",
            "I'm here to help you find the best learning path! Could you tell me more about what you'd like to learn or achieve?"
        ]
        return random.choice(fallbacks)

    def get_websocket_response(self, command):
        response = self.get_ai_chat_response(command)
        return {
            'response': response,
            'timestamp': time.time()
        }