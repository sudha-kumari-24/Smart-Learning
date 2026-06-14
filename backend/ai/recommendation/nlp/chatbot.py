
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def chatbot_response(user_input):
    
    responses = {
        "hello": "Hi! How can I help?",
        "recommendation": "Check out our recommended courses.",
        "stress": "Try our meditation module."
    }
   
    vectorizer = TfidfVectorizer()
    tfidf = vectorizer.fit_transform(responses.keys())
    scores = cosine_similarity(vectorizer.transform([user_input]), tfidf)
    best_match = list(responses.keys())[scores.argmax()]
    return responses[best_match]
