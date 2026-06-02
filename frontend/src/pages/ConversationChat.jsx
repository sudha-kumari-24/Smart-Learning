import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ConversationChat.css';

// Predefined first messages for each scenario (no API call needed)
const FIRST_MESSAGES = {
    restaurant: "Welcome to our restaurant! What would you like to order today?",
    police: "Police station. How can I help you today?",
    ambulance: "Emergency services. What's your emergency?",
    friend: "Hey! How have you been? It's been a while!"
};

function ConversationChat() {
    const navigate = useNavigate();
    const location = useLocation();
    const chatRef = useRef(null);
    const scenarioId = new URLSearchParams(location.search).get('scenario') || 'restaurant';
    
    const [messages, setMessages] = useState([]);
    const [history, setHistory] = useState([]);
    const [turn, setTurn] = useState('ai');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [difficulty, setDifficulty] = useState(null);
    const [textInput, setTextInput] = useState('');
    const [conversationComplete, setConversationComplete] = useState(false);

    const addMessage = (role, text, extraClass = '') => {
        setMessages(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                role,
                text,
                extraClass,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    const speakAI = (text) => {
        if (!text || text.trim() === '') return;
        
        setTurn('ai');
        
        addMessage('ai', text);
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setTurn('user');
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setTurn('user');
        };
        
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const sendToAI = async (userMessage) => {
        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost:8004/api/conversation/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    scenario: scenarioId,
                    difficulty: difficulty,
                    history: history,
                    message: userMessage,
                    step: history.length / 2
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Show evaluation
                if (data.evaluation && data.evaluation.score) {
                    addMessage('evaluation', `⭐ Score: ${data.evaluation.score}/10 - ${data.evaluation.feedback}`, 'evaluation-bubble');
                    setTimeout(() => {
                        setMessages(prev => prev.filter(m => !(m.role === 'evaluation' && m.text.includes('Score'))));
                    }, 4000);
                }
                
                // Show hint if provided and not hard mode
                if (data.hint && difficulty !== 'hard') {
                    addMessage('hint', `💡 Hint: ${data.hint}`, 'hint-bubble');
                }
                
                // Check if conversation is complete
                if (data.is_complete) {
                    setConversationComplete(true);
                    setTurn('ended');
                    speakAI(data.ai_response);
                } else {
                    // Speak the AI response
                    speakAI(data.ai_response);
                    
                    // Update history
                    setHistory(prev => [...prev, 
                        { role: 'user', content: userMessage },
                        { role: 'assistant', content: data.ai_response }
                    ]);
                }
            } else {
                throw new Error(data.error || 'API error');
            }
        } catch (error) {
            console.error('API error:', error);
            addMessage('error', '⚠️ Connection issue. Please try again.', 'error-bubble');
            setTurn('user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserSubmit = (text) => {
        if (!text || !text.trim() || turn !== 'user' || conversationComplete || isLoading) return;
        
        addMessage('user', text.trim());
        setTurn('evaluating');
        setTextInput('');
        
        sendToAI(text.trim());
    };

    const startListening = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            addMessage('error', 'Speech recognition not supported', 'error-bubble');
            return;
        }
        
        if (isSpeaking || isListening || turn !== 'user' || conversationComplete || isLoading) return;
        
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = true;
        rec.continuous = true;
        
        let finalTranscript = '';
        let timeoutId = null;
        
        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        
        rec.onresult = (e) => {
            if (timeoutId) clearTimeout(timeoutId);
            
            for (let i = e.resultIndex; i < e.results.length; i++) {
                if (e.results[i].isFinal) {
                    finalTranscript += e.results[i][0].transcript + ' ';
                }
            }
            
            timeoutId = setTimeout(() => {
                if (finalTranscript.trim()) {
                    handleUserSubmit(finalTranscript.trim());
                    rec.stop();
                }
                timeoutId = null;
            }, 1500);
        };
        
        rec.onerror = (e) => {
            console.error('Speech error:', e);
            setIsListening(false);
            if (e.error !== 'no-speech') {
                addMessage('error', 'Microphone error. Please type.', 'error-bubble');
            }
        };
        
        rec.start();
    };

    const startConversation = (selectedDifficulty) => {
        setDifficulty(selectedDifficulty);
        
        // Add welcome message based on difficulty
        const welcomeMessages = {
            easy: "🌟 Easy Mode: I'll be very helpful. Speak naturally.",
            medium: "👋 Medium Mode: Let's have a natural conversation.",
            hard: "🎯 Hard Mode: Advanced level. Respond naturally."
        };
        addMessage('system', welcomeMessages[selectedDifficulty], 'system-bubble');
        
        // Get first message (predefined, no API call)
        const firstMessage = FIRST_MESSAGES[scenarioId] || FIRST_MESSAGES.restaurant;
        
        // Speak the first message immediately
        setTimeout(() => {
            speakAI(firstMessage);
            setHistory([{ role: 'assistant', content: firstMessage }]);
        }, 500);
    };

    useEffect(() => {
        chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [messages]);

    // Cleanup speech on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Difficulty selection screen
    if (!difficulty) {
        const scenarioTitles = {
            restaurant: '🍽️ Restaurant',
            police: '👮 Police Station',
            ambulance: '🚑 Emergency Call',
            friend: '👋 Friend Chat'
        };
        
        return (
            <section className="conversation-chat-page">
                <header className="chat-header">
                    <h2>{scenarioTitles[scenarioId] || 'Conversation'} Practice</h2>
                    <button className="btn-danger" onClick={() => navigate(-1)}>Exit</button>
                </header>
                <div className="difficulty-selector">
                    <div className="difficulty-card easy" onClick={() => startConversation('easy')}>
                        <div className="difficulty-icon">🌟</div>
                        <h3>Easy Mode</h3>
                        <p>Helpful hints • Forgiving evaluation • Guided conversation</p>
                    </div>
                    <div className="difficulty-card medium" onClick={() => startConversation('medium')}>
                        <div className="difficulty-icon">👍</div>
                        <h3>Medium Mode</h3>
                        <p>Natural conversation • Fair evaluation • Occasional hints</p>
                    </div>
                    <div className="difficulty-card hard" onClick={() => startConversation('hard')}>
                        <div className="difficulty-icon">🎯</div>
                        <h3>Hard Mode</h3>
                        <p>Minimal hints • Strict evaluation • Real challenge</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="conversation-chat-page">
            <header className="chat-header">
                <h2>{scenarioId.charAt(0).toUpperCase() + scenarioId.slice(1)} Conversation</h2>
                <div className="header-controls">
                    <span className={`difficulty-badge ${difficulty}`}>{difficulty.toUpperCase()}</span>
                    <button className="btn-danger" onClick={() => navigate(-1)}>Exit</button>
                </div>
            </header>

            <div className="chat-container">
                <div className="chat-messages" ref={chatRef}>
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-bubble ${msg.role} ${msg.extraClass}`}>
                            <div className="message-content">
                                <div className="message-avatar">
                                    {msg.role === 'ai' ? '🤖' : 
                                     msg.role === 'user' ? '👤' : 
                                     msg.role === 'evaluation' ? '📊' :
                                     msg.role === 'hint' ? '💡' : 
                                     msg.role === 'system' ? 'ℹ️' : 'ℹ️'}
                                </div>
                                <div>
                                    <p>{msg.text}</p>
                                    <span className="message-time">{msg.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="message-bubble ai loading">
                            <div className="message-content">
                                <div className="message-avatar">🤖</div>
                                <div>
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!conversationComplete && turn === 'user' && (
                    <div className="controls-panel">
                        <div className="voice-controls">
                            <button 
                                className={`btn-speak ${isListening ? 'listening' : ''}`}
                                onClick={startListening}
                                disabled={isSpeaking || isListening || isLoading}
                            >
                                🎤 {isListening ? 'Listening...' : 'Speak'}
                            </button>
                            
                            <div className="text-input-container">
                                <input
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleUserSubmit(textInput)}
                                    placeholder="Or type your response..."
                                    disabled={isLoading}
                                />
                                <button onClick={() => handleUserSubmit(textInput)} disabled={isLoading}>
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {conversationComplete && (
                    <div className="conversation-ended">
                        <div className="completed-icon">🎉</div>
                        <h3>Conversation Completed!</h3>
                        <p>Great job practicing your conversation skills!</p>
                        <div className="end-buttons">
                            <button onClick={() => navigate('/communication')}>Try Another Scenario</button>
                            <button onClick={() => window.location.reload()}>Practice Again</button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default ConversationChat;