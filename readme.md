# Cognitive Learning Ecosystem – AI-Powered Adaptive Learning Platform

An intelligent, multimodal adaptive learning ecosystem that integrates AI-powered course recommendations, communication skill development, mental wellness support, posture analytics, and personalized learning paths for students.

## Features

- **Adaptive Learning:** Personalized course recommendations using AI with collaborative filtering and behavioral analysis.
- **Communication Training:** Interview practice with AI-generated questions, conversation simulations, and real-time speech recognition.
- **Writing Enhancement:** AI-powered grammar correction, style suggestions, and writing improvement with one-click text replacement.
- **Mental Wellness:** Stress relief exercises, guided meditation, posture detection using computer vision, and mindfulness activities.
- **AI Study Assistant:** 24/7 intelligent chat support powered by OpenRouter/Groq API with dynamic fallback responses.
- **Live Conversation Practice:** Dynamic AI conversations with difficulty levels (Easy/Medium/Hard) and real-time scoring.
- **Posture & Exercise Assistant:** Real-time pose detection using MediaPipe, reference video matching, and ergonomic feedback.
- **Analytics Dashboard:** Study streak tracking, session type analytics (timer/posture/stress), weekly trends, and goal completion.
- **User Experience:** Dark/light theme toggle, responsive design, study timer with mute option, and progress tracking.

## Tech Stack

**Frontend:** React 18, React Router v6, Vite, CSS3 with CSS variables, WebSocket, Recharts for analytics

**Backend:** Node.js, Express.js, MongoDB with Mongoose, JWT authentication, Socket.io for real-time communication

**AI Services:** Python, Flask, Flask-SocketIO, OpenRouter API, Groq API, MediaPipe, OpenCV, SpeechRecognition, gTTS

## Project Structure

```bash
STUDENT_PEERS/
├── backend/
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── certificateController.js
│   │   ├── courseController.js
│   │   ├── progressController.js
│   │   └── supportController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── CallRequest.js
│   │   ├── Certificate.js
│   │   ├── ConversationSession.js
│   │   ├── Course.js
│   │   ├── CourseProgress.js
│   │   ├── Enrollment.js
│   │   ├── InterviewSession.js
│   │   ├── StudySession.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── certificateRoutes.js
│   │   ├── conversationRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── progressRoutes.js
│   │   └── supportRoutes.js
│   ├── AISupport_backend/
│   │   ├── ai_support_server.py
│   │   ├── ai_support_service.py
│   │   ├── conversation_service.py
│   │   ├── recommendation_server.py
│   │   ├── recommendation_service.py
│   │   ├── writing_service.py
│   │   ├── requirements.txt
│   │   └── .env
│   ├── config/
│   │   └── db.js
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalogClock.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── StudyTimer.jsx
│   │   │   └── WebSocketTest.jsx
│   │   ├── pages/
│   │   │   ├── AISupport.jsx
│   │   │   ├── CommTrainer.jsx
│   │   │   ├── ConversationChat.jsx
│   │   │   ├── ConversationPractice.jsx
│   │   │   ├── CourseDetail.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── HumanHelp.jsx
│   │   │   ├── InterviewPractice.jsx
│   │   │   ├── InterviewScenarios.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── PostureAssistant.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ProfileEdit.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── StressRelief.jsx
│   │   │   └── WritingPractice.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── api/
│   │   │   └── conversationApi.js
│   │   ├── assets/
│   │   │   ├── comm/
│   │   │   ├── courses_img/
│   │   │   ├── exercise_img/
│   │   │   ├── exercise_videos/
│   │   │   ├── users_interview/
│   │   │   └── tick.mp3
│   │   ├── hooks/
│   │   │   └── useStudyTimer.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── ai_models/
└── docs/

```


## Installation

### Clone the Repository

```bash
git clone https://github.com/sudha-kumari-24/Smart-Learning.git
cd Smart-Learning
```

### Backend Setup

```bash
cd backend
npm install
node seed.js
npm start
```

The backend runs on port **5000**.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on port **5173**.

### AI Services Setup

```bash
cd backend/AISupport_backend

python -m venv ai_venv

# Windows
ai_venv\Scripts\activate

# Linux / Mac
source ai_venv/bin/activate

pip install -r requirements.txt
```


### Start Individual AI Services
```bash
# AI Chat Support (port 8001)
python ai_support_server.py

# Course Recommendations (port 8002)
python recommendation_server.py

# Writing Analysis (port 8003)
python writing_service.py

# Live Conversation (port 8004)
python conversation_service.py
```

## Environment Variables

