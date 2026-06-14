from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import base64
import numpy as np
import json
from datetime import datetime
import mediapipe as mp



app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "Posture backend running", "port": 8000}

@app.websocket("/ws/posture")
async def posture_websocket(websocket: WebSocket):
    await websocket.accept()
    print("🟢 WebSocket CONNECTED")
    
    detector = None
    mp_drawing = None
    mp_pose = None
    
    try:
        # Send immediate response
        await websocket.send_json({
            "status": "connected",
            "message": "WebSocket connected successfully"
        })
        
        
        print("⏳ Waiting for config...")
        config_data = await websocket.receive_text()
        config = json.loads(config_data)
        exercise_type = config.get("exercise_type", "study_default")
        print(f"📝 Received config: {exercise_type}")
        
       
        await websocket.send_json({
            "status": "config_received",
            "config": config
        })
        
        # Initialize detector
        try:
            from app.posture.detector import PostureDetector
            detector = PostureDetector(exercise_type=exercise_type)
            print("✅ Detector initialized")
            
            # Initialize MediaPipe drawing
            mp_drawing = mp.solutions.drawing_utils
            mp_pose = mp.solutions.pose
            print("✅ MediaPipe drawing ready")
            
        except ImportError as e:
            print(f"❌ Could not import detector: {e}")
            detector = None
        
        # Send ready
        await websocket.send_json({
            "status": "ready",
            "message": f"Ready for {exercise_type} detection"
        })
        
        print("🎯 Ready for frames...")
        
        frame_count = 0
        while True:
            # Receive frame
            data = await websocket.receive_text()
            frame_count += 1
            
            # Check if it's JSON (shouldn't be after config)
            if data.startswith('{'):
                print("⚠️ Received JSON instead of image")
                continue
            
            try:
                # Fix base64 padding
                missing_padding = len(data) % 4
                if missing_padding:
                    data += '=' * (4 - missing_padding)
                
                # Decode image
                img_bytes = base64.b64decode(data)
                np_img = np.frombuffer(img_bytes, np.uint8)
                frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
                
                if frame is None:
                    print("❌ Failed to decode image")
                    await websocket.send_json({
                        "status": "error",
                        "message": "Failed to decode image"
                    })
                    continue
                
                if frame_count % 10 == 0:
                    print(f"🖼️ Frame {frame_count}: {frame.shape}")
                
                # Detect posture
                if detector:
                    result = detector.detect(frame)
                    
                   
                    if result.get("raw_landmarks") and mp_drawing:
                        annotated_frame = frame.copy()
                        height, width = annotated_frame.shape[:2]
                        
                       
                        mp_drawing.draw_landmarks(
                            annotated_frame,
                            result["raw_landmarks"],
                            mp_pose.POSE_CONNECTIONS,
                            landmark_drawing_spec=mp.solutions.drawing_styles.get_default_pose_landmarks_style()
                        )
                        
                     
                        overlay = annotated_frame.copy()
                        cv2.rectangle(overlay, (10, 10), (350, 200), (0, 0, 0, 180), -1)
                        cv2.addWeighted(overlay, 0.5, annotated_frame, 0.5, 0, annotated_frame)
                        
                       
                        status_color = (0, 255, 0) if result["status"] == "correct" else (0, 0, 255)
                        cv2.putText(annotated_frame, 
                                f"STATUS: {result['status'].upper()}", 
                                (20, 40),
                                cv2.FONT_HERSHEY_SIMPLEX, 
                                0.8, status_color, 2)
                        
                       
                        score_color = (0, 255, 0) if result.get("score", 0) > 70 else (0, 255, 255) if result.get("score", 0) > 50 else (0, 0, 255)
                        cv2.putText(annotated_frame, 
                                f"SCORE: {result.get('score', 0)}/100", 
                                (20, 70),
                                cv2.FONT_HERSHEY_SIMPLEX, 
                                0.7, score_color, 2)
                        
                       
                        if "angles" in result:
                            y_pos = 100
                            for angle_name, angle_value in result["angles"].items():
                                color = (0, 255, 0) if angle_value < 15 else (0, 0, 255)
                                cv2.putText(annotated_frame, 
                                        f"{angle_name.upper()}: {angle_value}°", 
                                        (20, y_pos),
                                        cv2.FONT_HERSHEY_SIMPLEX, 
                                        0.6, color, 2)
                                y_pos += 30
                        
                       
                        if result.get("landmarks"):
                            # Draw coordinate info on right side
                            cv2.rectangle(annotated_frame, (width - 220, 10), (width - 10, 150), (0, 0, 0, 180), -1)

                            cv2.rectangle(annotated_frame, (width - 220, 10), (width - 10, 150), (255, 255, 0), 1)
                            
                            cv2.putText(annotated_frame, 
                                    "COORDINATES:", 
                                    (width - 210, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 
                                    0.6, (255, 255, 0), 1)
                            
                           
                            key_points = [
                                (0, "Nose", (255, 255, 0)),
                                (11, "L.Sh", (0, 255, 255)),
                                (12, "R.Sh", (0, 255, 255)),
                                (23, "L.Hip", (255, 0, 255)),
                                (24, "R.Hip", (255, 0, 255))
                            ]
                            
                            coord_y = 55
                            for point_id, point_name, color in key_points:
                                if point_id < len(result["landmarks"]):
                                    lm = result["landmarks"][point_id]
                                    cv2.putText(annotated_frame,
                                            f"{point_name}: ({lm['x']:.2f}, {lm['y']:.2f})",
                                            (width - 210, coord_y),
                                            cv2.FONT_HERSHEY_SIMPLEX,
                                            0.4, color, 1)
                                    coord_y += 20
                        
                      
                        cv2.putText(annotated_frame,
                                f"Frame: {frame_count}",
                                (width - 100, height - 20),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                0.5, (200, 200, 200), 1)
                        
                        
                        _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                        result["visualized_frame"] = base64.b64encode(buffer).decode('utf-8')
                        
                        
                        result.pop("raw_landmarks", None)

                    await websocket.send_json(result)
                    
                else:
                   
                    await websocket.send_json({
                        "status": "correct",
                        "message": "Mock: Good posture!",
                        "feedback": ["Keep your back straight", "Relax shoulders"],
                        "angles": {"neck": 12, "shoulder": 5},
                        "score": 85,
                        "frame_count": frame_count
                    })
                
            except Exception as e:
                print(f"❌ Frame processing error: {e}")
                import traceback
                traceback.print_exc()
                await websocket.send_json({
                    "status": "error",
                    "message": f"Error: {str(e)[:100]}"
                })
    
    except WebSocketDisconnect:
        print("🔴 WebSocket DISCONNECTED")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
    finally:
        if detector:
            detector.release()
            
        print("🧹 Cleanup complete")