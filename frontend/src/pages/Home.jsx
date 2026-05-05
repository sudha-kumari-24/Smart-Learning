import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { useAuth } from '../context/AuthContext';

// Import images
import interactImage from '../assets/comm/interact.jpg';
import interviewImage from '../assets/comm/interview.jpg';
import writingImage from '../assets/comm/writing.jpg';
import scholarsImage from '../assets/signin scholars.png';
import breathingImage from '../assets/exercise_img/breathing.png';

function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    satisfaction: 0
  });

  // Animated counter for stats
  useEffect(() => {
    const targetStats = {
      students: 15000,
      courses: 48,
      satisfaction: 96
    };

    const duration = 2000;
    const steps = 60;
    const increment = {
      students: targetStats.students / steps,
      courses: targetStats.courses / steps,
      satisfaction: targetStats.satisfaction / steps
    };

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps) {
        setStats({
          students: Math.min(Math.floor(increment.students * currentStep), targetStats.students),
          courses: Math.min(Math.floor(increment.courses * currentStep), targetStats.courses),
          satisfaction: Math.min(Math.floor(increment.satisfaction * currentStep), targetStats.satisfaction)
        });
        currentStep++;
      } else {
        setStats(targetStats);
        clearInterval(interval);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, []);

  // Floating tags around the circle
  const floatingTags = [
    { text: "📚 Study Tips", position: "tag-top-left", delay: 0 },
    { text: "🧘 Stress Relief", position: "tag-top-right", delay: 1 },
    { text: "💬 AI Support", position: "tag-right-top", delay: 2 },
    { text: "📊 Analytics", position: "tag-right-bottom", delay: 3 },
    { text: "🎯 Personalized", position: "tag-bottom-right", delay: 4 },
    { text: "⭐ Communication", position: "tag-bottom-left", delay: 5 },
    { text: "🚀 Career Growth", position: "tag-left-bottom", delay: 6 },
    { text: "💪 Motivation", position: "tag-left-top", delay: 7 },
    { text: "🪑 Posture Check", position: "tag-center-right", delay: 8 }
  ];

  return (
    <div className="home-module">
      {/* Hero Section with Image Collage */}
      <section className="home-hero-enhanced">
        <div className="home-hero-content-enhanced">
          <div className="home-badge-enhanced">
            <span className="badge-icon-enhanced">✨</span>
            <span>AI-Powered Learning</span>
          </div>
          
          <h1 className="home-title-enhanced">
            Study Like a Pro,{' '}
            <span className="gradient-text-enhanced">Without Burnout</span>
          </h1>
          
          <p className="home-description-enhanced">
            SmartLearning builds a personal path from your mood, habits, and goals.
          </p>
          
          <div className="home-cta-buttons-enhanced">
            <Link to={user ? "/dashboard" : "/signup"} className="btn-primary-enhanced">
              {user ? "Dashboard →" : "Start Free →"}
            </Link>
            <Link to="/courses" className="btn-secondary-enhanced">
              Explore Courses
            </Link>
          </div>
          
          {/* Stats Section */}
          <div className="home-stats-enhanced">
            <div className="stat-item-enhanced">
              <div className="stat-number-enhanced">{stats.students.toLocaleString()}+</div>
              <div className="stat-label-enhanced">Students</div>
            </div>
            <div className="stat-divider-enhanced"></div>
            <div className="stat-item-enhanced">
              <div className="stat-number-enhanced">{stats.courses}+</div>
              <div className="stat-label-enhanced">Courses</div>
            </div>
            <div className="stat-divider-enhanced"></div>
            <div className="stat-item-enhanced">
              <div className="stat-number-enhanced">{stats.satisfaction}%</div>
              <div className="stat-label-enhanced">Satisfied</div>
            </div>
          </div>
        </div>
        
        {/* Image Collage Section with Floating Tags */}
        <div className="home-hero-visual-enhanced">
          <div className="image-collage">
            {/* Center Image */}
            <div className="collage-main">
              <img src={scholarsImage} alt="Scholars" className="main-image" />
              <div className="main-image-glow"></div>
            </div>
            
            {/* 4 Boundary Images */}
            <div className="collage-item item-top">
              <img src={interactImage} alt="Interaction" />
              <div className="item-label">Communication</div>
            </div>
            <div className="collage-item item-right">
              <img src={interviewImage} alt="Interview" />
              <div className="item-label">Interview</div>
            </div>
            <div className="collage-item item-bottom">
              <img src={writingImage} alt="Writing" />
              <div className="item-label">Writing</div>
            </div>
            <div className="collage-item item-left">
              <img src={breathingImage} alt="Breathing" />
              <div className="item-label">Wellness</div>
            </div>
            
            {/* Floating Tags around the circle */}
            {floatingTags.map((tag, index) => (
              <div key={index} className={`floating-tag ${tag.position}`} style={{ animationDelay: `${tag.delay * 0.3}s` }}>
                {tag.text}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section - Compact */}
      <section className="home-features-compact">
        <div className="section-header-compact">
          <h2>Everything You Need</h2>
          <p>Powerful tools for your learning journey</p>
        </div>
        
        <div className="features-grid-compact">
          {[
            { icon: "🎯", title: "Personalized Learning", desc: "AI-powered recommendations" },
            { icon: "🧠", title: "Mental Wellness", desc: "Stress management integrated" },
            { icon: "💬", title: "Communication Skills", desc: "Practice interviews" },
            { icon: "📊", title: "Track Progress", desc: "Detailed analytics" },
            { icon: "🤖", title: "24/7 AI Support", desc: "Instant help anytime" },
            { icon: "👥", title: "Human Help", desc: "Connect with mentors" }
          ].map((feature, index) => (
            <div key={index} className="feature-card-compact">
              <div className="feature-icon-compact">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Testimonials Section - Compact */}
      <section className="home-testimonials-compact">
        <div className="section-header-compact">
          <h2>Student Love</h2>
          <p>What our learners say</p>
        </div>
        
        <div className="testimonials-grid-compact">
          {[
            { name: "Rahul S.", text: "Transformed my study routine!", rating: 5, avatar: "👨‍🎓" },
            { name: "Priya V.", text: "Aced my interviews thanks to this!", rating: 5, avatar: "👩‍🎓" },
            { name: "Amit K.", text: "Perfect for upskilling!", rating: 5, avatar: "👨‍💻" }
          ].map((testimonial, index) => (
            <div key={index} className="testimonial-card-compact">
              <div className="testimonial-avatar-compact">{testimonial.avatar}</div>
              <div className="testimonial-stars-compact">{'⭐'.repeat(testimonial.rating)}</div>
              <p className="testimonial-text-compact">"{testimonial.text}"</p>
              <h4 className="testimonial-name-compact">{testimonial.name}</h4>
            </div>
          ))}
        </div>
      </section>
      
      {/* CTA Section - Compact */}
      <section className="home-cta-compact">
        <div className="cta-content-compact">
          <h2>Ready to Transform Your Learning?</h2>
          <p>Join thousands of students already excelling with SmartLearning</p>
          <Link to={user ? "/dashboard" : "/signup"} className="btn-cta-compact">
            Get Started →
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;