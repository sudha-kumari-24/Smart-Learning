import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './WritingPractice.css';

function WritingPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { show } = useNotification();
  
  const [userText, setUserText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [highlightedRanges, setHighlightedRanges] = useState([]);
  
  const textareaRef = useRef(null);

 
  const demoText = `Hi their! Im writeing to inform you that the meeting have been moved to tomorrow. We should discusses about the new project and it's deadlines. Please bringing your notes.`;

 
  useEffect(() => {
    if (analysis && analysis.errors && analysis.errors.length > 0 && userText) {
      const ranges = [];
      analysis.errors.forEach(error => {
        const regex = new RegExp(`\\b${escapeRegex(error.word)}\\b`, 'gi');
        let match;
        while ((match = regex.exec(userText)) !== null) {
          ranges.push({
            start: match.index,
            end: match.index + error.word.length,
            color: error.color || 'red',
            word: error.word,
            suggestion: error.suggestion,
            reason: error.reason
          });
        }
      });
      setHighlightedRanges(ranges);
    } else {
      setHighlightedRanges([]);
    }
  }, [analysis, userText]);

 
  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  
  const analyzeText = async () => {
    if (!userText.trim()) {
      show('Please enter some text to analyze', 'error');
      return;
    }
    
    setIsAnalyzing(true);
    
   
    const isDemo = userText === demoText;
    
    try {
      const response = await fetch('http://localhost:8003/api/writing/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userText,
          is_demo: isDemo
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
        show(`Analysis complete! Score: ${data.analysis.score}/100`, 'success');
      } else {
        show(data.error || 'Analysis failed', 'error');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      show('Could not connect to analysis service', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

 
  const replaceWithImproved = () => {
    if (analysis && analysis.improved_text) {
      setUserText(analysis.improved_text);
      setAnalysis(null);
      setHighlightedRanges([]);
      show('Text replaced with improved version!', 'success');
    }
  };

 
  const loadDemo = () => {
    setUserText(demoText);
    setAnalysis(null);
    setHighlightedRanges([]);
    show('Demo text loaded. Click "Analyze Text" to see analysis.', 'info');
  };

 
  const clearText = () => {
    setUserText('');
    setAnalysis(null);
    setHighlightedRanges([]);
  };

 
  const renderHighlightedPreview = () => {
    if (!userText || highlightedRanges.length === 0) return null;
    
    let lastIndex = 0;
    const elements = [];
    
    const sortedRanges = [...highlightedRanges].sort((a, b) => a.start - b.start);
    
    sortedRanges.forEach((range, idx) => {
      
      if (range.start > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {userText.substring(lastIndex, range.start)}
          </span>
        );
      }
      
     
      elements.push(
        <span 
          key={`highlight-${idx}`}
          className={`error-highlight ${range.color}`}
          title={`Suggestion: ${range.suggestion}\nReason: ${range.reason || 'Check this error'}`}
        >
          {userText.substring(range.start, range.end)}
        </span>
      );
      
      lastIndex = range.end;
    });
    
    
    if (lastIndex < userText.length) {
      elements.push(
        <span key="text-end">
          {userText.substring(lastIndex)}
        </span>
      );
    }
    
    return <div className="highlighted-preview">{elements}</div>;
  };

  
  const getScoreColor = (score) => {
    if (score >= 80) return '#4ade80';
    if (score >= 60) return '#fbbf24';
    return '#ef4444';
  };

  if (!user) return null;

  return (
    <section className="page writing-page">
      <header className="page-header">
        <h2>Writing Improvement</h2>
        <p>AI-powered grammar, spelling, style, and clarity analysis</p>
        <div className="header-actions">
          <button 
            className="btn-back"
            onClick={() => navigate('/communication')}
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="writing-container">
      
        <div className="writing-panel">
          <div className="text-area-container">
            <div className="text-area-header">
              <h3>Your Text</h3>
              <div className="text-actions">
                <button onClick={loadDemo} className="btn-small">
                  Load Demo
                </button>
                <button onClick={clearText} className="btn-small">
                  Clear
                </button>
              </div>
            </div>
            
            <textarea
              ref={textareaRef}
              value={userText}
              onChange={(e) => {
                setUserText(e.target.value);
                if (e.target.value !== demoText) {
                  setAnalysis(null);
                  setHighlightedRanges([]);
                }
              }}
              placeholder="Paste or type your text here for analysis..."
              className="writing-textarea"
              rows={12}
            />
            
            
            {analysis && analysis.errors && analysis.errors.length > 0 && (
              <div className="highlighted-container">
                <h4>Preview with Highlights:</h4>
                {renderHighlightedPreview()}
              </div>
            )}
            
            <div className="text-stats">
              <span>Words: {userText.trim().split(/\s+/).filter(Boolean).length}</span>
              <span>Characters: {userText.length}</span>
            </div>
            
            <div className="action-buttons">
              <button 
                onClick={analyzeText}
                disabled={isAnalyzing || !userText.trim()}
                className="btn-primary analyze-btn"
              >
                {isAnalyzing ? '🔍 Analyzing...' : '✨ Analyze Text'}
              </button>
              
              {analysis && analysis.improved_text && analysis.improved_text !== userText && (
                <button 
                  onClick={replaceWithImproved}
                  className="btn-success replace-btn"
                >
                  📝 Replace with Improved Version
                </button>
              )}
            </div>
          </div>
        </div>

      
        <div className="analysis-panel">
          <h3>Analysis Results</h3>
          
          {isAnalyzing ? (
            <div className="loading-analysis">
              <div className="spinner"></div>
              <p>AI is analyzing your text...</p>
            </div>
          ) : analysis ? (
            <div className="results-container">
       
              <div className="score-card">
                <div className="score-circle" style={{ borderColor: getScoreColor(analysis.score) }}>
                  <span className="score-value" style={{ color: getScoreColor(analysis.score) }}>
                    {analysis.score}
                  </span>
                  <span className="score-label">/100</span>
                </div>
                <div className="score-details">
                  <h4>Overall Score</h4>
                  <p>
                    {analysis.score >= 80 ? 'Excellent! 🎉' : 
                     analysis.score >= 60 ? 'Good! 👍' : 
                     'Needs Improvement 💡'}
                  </p>
                  {analysis.score >= 80 && (
                    <p>Your writing is clear and effective!</p>
                  )}
                  {analysis.score >= 60 && analysis.score < 80 && (
                    <p>Good work! A few improvements will make it excellent.</p>
                  )}
                  {analysis.score < 60 && (
                    <p>Review the suggestions below to improve your writing.</p>
                  )}
                </div>
              </div>

            
              {analysis.errors && analysis.errors.length > 0 && (
                <div className="errors-section">
                  <h4>Found {analysis.errors.length} Issue{analysis.errors.length !== 1 ? 's' : ''}</h4>
                  <div className="errors-list">
                    {analysis.errors.map((error, index) => (
                      <div key={index} className="error-item" style={{ borderLeftColor: error.color || 'red' }}>
                        <div className="error-header">
                          <span className="error-word" style={{ color: error.color || 'red' }}>
                            "{error.word}"
                          </span>
                          <span className="error-type">({error.type || 'grammar'})</span>
                        </div>
                        <div className="error-suggestion">
                          <span>Suggested: </span>
                          <strong>"{error.suggestion}"</strong>
                        </div>
                        <div className="error-reason">
                          <span>Why: </span>
                          {error.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

             
              {analysis.improved_text && analysis.improved_text !== userText && (
                <div className="improved-section">
                  <h4>✨ Improved Version</h4>
                  <div className="improved-text">
                    {analysis.improved_text}
                  </div>
                </div>
              )}

              
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="suggestions-section">
                  <h4>💡 Tips for Improvement</h4>
                  <ul className="suggestions-list">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                onClick={clearText}
                className="btn-secondary"
              >
                ↻ Try Another Text
              </button>
            </div>
          ) : (
            <div className="no-analysis">
              <div className="placeholder-icon">✍️</div>
              <h4>No Analysis Yet</h4>
              <p>Write or paste some text and click "Analyze Text" to get AI-powered feedback.</p>
              <div className="demo-tips">
                <p><strong>Tip:</strong> Click "Load Demo" to see a sample analysis (no API call needed)</p>
                <p><strong>What gets analyzed:</strong> Spelling, Grammar, Punctuation, Word Choice, Style, Formality</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WritingPractice;