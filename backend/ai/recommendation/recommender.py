
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

def recommend_courses(user_data):
   
    courses = pd.read_csv('courses.csv')
   
    similarity = cosine_similarity(courses[['features']])
    
    return courses.head(5).to_dict('records')
