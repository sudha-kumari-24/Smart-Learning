import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import speech_recognition as sr
import time
import threading
from ai_support_service import AISupportService
from gtts import gTTS
from pygame import mixer
import pyttsx3

app = Flask(__name__)
app.config['SECRET_KEY'] = 'ai_support_secret_2024'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

ai_service = AISupportService()

# Global variables
is_listening = False
recognizer = sr.Recognizer()
is_processing = False

# Initialize mixer for TTS
if not mixer.get_init():
    try:
        mixer.init(frequency=22050)
    except:
        mixer.init()


def speak_text(text):
    """Convert text to speech"""
    try:
        os.makedirs(os.path.join(os.path.dirname(__file__), "temp_audio_ai"), exist_ok=True)
        tts = gTTS(text=text, lang='en', slow=False)
        audio_file = os.path.join(os.path.dirname(__file__), "temp_audio_ai/response.mp3")
        tts.save(audio_file)
        
        time.sleep(0.3)
        
        if mixer.music.get_busy():
            mixer.music.stop()
        
        mixer.music.load(audio_file)
        mixer.music.set_volume(0.8)
        mixer.music.play()
        
        while mixer.music.get_busy():
            time.sleep(0.1)
    except Exception as e:
        print(f"TTS Error: {e}")
        try:
            engine = pyttsx3.init()
            engine.say(text)
            engine.runAndWait()
        except:
            pass

@socketio.on('connect')
def handle_connect():
    print('Client connected to AI Support')
    emit('connection_status', {'status': 'connected', 'message': 'AI Study Assistant is ready!'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected from AI Support')
    global is_listening
    is_listening = False

@socketio.on('text_command')
def handle_text_command(data):
    global is_processing
    
    if is_processing:
        print("Already processing, ignoring duplicate")
        return
    
    is_processing = True
    
    command = data.get('command', '')
    if command:
        print(f"Processing text command: {command}")
        result = ai_service.get_websocket_response(command)
        
        emit('assistant_response', {
            'type': 'text',
            'content': result['response'],
            'should_open': result.get('should_open', False),
            'url': result.get('url'),
            'timestamp': result['timestamp']
        })
        
        threading.Thread(target=speak_text, args=(result['response'],), daemon=True).start()
    
    # Reset flag after delay
    threading.Timer(1.0, lambda: set_processing_false()).start()

def set_processing_false():
    global is_processing
    is_processing = False



@socketio.on('start_listening')
def handle_start_listening():
    global is_listening
    if not is_listening:
        is_listening = True
        emit('listening_status', {'status': 'active', 'message': '🎤 Listening...'})
        threading.Thread(target=voice_recognition_loop, daemon=True).start()

@socketio.on('stop_listening')
def handle_stop_listening():
    global is_listening
    is_listening = False
    emit('listening_status', {'status': 'inactive', 'message': 'Listening stopped'})


def voice_recognition_loop():
    global is_listening, recognizer
    
    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source, duration=1)
        recognizer.dynamic_energy_threshold = True
        recognizer.pause_threshold = 0.8
        
        while is_listening:
            try:
                socketio.emit('listening_status', {'status': 'processing', 'message': '🔊 Speak now...'})
                
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=8)
                text = recognizer.recognize_google(audio)
                
                # Stop listening after getting input - NO 'global' here, already declared at top
                is_listening = False
                socketio.emit('listening_status', {'status': 'inactive', 'message': 'Processing...'})
                
                # Process the command
                result = ai_service.get_websocket_response(text)
                
                socketio.emit('assistant_response', {
                    'type': 'voice',
                    'content': result['response'],
                    'should_open': result.get('should_open', False),
                    'url': result.get('url'),
                    'timestamp': time.time()
                })
                
                threading.Thread(target=speak_text, args=(result['response'],), daemon=True).start()
                break  # Exit the loop after processing
                
            except sr.WaitTimeoutError:
                continue
            except sr.UnknownValueError:
                socketio.emit('assistant_response', {
                    'type': 'info',
                    'content': "I didn't catch that. Please speak clearly or type your message.",
                    'timestamp': time.time()
                })
                break
            except sr.RequestError as e:
                socketio.emit('assistant_response', {
                    'type': 'error',
                    'content': "Speech recognition error. Please check your connection or type your message.",
                    'timestamp': time.time()
                })
                break
            except Exception as e:
                print(f"Voice recognition error: {e}")
                break
            

@socketio.on('stop_speaking')
def handle_stop_speaking():
    try:
        if mixer.music.get_busy():
            mixer.music.stop()
    except:
        pass

if __name__ == '__main__':
    print("🚀 AI Support Server running on port 8001...")
    socketio.run(app, debug=True, host='0.0.0.0', port=8001)