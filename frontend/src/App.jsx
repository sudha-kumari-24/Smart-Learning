import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';


import CommTrainer from './pages/CommTrainer.jsx';
import StressRelief from './pages/StressRelief.jsx';
import AISupport from './pages/AISupport.jsx';
import HumanHelp from './pages/HumanHelp.jsx';
import PostureAssistant from './pages/PostureAssistant.jsx';

import Profile from './pages/Profile.jsx';
import ProfileEdit from './pages/ProfileEdit.jsx';

import Login from './pages/Login';
import Signup from './pages/Signup';

import InterviewScenarios from './pages/InterviewScenarios';
import InterviewPractice from './pages/InterviewPractice';
import ConversationPractice from './pages/ConversationPractice';
import ConversationChat from './pages/ConversationChat';
import WritingPractice from './pages/WritingPractice';


import Recommendations from './pages/Recommendations';

import NotFound from './pages/NotFound.jsx';

import './styles/App.css';




function App() {
  return (
    <div className="app-root">
      <Navbar />

      <main className="app-main">
        <Routes>

          {/* MAIN */}
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* COURSES */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          
          <Route path="/course/:id/enroll" element={<div>Enroll Page Coming Soon</div>} />
          <Route path="/course/:id/preview" element={<div>Preview Page Coming Soon</div>} />

         

          {/* OTHER FEATURES */}
          <Route path="/communication" element={<CommTrainer />} />
          <Route path="/stress-relief" element={<StressRelief />} />
          <Route path="/ai-support" element={<AISupport />} />
          <Route path="/human-help" element={<HumanHelp />} />
          <Route path="/posture-assistant" element={<PostureAssistant />} />

          {/* PROFILE */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileEdit />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* TRAINING */}
          <Route path="/interview-scenarios" element={<InterviewScenarios />} />
          <Route path="/interview-practice" element={<InterviewPractice />} />
          <Route path="/conversation-practice" element={<ConversationPractice />} />
          <Route path="/conversation-chat" element={<ConversationChat />} />
          <Route path="/writing-practice" element={<WritingPractice />} />


          <Route path="/recommendations" element={<Recommendations />} />

          {/* ❗ ALWAYS LAST */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </main>
    </div>
  );
}

export default App;