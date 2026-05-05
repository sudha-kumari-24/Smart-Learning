import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AISupport.css';

const AISupport = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [status, setStatus] = useState('Ready to help');
  const [showWelcome, setShowWelcome] = useState(true);

  const [isSending, setIsSending] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const recognitionRef = useRef(null);

  // Quick commands for suggestions
  const quickCommands = [
    { icon: '📚', text: 'How to study effectively?', command: 'How to study effectively?' },
    { icon: '💪', text: 'I need motivation', command: 'I need motivation' },
    { icon: '😰', text: 'Study stress help', command: 'I feel stressed about studying' },
    { icon: '📝', text: 'DSA tips', command: 'Tips for learning DSA' },
    { icon: '🐍', text: 'Python help', command: 'Help me with Python' },
    { icon: '🧘', text: 'Take a break', command: 'I need a break suggestion' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8001/socket.io/?EIO=4&transport=websocket');
    socketRef.current = socket;

    let messageQueue = [];
    let isConnected = false;

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setStatus('Connected');

      // Send initial ping to establish Socket.IO protocol
      socket.send('40');

      // Process queued messages
      isConnected = true;
      messageQueue.forEach(msg => socket.send(msg));
      messageQueue = [];
    };

    let lastResponseTime = 0;
    let lastResponseContent = '';

    socket.onmessage = (event) => {
      const data = event.data;

      if (typeof data === 'string') {
        if (data.startsWith('0')) {
          socket.send('40');
        } else if (data.startsWith('42')) {
          try {
            const parsed = JSON.parse(data.substring(2));
            const [eventName, eventData] = parsed;

            if (eventName === 'assistant_response') {
              const now = Date.now();
              // Ignore duplicate responses within 1 second
              if (eventData.content === lastResponseContent && (now - lastResponseTime) < 1000) {
                console.log('Duplicate response ignored');
                return;
              }

              lastResponseTime = now;
              lastResponseContent = eventData.content;

              setIsTyping(false);
              setIsSending(false);
              addMessage('assistant', eventData.content);

              if (eventData.should_open && eventData.url) {
                setTimeout(() => {
                  if (window.confirm(`Open ${eventData.url} for learning resources?`)) {
                    window.open(eventData.url, '_blank');
                  }
                }, 500);
              }
            } else if (eventName === 'connection_status') {
              setStatus(eventData.message);
            } else if (eventName === 'listening_status') {
              setStatus(eventData.message);
            }
          } catch (e) {
            console.error('Error parsing message:', e);
          }
        }
      }
    };
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      setStatus('Disconnected');
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setStatus('Disconnected');
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setStatus('🎤 Listening... Speak now');
      };

      let lastProcessedTime = 0;
      let lastProcessedText = '';

      let lastSentText = '';

      recognitionRef.current.onresult = (event) => {
        const result = event.results[0];

        if (!result.isFinal) return;

        const transcript = result[0].transcript.trim();

        // Avoid duplicates completely
        if (transcript === lastSentText) return;

        lastSentText = transcript;
        sendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error);
          setStatus('Error with voice recognition');
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setStatus('Ready to help');
      };
    }
  }, []);

  const addMessage = (sender, content) => {
    setMessages(prev => [...prev, { from: sender, text: content, timestamp: Date.now() }]);
    setShowWelcome(false);
  };



  const sendMessage = (text) => {
    if (!text.trim() || isSending) return;

    setIsSending(true);
    addMessage('user', text);
    setInput('');
    setIsTyping(true);

    // Send via WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const command = {
        command: text,
        timestamp: Date.now()
      };
      socketRef.current.send(`42["text_command", ${JSON.stringify(command)}]`);
    } else {
      addMessage('assistant', 'Sorry, I\'m having trouble connecting. Please check if the AI server is running.');
      setIsTyping(false);
    }

    // Reset sending flag after delay
    setTimeout(() => setIsSending(false), 1000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) {
      addMessage('assistant', 'Voice recognition is not supported in your browser. Please type your message.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const sendQuickCommand = (command) => {
    sendMessage(command);
  };

  const clearChat = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
      setShowWelcome(true);
    }
  };

  return (
    <section className="ai-support-page">
      {/* Sidebar */}
      <aside className="ai-sidebar">
        <div className="ai-sidebar-header">
          <div className="ai-logo">
            <span className="ai-logo-icon">🧠</span>
            <h2>StudyMate AI</h2>
          </div>
          <button className="ai-new-chat-btn" onClick={clearChat}>
            <span>+</span> New Chat
          </button>
        </div>

        <div className="ai-quick-questions">
          <h3>Quick Help</h3>
          <div className="ai-questions-list">
            {quickCommands.map((cmd, idx) => (
              <button
                key={idx}
                className="ai-question-item"
                onClick={() => sendQuickCommand(cmd.command)}
              >
                <span className="ai-question-icon">{cmd.icon}</span>
                <span className="ai-question-text">{cmd.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="ai-sidebar-footer">
          <div className="ai-status">
            <div className={`ai-status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span>{status}</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="ai-chat-area">
        {/* Header */}
        <header className="ai-chat-header">
          <button className="ai-sidebar-toggle" id="aiSidebarToggle">
            ☰
          </button>
          <div className="ai-chat-title">
            <h1>AI Study Assistant</h1>
            <div className="ai-status-indicator">
              <span>{status}</span>
              {isTyping && <span className="ai-typing-dot">...</span>}
            </div>
          </div>
          <div className="ai-header-actions">
            <button className="ai-action-btn" onClick={clearChat} title="Clear chat">
              🗑️
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="ai-chat-container" ref={chatMessagesRef}>
          {showWelcome && messages.length === 0 ? (
            <div className="ai-welcome-message">
              <div className="ai-welcome-content">
                <div className="ai-bot-avatar-large">🧠</div>
                <h2>Hello! I'm your StudyMate AI</h2>
                <p>Your personal AI study assistant. I can help you with:</p>
                <div className="ai-features-grid">
                  <div className="ai-feature">📚 Study techniques</div>
                  <div className="ai-feature">💡 Concept explanations</div>
                  <div className="ai-feature">🧘 Stress management</div>
                  <div className="ai-feature">💪 Motivation & tips</div>
                </div>
                <div className="ai-quick-suggestions">
                  <button className="ai-suggestion-btn" onClick={() => sendQuickCommand('How to study effectively?')}>
                    📖 Study tips
                  </button>
                  <button className="ai-suggestion-btn" onClick={() => sendQuickCommand('I need motivation')}>
                    💪 Motivation
                  </button>
                  <button className="ai-suggestion-btn" onClick={() => sendQuickCommand('Help with DSA')}>
                    💻 DSA help
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="ai-chat-messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`ai-message-item ${msg.from === 'user' ? 'user' : 'assistant'}`}
                >
                  <div className="ai-message-avatar">
                    {msg.from === 'user' ? '👤' : '🧠'}
                  </div>
                  <div className="ai-message-bubble">
                    <p>{msg.text}</p>
                    <span className="ai-message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="ai-message-item assistant">
                  <div className="ai-message-avatar">🧠</div>
                  <div className="ai-message-bubble ai-typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="ai-input-area">
          <div className="ai-input-container">
            <div className="ai-input-wrapper">
              <input
                type="text"
                placeholder="Type your study question here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend(e)}
              />
            </div>
            <button className="ai-send-btn" onClick={handleSend}>
              📤
            </button>
          </div>

          <div className="ai-voice-controls">
            <button
              className={`ai-voice-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleVoiceListening}
            >
              <span className="ai-voice-icon">🎤</span>
              <span>{isListening ? 'Stop Listening' : 'Click to Talk'}</span>
            </button>
            {isListening && (
              <div className="ai-voice-visualizer">
                <div className="ai-bar"></div>
                <div className="ai-bar"></div>
                <div className="ai-bar"></div>
                <div className="ai-bar"></div>
                <div className="ai-bar"></div>
              </div>
            )}
          </div>

          <div className="ai-quick-actions">
            {quickCommands.slice(0, 4).map((cmd, idx) => (
              <button
                key={idx}
                className="ai-quick-action-btn"
                onClick={() => sendQuickCommand(cmd.command)}
              >
                {cmd.icon} {cmd.text.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </main>
    </section>
  );
};

export default AISupport;