import math

def calculate_angle(a, b, c):
    """Calculate angle at point b formed by points a-b-c"""
    # Convert to radians for atan2
    ang = math.degrees(
        math.atan2(c[1] - b[1], c[0] - b[0]) -
        math.atan2(a[1] - b[1], a[0] - b[0])
    )
    return abs(ang) if ang >= 0 else abs(ang + 360)

def calculate_posture_angles(landmarks):
    """Calculate key posture angles from landmarks"""
    if not landmarks or len(landmarks.landmark) < 13:
        return {"neck": 0, "shoulder": 0}
    
    lm = landmarks.landmark
    
    # Neck angle (nose-left_shoulder-right_shoulder)
    nose = (lm[0].x, lm[0].y)
    left_shoulder = (lm[11].x, lm[11].y)
    right_shoulder = (lm[12].x, lm[12].y)
    
    neck_angle = calculate_angle(nose, left_shoulder, right_shoulder)
    
    # Shoulder level difference (vertical difference)
    shoulder_diff = abs(left_shoulder[1] - right_shoulder[1]) * 100
    
    # Additional angles can be added here:
    # - Spine angle
    # - Hip angle
    # - Knee angle
    
    return {
        "neck": round(neck_angle, 2),
        "shoulder": round(shoulder_diff, 2),
        "spine": 180  # Placeholder, can be calculated from hip-shoulder alignment
    }