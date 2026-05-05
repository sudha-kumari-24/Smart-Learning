import mediapipe as mp
import cv2
import numpy as np

class PostureDetector:
    def __init__(self, exercise_type="study_default"):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
        self.exercise_type = exercise_type
        
    def detect(self, frame, user_id=None):
        """Detect posture in frame"""
        try:
            # Convert to RGB
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = self.pose.process(rgb)
            
            if not result.pose_landmarks:
                return {
                    "status": "incorrect",
                    "message": "No person detected. Please position yourself in frame.",
                    "feedback": ["Make sure you're visible in camera"],
                    "angles": {"neck": 0, "shoulder": 0},
                    "score": 0,
                    "analysis": {"overall_status": "no_person"},
                    "landmarks": None
                }
            
            # Calculate simple angles
            angles = self.calculate_simple_angles(result.pose_landmarks)
            
            # Determine status based on angles
            neck_angle = angles.get("neck", 0)
            shoulder_diff = angles.get("shoulder", 0)
            
            if neck_angle < 15 and shoulder_diff < 5:
                status = "correct"
                message = "Excellent posture! Keep it up."
                score = 90
                feedback = ["Perfect alignment", "Keep your head straight"]
            elif neck_angle < 25 and shoulder_diff < 10:
                status = "correct"
                message = "Good posture"
                score = 75
                feedback = ["Minor adjustments possible", "Relax your shoulders"]
            else:
                status = "incorrect"
                message = "Please adjust your posture"
                score = 40
                feedback = [
                    f"Neck angle high: {neck_angle}°",
                    f"Shoulder uneven: {shoulder_diff}°",
                    "Straighten your spine",
                    "Level your shoulders"
                ]
            
            # Convert landmarks to JSON-serializable format
            serializable_landmarks = self.landmarks_to_dict(result.pose_landmarks)
            
            return {
                "status": status,
                "message": message,
                "feedback": feedback,
                "angles": angles,
                "score": score,
                "analysis": {"overall_status": status},
                "landmarks": serializable_landmarks,
                "raw_landmarks": result.pose_landmarks  # Keep for drawing
            }
            
        except Exception as e:
            print(f"❌ Detection error: {e}")
            return {
                "status": "error",
                "message": f"Detection error: {str(e)}",
                "feedback": [],
                "angles": {},
                "score": 0,
                "analysis": {"overall_status": "error"},
                "landmarks": None
            }
    
    def landmarks_to_dict(self, landmarks):
        """Convert MediaPipe landmarks to JSON-serializable dict"""
        if not landmarks:
            return None
        
        serializable = []
        for idx, landmark in enumerate(landmarks.landmark):
            serializable.append({
                "id": idx,
                "x": float(landmark.x),
                "y": float(landmark.y),
                "z": float(landmark.z),
                "visibility": float(landmark.visibility) if hasattr(landmark, 'visibility') else 0.0
            })
        return serializable
    
    def calculate_simple_angles(self, landmarks):
        """Calculate simple posture angles"""
        if not landmarks:
            return {"neck": 0, "shoulder": 0}
        
        lm = landmarks.landmark
        
        # Calculate neck angle (simplified)
        if len(lm) > 12:
            # Using nose and shoulders
            nose_y = lm[0].y
            left_shoulder_y = lm[11].y
            right_shoulder_y = lm[12].y
            
            # Simple neck tilt calculation
            neck_angle = abs((left_shoulder_y - right_shoulder_y) * 100)
            
            # Shoulder level difference
            shoulder_diff = abs(left_shoulder_y - right_shoulder_y) * 100
            
            return {
                "neck": round(neck_angle, 1),
                "shoulder": round(shoulder_diff, 1)
            }
        
        return {"neck": 0, "shoulder": 0}
    
    def release(self):
        """Cleanup"""
        self.pose.close()