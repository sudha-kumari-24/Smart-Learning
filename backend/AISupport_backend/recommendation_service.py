import os
import json
import random
from datetime import datetime
from together import Together
from dotenv import load_dotenv
import requests

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

class RecommendationService:
    def __init__(self):
        self.api_key = os.getenv('TOGETHER_API_KEY') or os.getenv('AI_API_KEY')
        self.client = Together(api_key=self.api_key) if self.api_key else None
        
        # Course database (will be fetched from your backend)
        self.courses = []
        
        # User questions for gathering preferences
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
        
        # Store user responses
        self.user_responses = {}
    
    def fetch_courses_from_backend(self):
        """Fetch courses from your Node.js backend"""
        try:
            response = requests.get('http://localhost:5000/api/courses', timeout=10)
            if response.status_code == 200:
                self.courses = response.json()
                return True
        except Exception as e:
            print(f"Error fetching courses: {e}")
        
        # Fallback courses if backend not available
        self.courses = self.get_fallback_courses()
        return False
    
    def get_fallback_courses(self):
        """Fallback course data"""
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
                "thumbnailUrl": ""
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
                "thumbnailUrl": ""
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
                "thumbnailUrl": ""
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
                "thumbnailUrl": ""
            },
            {
                "_id": "course5",
                "title": "Python for Data Science",
                "description": "Learn Python for data analysis and ML",
                "category": "Data Science",
                "level": "Beginner",
                "tags": ["Python", "Data Science", "Pandas", "NumPy"],
                "durationHours": 15,
                "instructor": "Data Scientist",
                "thumbnailUrl": ""
            }
        ]
    
    def analyze_user_preferences(self, user_data):
        """Analyze user data to extract preferences"""
        preferences = {
            "focus_areas": [],
            "goals": [],
            "study_time": 60,
            "skill_level": "Beginner",
            "interests": []
        }
        
        if user_data:
            if 'preferences' in user_data:
                if 'focusAreas' in user_data['preferences']:
                    preferences['focus_areas'] = user_data['preferences']['focusAreas']
                if 'studyGoalMinutesPerDay' in user_data['preferences']:
                    preferences['study_time'] = user_data['preferences']['studyGoalMinutesPerDay']
            
            if 'classCourse' in user_data:
                course_lower = user_data['classCourse'].lower()
                if 'b.tech' in course_lower or 'cse' in course_lower:
                    preferences['interests'].append("Programming")
                    preferences['interests'].append("Computer Science")
        
        return preferences
    
    def get_course_recommendations(self, user_responses, user_data=None):
        """Get personalized course recommendations based on user responses"""
        
        if not self.courses:
            self.fetch_courses_from_backend()
        
        # Analyze user input
        user_needs = self.analyze_responses(user_responses)
        
        # Score each course based on match with user needs
        scored_courses = []
        
        for course in self.courses:
            score = 0
            reasons = []
            
            # Match by category
            if course.get('category', '').lower() in user_needs.get('categories', []):
                score += 30
                reasons.append(f"Matches your interest in {course.get('category')}")
            
            # Match by tags
            course_tags = [tag.lower() for tag in course.get('tags', [])]
            user_interests = [interest.lower() for interest in user_needs.get('interests', [])]
            
            tag_matches = set(course_tags) & set(user_interests)
            score += len(tag_matches) * 15
            if tag_matches:
                reasons.append(f"Contains topics you're interested in: {', '.join(tag_matches)}")
            
            # Match by level
            user_level = user_needs.get('level', '').lower()
            course_level = course.get('level', '').lower()
            if user_level in course_level or course_level == 'all':
                score += 10
                reasons.append(f"Level matches your expertise ({course.get('level')})")
            
            # Match by goal
            user_goal = user_needs.get('goal', '').lower()
            if user_goal:
                if 'career' in user_goal and 'soft' in course.get('category', '').lower():
                    score += 20
                    reasons.append("Helps with career growth")
                elif 'interview' in user_goal and ('dsa' in str(course_tags) or 'interview' in str(course_tags)):
                    score += 25
                    reasons.append("Excellent for interview preparation")
            
            # Duration preference
            user_time = user_needs.get('time_per_day', 60)
            course_duration = course.get('durationHours', 0)
            if course_duration <= user_time * 30:  # If course can be completed in a month with daily study
                score += 5
                reasons.append(f"Can be completed with your available time")
            
            # Popularity boost
            enrolled = course.get('enrolled', 0)
            if enrolled > 5000:
                score += 10
                reasons.append("Popular among students")
            
            # Completion rate boost
            completion_rate = course.get('completionRate', '0%').replace('%', '')
            if completion_rate and int(completion_rate) > 80:
                score += 5
                reasons.append("High completion rate")
            
            scored_courses.append({
                "course": course,
                "score": score,
                "reasons": reasons[:3]  # Top 3 reasons
            })
        
        # Sort by score
        scored_courses.sort(key=lambda x: x['score'], reverse=True)
        
        # Return top recommendations with AI explanation
        top_courses = scored_courses[:5]
        
        # Generate AI explanation if API available
        explanation = self.generate_ai_explanation(user_responses, top_courses)
        
        return {
            "recommendations": top_courses,
            "explanation": explanation,
            "user_needs": user_needs
        }
    
    def analyze_responses(self, responses):
        """Analyze user responses to extract needs"""
        needs = {
            "categories": [],
            "interests": [],
            "level": "Beginner",
            "goal": "",
            "time_per_day": 60
        }
        
        # Map questions to needs
        for resp in responses:
            question_id = resp.get('question_id')
            answer = resp.get('answer', '').lower()
            
            if question_id == 1:  # Academic level
                if '3rd' in answer or '4th' in answer or 'graduate' in answer:
                    needs['level'] = "Advanced"
                elif '2nd' in answer or '1st' in answer:
                    needs['level'] = "Intermediate"
                else:
                    needs['level'] = "Beginner"
            
            elif question_id == 2:  # Programming languages
                interests = {
                    "python": ["Python", "Data Science", "Machine Learning", "AI"],
                    "javascript": ["Web Development", "React", "Node.js"],
                    "java": ["Java", "Android", "Backend"],
                    "c++": ["C++", "DSA", "Algorithms"],
                    "react": ["React", "Frontend", "Web Development"],
                    "node.js": ["Node.js", "Backend", "Full Stack"]
                }
                for lang, categories in interests.items():
                    if lang in answer:
                        needs['interests'].extend(categories)
                        needs['categories'].extend(categories)
            
            elif question_id == 3:  # Learning goal
                if 'career' in answer:
                    needs['goal'] = "career"
                    needs['categories'].append("Soft Skills")
                elif 'interview' in answer:
                    needs['goal'] = "interview"
                    needs['interests'].append("DSA")
                    needs['interests'].append("Algorithms")
                elif 'academic' in answer:
                    needs['goal'] = "academic"
            
            elif question_id == 4:  # Time dedication
                if '30' in answer:
                    needs['time_per_day'] = 30
                elif '1 hour' in answer:
                    needs['time_per_day'] = 60
                elif '2 hours' in answer:
                    needs['time_per_day'] = 120
                elif '3+' in answer:
                    needs['time_per_day'] = 180
            
            elif question_id == 5:  # Interest area
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
        """Generate personalized AI explanation for recommendations"""
        try:
            if self.client:
                # Format responses for AI
                responses_text = "\n".join([f"- Q: {r.get('question')}\n  A: {r.get('answer')}" for r in responses])
                
                recommendations_text = "\n".join([
                    f"- {rec['course']['title']}: {rec['reasons'][0] if rec['reasons'] else 'Good match'}"
                    for rec in recommendations[:3]
                ])
                
                prompt = f"""Based on the user's learning preferences, explain why these course recommendations are suitable:

USER PREFERENCES:
{responses_text}

TOP RECOMMENDATIONS:
{recommendations_text}

Provide a friendly, encouraging explanation (2-3 sentences) explaining how these courses align with their goals. Keep it personalized and motivational."""

                completion = self.client.chat.completions.create(
                    model="mistralai/Mistral-7B-Instruct-v0.1",
                    messages=[
                        {"role": "system", "content": "You are a friendly learning advisor. Provide short, encouraging explanations for course recommendations."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=150,
                    temperature=0.7
                )
                
                return completion.choices[0].message.content
            
        except Exception as e:
            print(f"AI explanation generation error: {e}")
        
        # Fallback explanation
        return "Based on your interests and learning goals, we've hand-picked these courses to help you grow. Each course is chosen to match your skill level and career aspirations!"
    
    def get_ai_chat_response(self, user_message, user_responses=None):
        """Get AI response for chat-based recommendations"""
        try:
            if self.client:
                context = ""
                if user_responses:
                    responses_summary = "\n".join([f"- {r['question']}: {r['answer']}" for r in user_responses])
                    context = f"User preferences:\n{responses_summary}\n\n"
                
                prompt = f"""{context}User asks: {user_message}

You are a friendly learning advisor. Provide a helpful response suggesting courses or learning paths. Keep it concise (2-3 sentences) and focused on practical recommendations. If the user asks about courses, suggest from categories like: Data Science, Web Development, Soft Skills, Programming, DSA."""

                completion = self.client.chat.completions.create(
                    model="mistralai/Mistral-7B-Instruct-v0.1",
                    messages=[
                        {"role": "system", "content": "You are a knowledgeable course advisor. Provide specific course recommendations based on user interests."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=150,
                    temperature=0.7
                )
                
                return completion.choices[0].message.content
        
        except Exception as e:
            print(f"AI chat error: {e}")
        
        return "I'd recommend checking out our courses in Data Science, Web Development, or Soft Skills based on your interests. Which area excites you most?"