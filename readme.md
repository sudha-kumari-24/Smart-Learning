# Student Peers – AI-Powered Learning Platform

An intelligent learning platform that combines AI-powered course recommendations, communication skill development, mental wellness support, and personalized learning paths for students.

## Features

- **Core Learning:** Personalized course recommendations, video-based courses, and communication skill training.
- **Mental Wellness:** Stress relief exercises, posture assistance, and mindfulness activities.
- **AI Integration:** 24/7 AI study assistant powered by Together AI with dynamic fallback responses.
- **User Experience:** Dark/light mode, responsive design, Pomodoro study timer, and analytics dashboard.
- **Support:** Human help requests for connecting with mentors and counselors.

## Tech Stack

**Frontend:** React 18, Vite, CSS3, WebSocket  
**Backend:** Node.js, Express.js, MongoDB/Mongoose, JWT, Socket.io  
**AI Services:** Python, Flask, Flask-SocketIO, Together AI API, SpeechRecognition, gTTS

## Project Structure

```bash
STUDENT_PEERS/
├── backend/
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── progressController.js
│   │   └── supportController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── CallRequest.js
│   │   ├── ConversationSession.js
│   │   ├── Course.js
│   │   ├── DailyProgress.js
│   │   ├── InterviewSession.js
│   │   ├── Progress.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── conversationRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── progressRoutes.js
│   │   └── supportRoutes.js
│   ├── AISupport_backend/
│   │   ├── ai_support_server.py
│   │   ├── ai_support_service.py
│   │   ├── recommendation_server.py
│   │   ├── recommendation_service.py
│   │   ├── requirements.txt
│   │   └── .env
│   ├── config/
│   │   └── db.js
│   ├── seed.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── api/
│   └── vite.config.js
├── ai_models/
└── docs/
```

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/student_peers.git
cd student_peers
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
node seed.js
npm start
```

The backend runs on port 5000.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on port 5173.

### AI Support Service Setup

```bash
cd backend/AISupport_backend
python -m venv ai_venv
source ai_venv/bin/activate
pip install -r requirements.txt
python ai_support_server.py
```

The AI service runs on port 8001. The recommendation service runs on port 8002.

## API Routes

**Authentication**

```bash
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
POST /api/auth/google - Google OAuth login
```

**Courses**

```bash
GET /api/courses - Get all courses
GET /api/courses/:id - Get single course details
POST /api/courses/:id/enroll - Enroll in a course
```

**Progress Tracking**

```bash
GET /api/progress/:userId - Get user progress
POST /api/analytics/update - Update study time
```

**AI Services**

```bash
WebSocket ws://localhost:8001 - AI Chat WebSocket connection
GET http://localhost:8002/api/recommendations/generate - Generate course recommendations
```

## Database Schema

**User Model**

```javascript
{
  fullName: String,
  email: String (unique),
  preferences: {
    studyGoalMinutesPerDay: Number,
    focusAreas: [String]
  },
  goals: [{ title: String, type: String, status: String }]
}
```

**Course Model**

```javascript
{
  title: String,
  description: String,
  category: String,
  level: String,
  videos: [{ title: String, embedUrl: String }]
}
```

## Future Enhancements

- Real-time peer collaboration and video study sessions.
- Gamification with leaderboards and achievement badges.
- React Native mobile application.
- AI-powered code review and blockchain certificate verification.

## Contributing

- Fork the repository.
- Create feature branch: `git checkout -b feature/AmazingFeature`
- Commit changes: `git commit -m 'Add AmazingFeature'`
- Push to branch: `git push origin feature/AmazingFeature`
- Open a Pull Request.

## License

MIT License

## Contact

**Sudha Kumari**  
**LinkedIn:** [https://www.linkedin.com/in/sudha-kumari-92abb8205/](https://www.linkedin.com/in/sudha-kumari-92abb8205/)
