import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ConversationChat.css';

/* =======================
   SCENARIOS (LONG & NATURAL)
======================= */

const scenarios = {
    restaurant: {
        title: 'Restaurant Conversation',
        script: [
            {
                ai: 'Welcome to our restaurant! How can I help you today?',
                expected: 'I would like to see the menu, please.',
                keywords: ['menu', 'please']
            },
            {
                ai: 'Certainly! Would you like to start with something to drink?',
                expected: 'Yes, I would like a glass of water.',
                keywords: ['water']
            },
            {
                ai: 'Great choice. Are you ready to order food or would you like some time?',
                expected: 'I need a little more time, thank you.',
                keywords: ['time', 'thank']
            },
            {
                ai: 'No problem. Our special today is pasta with garlic bread.',
                expected: 'That sounds good, I will have the pasta.',
                keywords: ['pasta']
            },
            {
                ai: 'Excellent choice! Would you like anything else?',
                expected: 'No, that will be all for now.',
                keywords: ['no', 'all']
            }
        ]
    },

    police: {
        title: 'Police Station Conversation',
        script: [
            {
                ai: 'Police station. How can I help you?',
                expected: 'I want to report a stolen phone.',
                keywords: ['report', 'stolen', 'phone']
            },
            {
                ai: 'When did this incident happen?',
                expected: 'It happened last night.',
                keywords: ['last', 'night']
            },
            {
                ai: 'Can you tell me where it happened?',
                expected: 'It happened near the bus stop.',
                keywords: ['bus', 'stop']
            },
            {
                ai: 'Do you have any identification?',
                expected: 'Yes, I have my ID with me.',
                keywords: ['id']
            }
        ]
    },

    ambulance: {
        title: 'Emergency Ambulance Call',
        script: [
            {
                ai: 'Emergency services. What is your emergency?',
                expected: 'Someone is unconscious and needs help.',
                keywords: ['unconscious', 'help']
            },
            {
                ai: 'Please tell me your location.',
                expected: 'We are at 45 Park Street.',
                keywords: ['park', 'street']
            },
            {
                ai: 'Is the person breathing?',
                expected: 'Yes, but breathing very slowly.',
                keywords: ['breathing', 'slowly']
            },
            {
                ai: 'An ambulance is on the way. Please stay calm.',
                expected: 'Okay, thank you.',
                keywords: ['thank']
            }
        ]
    },

    friend: {
        title: 'Talking With a Friend',
        script: [
            {
                ai: 'Hey! It’s been a while. How are you doing?',
                expected: 'I am doing well, just busy with work.',
                keywords: ['well', 'busy']
            },
            {
                ai: 'Same here. Did you watch the match yesterday?',
                expected: 'No, I missed it. Who won?',
                keywords: ['missed', 'won']
            },
            {
                ai: 'Our team won! It was a great match.',
                expected: 'That’s awesome! We should meet soon.',
                keywords: ['awesome', 'meet']
            }
        ]
    }
};

/* =======================
   COMPONENT
======================= */

