def extract_landmark_coordinates(landmarks, image_shape=None):
    """Extract landmark coordinates with optional image scaling"""
    if not landmarks:
        return None
    
    coords = {}
    for idx, landmark in enumerate(landmarks.landmark):
        if image_shape:
            height, width = image_shape[:2]
            coords[idx] = {
                "x": int(landmark.x * width),
                "y": int(landmark.y * height),
                "z": landmark.z,
                "visibility": landmark.visibility
            }
        else:
            coords[idx] = {
                "x": landmark.x,
                "y": landmark.y,
                "z": landmark.z,
                "visibility": landmark.visibility
            }
    
    return coords

def get_key_landmarks(landmarks, indices=None):
    """Get specific landmarks by indices"""
    if not landmarks:
        return None
    
    if indices is None:
        # Default key landmarks for posture analysis
        indices = [0, 11, 12, 23, 24]  # Nose, shoulders, hips
    
    key_landmarks = {}
    for idx in indices:
        if idx < len(landmarks.landmark):
            key_landmarks[idx] = landmarks.landmark[idx]
    
    return key_landmarks