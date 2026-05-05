import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './WritingPractice.css';

function WritingPractice() {
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user || null;
  const { show } = useNotification();
  
  // API Key state (user can paste their key)
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  const [apiStatus, setApiStatus] = useState(''); // 'valid', 'expired', 'required'
  
  const [writingMode, setWritingMode] = useState('grammar');
  const [userText, setUserText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  // For text highlighting
  const textareaRef = useRef(null);
  const [highlightedRanges, setHighlightedRanges] = useState([]);

  const demoTexts = {
    grammar: {
      incorrect: `Hi their! Im writeing to inform you that the meeting have been moved to tomorrow. We should discusses about the new project and it's deadlines. Please bringing your notes.`,
      correct: `Hi there! I'm writing to inform you that the meeting has been moved to tomorrow. We should discuss the new project and its deadlines. Please bring your notes.`
    },
    essay: {
      prompt: `Write a short paragraph about the importance of communication skills in the workplace.`,
      sample: `Effective communication skills are crucial in the workplace because they facilitate clear understanding between colleagues, reduce misunderstandings, and enhance team collaboration. Good communicators can express ideas concisely, listen actively to feedback, and adapt their message to different audiences. This leads to improved productivity, better problem-solving, and a more positive work environment.`,
      keywords: ['communication', 'workplace', 'understanding', 'collaboration', 'productivity', 'environment']
    }
  };

  // Demo errors (only for demo text)
  const demoErrors = [
    { 
      word: 'their', 
      suggestion: 'there', 
      reason: 'Wrong word usage',
      type: 'grammar',
      color: 'red'
    },
    { 
      word: 'Im', 
      suggestion: "I'm", 
      reason: 'Missing apostrophe',
      type: 'punctuation',
      color: 'orange'
    },
    { 
      word: 'writeing', 
      suggestion: 'writing', 
      reason: 'Spelling error',
      type: 'spelling',
      color: 'red'
    },
    { 
      word: 'have', 
      suggestion: 'has', 
      reason: 'Subject-verb agreement',
      type: 'grammar',
      color: 'red'
    },
    { 
      word: 'discusses', 
      suggestion: 'discuss', 
      reason: 'Verb form error',
      type: 'grammar',
      color: 'red'
    },
    { 
      word: "it's", 
      suggestion: 'its', 
      reason: "Wrong use of apostrophe (possessive vs contraction)",
      type: 'punctuation',
      color: 'orange'
    },
    { 
      word: 'bringing', 
      suggestion: 'bring', 
      reason: 'Verb form error',
      type: 'grammar',
      color: 'red'
    }
  ];

  useEffect(() => {
    if (!user) {
      show('Please login to access writing practice', 'error');
      navigate('/communication');
    }
  }, [user, show, navigate]);

  // Load demo text only when mode changes and no user text exists
  useEffect(() => {
    if (writingMode === 'grammar' && !userText) {
      setUserText(demoTexts.grammar.incorrect);
    } else if (writingMode === 'essay' && !userText) {
      setUserText('');
    }
  }, [writingMode]);

  // Update highlighted ranges when suggestions change
  useEffect(() => {
    if (suggestions.length > 0 && userText) {
      const ranges = [];
      suggestions.forEach(error => {
        const regex = new RegExp(`\\b${error.word}\\b`, 'g');
        let match;
        while ((match = regex.exec(userText)) !== null) {
          ranges.push({
            start: match.index,
            end: match.index + error.word.length,
            color: error.color || 'red',
            word: error.word,
            suggestion: error.suggestion
          });
        }
      });
      setHighlightedRanges(ranges);
    } else {
      setHighlightedRanges([]);
    }
  }, [suggestions, userText]);

  const validateApiKey = (key) => {
    // Simulate API key validation
    // In production, this would call your backend to validate the key
    if (key && key.length > 10) {
      return 'valid';
    } else if (key && key.length <= 10) {
      return 'expired';
    }
    return 'required';
  };

  const analyzeWithAI = async (text) => {
    // This is where you'd integrate with ChatGPT or other AI API
    // For now, it's a placeholder that returns mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock AI response - in production, this would be actual API call
        const mockAIErrors = [
          {
            word: 'example',
            suggestion: 'sample',
            reason: 'Word choice improvement',
            type: 'style',
            color: 'blue'
          }
        ];
        resolve(mockAIErrors);
      }, 2000);
    });
  };

  const analyzeGrammar = async () => {
    setIsAnalyzing(true);
    
    // Check if this is demo text
    const isDemoText = userText === demoTexts.grammar.incorrect;
    
    if (isDemoText) {
      // Demo mode - use hardcoded errors
      setTimeout(() => {
        const score = Math.max(0, 100 - (demoErrors.length * 10));
        
        setAnalysis({
          score,
          errors: demoErrors,
          isDemo: true,
          suggestions: [
            'Use proper contractions (I\'m, don\'t, etc.)',
            'Check subject-verb agreement',
            'Review possessive pronouns (its vs it\'s)',
            'Proofread for spelling errors'
          ]
        });
        
        setSuggestions(demoErrors);
        setIsAnalyzing(false);
        show('Demo analysis complete! Found ' + demoErrors.length + ' errors.', 'success');
      }, 1500);
      return;
    }
    
    // User text - check API key
    const keyStatus = validateApiKey(apiKey);
    setApiStatus(keyStatus);
    
    if (keyStatus === 'required') {
      // show('Please add your API key to analyze your text', 'warning');
      show('Please add your API key to analyze your text', 'error');
      setShowApiInput(true);
      setIsAnalyzing(false);
      return;
    }
    
    if (keyStatus === 'expired') {
      show('Your API token has expired. Please update your key.', 'error');
      setShowApiInput(true);
      setIsAnalyzing(false);
      return;
    }
    
    // Valid API key - call AI
    try {
      const aiErrors = await analyzeWithAI(userText);
      const score = Math.max(0, 100 - (aiErrors.length * 5));
      
      setAnalysis({
        score,
        errors: aiErrors,
        isDemo: false,
        suggestions: aiErrors.map(e => `Consider using "${e.suggestion}" instead of "${e.word}"`)
      });
      
      setSuggestions(aiErrors);
      show('AI analysis complete!', 'success');
    } catch (error) {
      show('Error analyzing text. Please try again.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeEssay = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const userWords = userText.toLowerCase().split(/\W+/);
      const expectedKeywords = demoTexts.essay.keywords;
      
      const matchedKeywords = expectedKeywords.filter(keyword =>
        userWords.some(word => word.includes(keyword.toLowerCase()))
      );
      
      const keywordScore = (matchedKeywords.length / expectedKeywords.length) * 30;
      const lengthScore = Math.min(30, (userText.length / 500) * 30);
      const structureScore = 40;
      
      const totalScore = Math.round(keywordScore + lengthScore + structureScore);
      
      const suggestionsList = [];
      
      if (matchedKeywords.length < expectedKeywords.length / 2) {
        suggestionsList.push('Try to include more topic-relevant keywords');
      }
      
      if (userText.length < 200) {
        suggestionsList.push('Your essay is quite short. Try to elaborate more.');
      }
      
      if (userText.length > 1000) {
        suggestionsList.push('Your essay is very long. Consider being more concise.');
      }
      
      setAnalysis({
        score: totalScore,
        keywords: {
          expected: expectedKeywords,
          matched: matchedKeywords,
          percentage: Math.round((matchedKeywords.length / expectedKeywords.length) * 100)
        },
        suggestions: suggestionsList.length > 0 ? suggestionsList : ['Great structure! Good use of paragraphs.', 'Clear introduction and conclusion.']
      });
      
      setIsAnalyzing(false);
      show('Essay analyzed! Score: ' + totalScore + '/100', 'success');
    }, 2000);
  };

  const handleAnalyze = () => {
    if (!userText.trim()) {
      show('Please enter some text to analyze', 'error');
      return;
    }
    
    if (writingMode === 'grammar') {
      analyzeGrammar();
    } else {
      analyzeEssay();
    }
  };

  const loadDemo = () => {
    setUserText(demoTexts.grammar.incorrect);
    setAnalysis(null);
    setSuggestions([]);
    setHighlightedRanges([]);
    show('Demo text loaded', 'info');
  };

  const clearText = () => {
    setUserText('');
    setAnalysis(null);
    setSuggestions([]);
    setHighlightedRanges([]);
    setApiStatus('');
  };

  const applySuggestion = (errorIndex) => {
    if (writingMode === 'grammar' && suggestions[errorIndex]) {
      const error = suggestions[errorIndex];
      
      // Replace the word in the text (first occurrence only)
      const regex = new RegExp(`\\b${error.word}\\b`);
      const newText = userText.replace(regex, error.suggestion);
      
      // Update text
      setUserText(newText);
      
      // Remove from suggestions
      const newSuggestions = suggestions.filter((_, index) => index !== errorIndex);
      setSuggestions(newSuggestions);
      
      // Update analysis
      if (analysis && analysis.errors) {
        const newErrors = analysis.errors.filter((_, index) => index !== errorIndex);
        setAnalysis({
          ...analysis,
          errors: newErrors,
          score: Math.max(0, 100 - (newErrors.length * 10))
        });
      }
      
      show(`Fixed: "${error.word}" → "${error.suggestion}"`, 'success');
    }
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      const status = validateApiKey(apiKey);
      setApiStatus(status);
      setShowApiInput(false);
      if (status === 'valid') {
        show('API key saved successfully', 'success');
      } else if (status === 'expired') {
        show('API key is invalid or expired', 'error');
      }
    }
  };

  // Function to render text with highlights (for preview)
  const renderHighlightedPreview = () => {
    if (!userText || highlightedRanges.length === 0) return null;
    
    let lastIndex = 0;
    const elements = [];
    
    highlightedRanges.sort((a, b) => a.start - b.start).forEach((range, idx) => {
      // Add text before highlight
      if (range.start > lastIndex) {
        elements.push(
          <span key={`text-${idx}`}>
            {userText.substring(lastIndex, range.start)}
          </span>
        );
      }
      
      // Add highlighted word
      elements.push(
        <span 
          key={`highlight-${idx}`}
          className={`error-highlight ${range.color}`}
          title={`Suggestion: ${range.suggestion}`}
        >
          {userText.substring(range.start, range.end)}
        </span>
      );
      
      lastIndex = range.end;
    });
    
    // Add remaining text
    if (lastIndex < userText.length) {
      elements.push(
        <span key="text-end">
          {userText.substring(lastIndex)}
        </span>
      );
    }
    
    return <div className="highlighted-preview">{elements}</div>;
  };

  if (!user) return null;

  return (
    <section className="page writing-page">
      <header className="page-header">
        <h2>Writing Practice</h2>
        <p>Improve your writing skills with grammar and style analysis</p>
        <div className="header-actions">
          <button 
            className="btn-back"
            onClick={() => navigate('/communication')}
          >
            ← Back
          </button>
          <button 
            className="btn-api"
            onClick={() => setShowApiInput(!showApiInput)}
          >
            🔑 {apiKey ? 'Change API Key' : 'Add API Key'}
          </button>
        </div>
      </header>

      {showApiInput && (
        <div className="api-input-container">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            className="api-input"
          />
          <button onClick={saveApiKey} className="btn-save-api">Save</button>
          <button onClick={() => setShowApiInput(false)} className="btn-cancel">Cancel</button>
          {apiStatus === 'expired' && (
            <p className="api-error">Token expired. Please update your key.</p>
          )}
        </div>
      )}

      <div className="writing-container">
        {/* Left Panel - Writing Area */}
        <div className="writing-panel">
          <div className="mode-selector">
            <button
              className={`mode-btn ${writingMode === 'grammar' ? 'active' : ''}`}
              onClick={() => setWritingMode('grammar')}
            >
              ✏️ Grammar Check
            </button>
            <button
              className={`mode-btn ${writingMode === 'essay' ? 'active' : ''}`}
              onClick={() => setWritingMode('essay')}
            >
              📝 Essay Writing
            </button>
          </div>

          {writingMode === 'essay' && (
            <div className="essay-prompt">
              <h4>Essay Prompt:</h4>
              <div className="prompt-card">
                <p>{demoTexts.essay.prompt}</p>
                <div className="prompt-keywords">
                  <span>Suggested keywords:</span>
                  <div className="keywords-list">
                    {demoTexts.essay.keywords.map((word, idx) => (
                      <span key={idx} className="keyword-tag">{word}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                if (e.target.value !== demoTexts.grammar.incorrect) {
                  setSuggestions([]);
                  setAnalysis(null);
                }
              }}
              placeholder={writingMode === 'grammar' 
                ? "Paste or type your text here for grammar checking..." 
                : "Write your essay here..."
              }
              className="writing-textarea"
              rows={12}
              style={{
                color: suggestions.length > 0 ? 'inherit' : 'inherit'
              }}
            />
            
            {/* Highlighted Preview */}
            {suggestions.length > 0 && (
              <div className="highlighted-container">
                <h4>Preview with Highlights:</h4>
                {renderHighlightedPreview()}
              </div>
            )}
            
            <div className="text-stats">
              <span>Words: {userText.trim().split(/\s+/).filter(Boolean).length}</span>
              <span>Characters: {userText.length}</span>
            </div>
            
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !userText.trim()}
              className="btn-primary analyze-btn"
            >
              {isAnalyzing ? '🔍 Analyzing...' : '✨ Analyze Text'}
            </button>
          </div>
        </div>

        {/* Right Panel - Analysis Results */}
        <div className="analysis-panel">
          <h3>Analysis Results</h3>
          
          {isAnalyzing ? (
            <div className="loading-analysis">
              <div className="spinner"></div>
              <p>Analyzing your text...</p>
            </div>
          ) : analysis ? (
            <div className="results-container">
              {/* Overall Score */}
              <div className="score-card">
                <div className="score-circle">
                  <span className="score-value">{analysis.score}</span>
                  <span className="score-label">/100</span>
                </div>
                <div className="score-details">
                  <h4>Overall Score</h4>
                  <p>{analysis.score >= 80 ? 'Excellent! 🎉' : 
                      analysis.score >= 60 ? 'Good! 👍' : 
                      'Needs improvement 💡'}</p>
                  {analysis.isDemo && (
                    <p className="demo-badge">📢 Demo Analysis</p>
                  )}
                </div>
              </div>

              {/* Errors List (for grammar mode) */}
              {writingMode === 'grammar' && analysis.errors && analysis.errors.length > 0 && (
                <div className="errors-section">
                  <h4>Found {analysis.errors.length} Error{analysis.errors.length !== 1 ? 's' : ''}</h4>
                  <div className="errors-list">
                    {analysis.errors.map((error, index) => (
                      <div key={index} className="error-item" style={{ borderLeftColor: error.color || 'red' }}>
                        <div className="error-header">
                          <span className="error-word" style={{ color: error.color || 'red' }}>"{error.word}"</span>
                          <span className="error-reason">→ {error.reason}</span>
                        </div>
                        <div className="error-suggestion">
                          <span>Suggestion: </span>
                          <strong>"{error.suggestion}"</strong>
                          <button 
                            onClick={() => applySuggestion(index)}
                            className="btn-small apply-btn"
                          >
                            Apply Fix
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keyword Analysis (for essay mode) */}
              {writingMode === 'essay' && analysis.keywords && (
                <div className="keywords-section">
                  <h4>Keyword Coverage</h4>
                  <div className="keywords-coverage">
                    <div className="coverage-bar">
                      <div 
                        className="coverage-fill"
                        style={{ width: `${analysis.keywords.percentage}%` }}
                      ></div>
                    </div>
                    <span>{analysis.keywords.percentage}% matched</span>
                  </div>
                  <div className="keywords-breakdown">
                    <div className="matched-keywords">
                      <h5>✅ Matched:</h5>
                      <div className="keywords-list">
                        {analysis.keywords.matched.map((word, idx) => (
                          <span key={idx} className="keyword-tag matched">{word}</span>
                        ))}
                      </div>
                    </div>
                    <div className="missing-keywords">
                      <h5>❌ Missing:</h5>
                      <div className="keywords-list">
                        {analysis.keywords.expected
                          .filter(word => !analysis.keywords.matched.includes(word))
                          .map((word, idx) => (
                            <span key={idx} className="keyword-tag missing">{word}</span>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="suggestions-section">
                <h4>💡 Suggestions for Improvement</h4>
                <ul className="suggestions-list">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={clearText}
                className="btn-secondary"
              >
                ↻ Try Another Text
              </button>
            </div>
          ) : (
            <div className="no-analysis">
              <div className="placeholder-icon">📝</div>
              <h4>No Analysis Yet</h4>
              <p>Write or paste some text and click "Analyze Text" to see results.</p>
              <div className="demo-tips">
                <p><strong>For Grammar Check:</strong> Click "Load Demo" to see demo analysis (no API key needed)</p>
                <p><strong>For Your Own Text:</strong> Add your API key above to analyze your writing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WritingPractice;