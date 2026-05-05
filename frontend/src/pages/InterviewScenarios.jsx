import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './InterviewScenarios.css';


import Business_Analyst from '../assets/interviewsType_img/Business_Analyst.jpg';
import data_science from '../assets/interviewsType_img/data_science.jpg';
import General_Interview from '../assets/interviewsType_img/General_Interview.jpg';
import HR_Interview from '../assets/interviewsType_img/HR_Interview.jpg';
import Product_Management from '../assets/interviewsType_img/Product_Management.jpg';
import softwareEngineering from '../assets/interviewsType_img/softwareEngineering.jpg';








function InterviewScenarios() {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user || null;
  const { show } = useNotification();
  
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!user) {
      show('Please login to access interview scenarios', 'error');
      navigate('/communication');
    }
  }, [user, show, navigate]);

  if (!user) return null;

  const interviewCategories = [
    { 
      id: 'software', 
      name: 'Software Engineering', 
      image: softwareEngineering,
      count: 12,
      description: 'Technical interviews for developer roles',
      duration: '15-30 min'
    },
    { 
      id: 'data-science', 
      name: 'Data Science', 
      image: data_science,
      count: 8,
      description: 'ML, statistics, and data analysis questions',
      duration: '20-40 min'
    },
    { 
      id: 'product', 
      name: 'Product Management', 
      image: Product_Management,
      count: 10,
      description: 'Product sense and strategy interviews',
      duration: '25-45 min'
    },
    { 
      id: 'business', 
      name: 'Business Analyst', 
      image: Business_Analyst,
      count: 6,
      description: 'Business cases and analytical thinking',
      duration: '20-35 min'
    },
    { 
      id: 'hr', 
      name: 'HR Interview', 
      image: HR_Interview,
      count: 15,
      description: 'Behavioral and situational questions',
      duration: '15-25 min'
    },
    { 
      id: 'general', 
      name: 'General Interview', 
      image: General_Interview,
      count: 20,
      description: 'Common interview questions for all roles',
      duration: '10-20 min'
    }
  ];

  const filteredCategories = selectedCategory === 'all' 
    ? interviewCategories 
    : interviewCategories.filter(cat => cat.id === selectedCategory);

  const handleSelectInterview = (categoryId) => {
    navigate(`/interview-practice?type=${categoryId}`);
  };

  return (
    <section className="page interview-scenarios-page">
      <header className="page-header">
        <h2>Interview Practice Scenarios</h2>
        <p>Select an interview type to practice with video recording and feedback</p>
        <button 
          className="btn-back"
          onClick={() => navigate('/communication')}
        >
          ← Back to Communication Trainer
        </button>
      </header>

      {/* Category Filter */}
      <div className="category-filter">
        <button 
          className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Categories
        </button>
        {interviewCategories.map(cat => (
          <button
            key={cat.id}
            className={`filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Interview Grid */}
      <div className="interview-grid">
        {filteredCategories.map(category => (
          <div key={category.id} className="interview-card">
            <div className="interview-card-image">
              <img src={category.image} alt={category.name} />
              <div className="interview-count">{category.count} Interviews</div>
            </div>
            <div className="interview-card-content">
              <h3>{category.name}</h3>
              <p className="category-desc">{category.description}</p>
              <div className="category-meta">
                <span className="duration-badge">⏱️ {category.duration}</span>
                <span className="level-badge">📊 All Levels</span>
              </div>
              <button 
                className="btn-primary"
                onClick={() => handleSelectInterview(category.id)}
              >
                Practice Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default InterviewScenarios;