export default function ConversationChat() {
    const navigate = useNavigate();
    const location = useLocation();
    const chatRef = useRef(null);
    const startedRef = useRef(false);

    const scenarioId =
        new URLSearchParams(location.search).get('scenario') || 'restaurant';
    const scenario = scenarios[scenarioId];

    const [messages, setMessages] = useState([]);
    const [step, setStep] = useState(0);
    const [turn, setTurn] = useState('ai'); // ai | user | evaluating | ended
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [textInput, setTextInput] = useState('');

    /* =======================
       HELPERS
    ======================= */

    const addMessage = (role, text, extraClass = '') => {
        setMessages(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                role,
                text,
                extraClass,
                time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }
        ]);
    };

    /* =======================
       AI SPEAKING
    ======================= */

    const speakAI = (text) => {
        setTurn('ai');
        setShowHint(false);

        setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === 'ai' && last.text === text) return prev;
            return [...prev, {
                id: crypto.randomUUID(),
                role: 'ai',
                text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }];
        });

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setTurn('user');
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };


    const speakHint = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };



    /* =======================
       INIT (SAFE)
    ======================= */

    useEffect(() => {
        if (startedRef.current) return;
        startedRef.current = true;

        speakAI(scenario.script[0].ai);
    }, [scenario]);

    useEffect(() => {
        chatRef.current?.scrollTo({
            top: chatRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [messages]);

    /* =======================
       RESPONSE ANALYSIS
    ======================= */

    const analyzeResponse = (text) => {
        const expected = scenario.script[step];
        const words = text.toLowerCase().split(/\W+/);

        const matches = expected.keywords.filter(k =>
            words.some(w => w.includes(k))
        ).length;

        const percent = (matches / expected.keywords.length) * 100;

        if (percent >= 80) {
            addMessage('feedback', '✅ Good response!', 'success');
            goNext();
        } else if (percent >= 50) {
            addMessage('feedback', '⚠️ Almost correct. Try again.', 'warning');
            repeatStep('Try answering more clearly.');
        } else {
            addMessage('feedback', '❌ Please repeat your answer.', 'error');
            repeatStep('Listen and try again.');
        }
    };

    const repeatStep = (aiLine) => {
        setTimeout(() => speakAI(aiLine), 1000);
    };

    const goNext = () => {
        setTimeout(() => {
            if (step + 1 < scenario.script.length) {
                setStep(s => s + 1);
                speakAI(scenario.script[step + 1].ai);
            } else {
                setTurn('ended');
                addMessage('ai', '🎉 Conversation completed! Great job!');
            }
        }, 1200);
    };

    const handleUserSubmit = (text) => {
        if (!text || turn !== 'user') return;
        addMessage('user', text);
        setTurn('evaluating');
        analyzeResponse(text);
    };

    /* =======================
       SPEECH RECOGNITION
    ======================= */

    // const startListening = () => {
    //     const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    //     if (!SR) return;

    //     const rec = new SR();
    //     rec.lang = 'en-US';

    //     rec.onstart = () => setIsListening(true);
    //     rec.onend = () => setIsListening(false);
    //     rec.onresult = e => handleUserSubmit(e.results[0][0].transcript);

    //     rec.start();
    // };


   const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
        alert('Speech recognition not supported in this browser');
        return;
    }

    // Don't start if already speaking or listening
    if (isSpeaking || isListening || turn !== 'user') return;

    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true; // Show interim results but don't process them
    rec.continuous = true; // Keep listening until user pauses
    rec.maxAlternatives = 1;

    let finalTranscript = '';
    let timeoutId = null;

    rec.onstart = () => {
        console.log('Listening started...');
        setIsListening(true);
        finalTranscript = '';
        
        // Optional: Show listening indicator with instruction
        // addMessage('feedback', '🎤 Listening... Speak your full sentence', 'info');
    };
    
    rec.onend = () => {
        console.log('Listening ended');
        setIsListening(false);
        
        // Process final transcript if we have one and it hasn't been processed yet
        if (finalTranscript.trim() && !timeoutId) {
            handleUserSubmit(finalTranscript.trim());
        }
    };
    
    rec.onresult = e => {
        // Clear previous timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        let interimTranscript = '';
        
        // Process all results
        for (let i = e.resultIndex; i < e.results.length; i++) {
            const transcript = e.results[i][0].transcript;
            
            if (e.results[i].isFinal) {
                // Add to final transcript with space
                finalTranscript += transcript + ' ';
            } else {
                // This is interim (partial) result
                interimTranscript += transcript;
            }
        }

        // Show interim results (optional - for visual feedback)
        if (interimTranscript) {
            console.log('Still listening:', interimTranscript);
            // You could show this in a temporary UI element
        }

        // Set a timeout to process after user stops speaking
        // The timeout resets every time new speech is detected
        timeoutId = setTimeout(() => {
            if (finalTranscript.trim()) {
                console.log('Processing final transcript:', finalTranscript);
                handleUserSubmit(finalTranscript.trim());
                finalTranscript = '';
                rec.stop(); // Stop listening after processing
            }
            timeoutId = null;
        }, 1500); // Wait 1.5 seconds after speech ends
    };
    
    rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
        
        // Show user-friendly error message
        if (e.error === 'no-speech') {
            addMessage('feedback', 'No speech detected. Please try again.', 'warning');
        } else if (e.error === 'audio-capture') {
            addMessage('feedback', 'Microphone not available.', 'error');
        } else if (e.error === 'not-allowed') {
            addMessage('feedback', 'Microphone permission denied.', 'error');
        } else {
            addMessage('feedback', 'Speech recognition error. Please try typing.', 'error');
        }
    };

    try {
        rec.start();
    } catch (error) {
        console.error('Failed to start recognition:', error);
        setIsListening(false);
    }
};

    /* =======================
       UI
    ======================= */

    return (
        <section className="conversation-chat-page">
            <header className="chat-header">
                <h2>{scenario.title}</h2>
                <button className="btn-danger" onClick={() => navigate(-1)}>Exit</button>
            </header>

            <div className="chat-container">
                <div className="chat-messages" ref={chatRef}>
                    {messages.map(m => (
                        <div key={m.id} className={`message-bubble ${m.role} ${m.extraClass}`}>
                            <div className="message-content">
                                <div className="message-avatar">
                                    {m.role === 'ai' ? '🤖' : m.role === 'user' ? '🧑' : 'ℹ️'}
                                </div>
                                <div>
                                    <p>{m.text}</p>
                                    <span className="message-time">{m.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {turn === 'user' && (
                    <div className="controls-panel">
                        <button onClick={() => setShowHint(!showHint)}>💡 Hint</button>
                        {showHint && (
                            <div className="full-hint">
                                <div className="hint-text">
                                    {scenario.script[step].expected}
                                </div>

                                <button
                                    className="hint-speaker"
                                    onClick={() => speakHint(scenario.script[step].expected)}
                                    title="Listen to hint"
                                >
                                    🔊
                                </button>
                            </div>
                        )}


                        <button
                            className={`btn-speak ${isListening ? 'listening' : ''}`}
                            onClick={startListening}
                            disabled={isSpeaking || isListening}
                        >
                            🎤 Speak
                        </button>

                        <div className="text-input-container">
                            <input
                                value={textInput}
                                onChange={e => setTextInput(e.target.value)}
                                placeholder="Type your response"
                            />
                            <button onClick={() => {
                                handleUserSubmit(textInput);
                                setTextInput('');
                            }}>
                                Send
                            </button>
                        </div>
                    </div>
                )}

                {turn === 'ended' && (
                    <div className="conversation-ended">
                        <h3>Conversation Completed 🎉</h3>
                        <button onClick={() => navigate(-1)}>Go Back</button>
                    </div>
                )}
            </div>
        </section>
    );
}
