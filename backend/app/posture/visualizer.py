import cv2
import numpy as np
import mediapipe as mp

class SimpleVisualizer:
    def __init__(self):
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.mp_pose = mp.solutions.pose
        
    def draw_landmarks(self, image, landmarks):
        """Simply draw MediaPipe landmarks and connections"""
        if landmarks is None:
            return image
        
        # Draw the pose landmarks
        self.mp_drawing.draw_landmarks(
            image,
            landmarks,
            self.mp_pose.POSE_CONNECTIONS,
            landmark_drawing_spec=self.mp_drawing_styles.get_default_pose_landmarks_style()
        )
        return image
    
    def draw_simple_feedback(self, image, status, message):
        """Draw simple status text"""
        height, width = image.shape[:2]
        
        # Draw status box
        color = (0, 255, 0) if status == "correct" else (0, 0, 255)
        cv2.rectangle(image, (10, 10), (width - 10, 90), (0, 0, 0, 180), -1)
        cv2.rectangle(image, (10, 10), (width - 10, 90), color, 2)
        
        # Draw status text
        cv2.putText(image, f"Status: {status.upper()}", (20, 40),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
        
        # Draw message
        cv2.putText(image, message[:50], (20, 70),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        return image