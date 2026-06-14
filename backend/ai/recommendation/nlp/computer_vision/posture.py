
import cv2
import numpy as np

def detect_posture(image_path):
   
    model = cv2.dnn.readNetFromTensorflow('pose_model.pb')
    image = cv2.imread(image_path)
   
    return "Good posture"  # or "Poor posture"