### Backend .env file
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
MONGO_URI=mongodb://localhost:27017/smartlearning
GOOGLE_CLIENT_ID=your_google_client_id
FRONTEND_URL=http://localhost:5173
```

### AI Services .env file (backend/AISupport_backend/.env)
```bash
OPENROUTER_API_KEY=your_openrouter_api_key
GROQ_API_KEY=your_groq_api_key
TOGETHER_API_KEY=your_together_api_key
```

## API Routes

### Authentication

```bash
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
POST /api/auth/google - Google OAuth login
GET  /api/auth/profile - Get user profile
PUT  /api/auth/profile - Update user profile
```

### Courses

```bash
GET    /api/courses - Get all courses
GET    /api/courses/:id - Get single course details
POST   /api/courses/enroll - Enroll in a course
POST   /api/courses/progress - Update video watch progress
POST   /api/courses/check-enrollment - Check enrollment status
```

### Analytics & Progress

```bash
GET    /api/analytics/dashboard - Get all dashboard data (streak, hours, weekly trend)
GET    /api/analytics/daily - Get daily progress for charts
POST   /api/analytics/update - Update study timer progress (with sessionType)
POST   /api/analytics/seed - Seed dummy data for testing
```

### Certificates

```bash
POST /api/certificate/data - Get certificate data for PDF generation
POST /api/certificate/generate - Generate and download certificate PDF
GET  /api/certificate/verify/:id - Verify certificate authenticity
```

### AI Services

```bash
WebSocket ws://localhost:8001 - AI Chat WebSocket connection
POST http://localhost:8002/api/recommendations/generate - Generate course recommendations
POST http://localhost:8003/api/writing/analyze - AI-powered writing analysis
POST http://localhost:8004/api/conversation/chat - Dynamic AI conversation
```


## Database Schema

### User Model

```javascript
{
  fullName: String,
  email: String,
  classCourse: String,
  schoolCollege: String,
  passwordHash: String,
  googleId: String,
  preferences: {
    studyGoalMinutesPerDay: Number,
    preferredStudyTime: String,
    focusAreas: [String]
  }
}
```
### Course Model

```javascript
{
  title: String,
  description: String,
  category: String,
  level: String,
  durationHours: Number,
  instructor: String,
  tags: [String],
  videos: [{ title: String, embedUrl: String }],
  certificate: Boolean
}
```
### StudySession Model

```javascript
{
  user: ObjectId (ref: User),
  sessionType: String (timer/posture/stress_relief),
  minutesStudied: Number,
  date: String
}
```
### CourseProgress Model

```javascript
{
  user: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  progressPercent: Number,
  completed: Boolean,
  watchedVideos: [Number]
}
```

## Running the Complete System

You need multiple terminals running simultaneously:

### Terminal 1 - Main Backend:

```bash
cd backend
npm start
```

### Terminal 2 - Frontend:

```bash
cd frontend
npm run dev
```

### Terminal 3 - AI Chat Service:

```bash
cd backend/AISupport_backend
source ai_venv/bin/activate
python ai_support_server.py
```

### Terminal 4 - Other AI Services (optional):

```bash
cd backend/AISupport_backend
source ai_venv/bin/activate
python recommendation_server.py   # For course recommendations
python writing_service.py         # For writing analysis
python conversation_service.py    # For live conversation

```

## Troubleshooting

MongoDB connection error: Ensure MongoDB is running on your system. Run mongod or start the MongoDB service.

AI Service module not found: Activate the virtual environment and run pip install -r requirements.txt.

WebSocket connection failed: Ensure the AI Support server is running on port 8001 and the main backend on port 5000.

Certificate generation fails: Check that the user and course IDs exist in the database. Run node seed.js to populate sample data.

Posture detection not working: Ensure webcam permissions are granted and MediaPipe scripts are loaded from CDN.

## Future Enhancements

- Real-time peer collaboration with video conferencing

- Gamification with badges, achievements, and leaderboards

- Mobile application with React Native

- AI-powered code review for programming courses

- Blockchain-based certificate verification

- Offline mode for course videos and AI responses

## Contributing

- Fork the repository.

- Create a feature branch: git checkout -b feature/AmazingFeature

- Commit your changes: git commit -m 'Add AmazingFeature'

- Push to the branch: git push origin feature/AmazingFeature

- Open a Pull Request.

## License
MIT License

## Contact

Sudha Kumari
- LinkedIn: https://www.linkedin.com/in/sudha-kumari-92abb8205/
- GitHub: https://github.com/sudha-kumari-24
- Project Repository: https://github.com/sudha-kumari-24/Smart-Learning

⭐ If you find this project helpful, please consider giving it a star on GitHub!
