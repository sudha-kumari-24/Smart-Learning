# backend/ai/recommendation/recommender.py
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

def recommend_courses(user_data):
    # Load course data
    courses = pd.read_csv('courses.csv')
    # Calculate similarity
    similarity = cosine_similarity(courses[['features']])
    # Return top recommendations
    return courses.head(5).to_dict('records')
