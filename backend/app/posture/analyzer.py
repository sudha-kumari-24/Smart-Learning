class PoseAnalyzer:
    def __init__(self, exercise_type="study_default"):
        self.exercise_type = exercise_type
        self.set_exercise_rules(exercise_type)
    
    def set_exercise_rules(self, exercise_type):
        """Set analysis rules based on exercise type"""
        # Default study posture rules
        self.rules = {
            "neck_angle_max": 20,      # Maximum neck tilt in degrees
            "shoulder_diff_max": 8,     # Maximum shoulder difference
            "spine_straight_threshold": 15,  # Spine alignment threshold
            "head_forward_max": 0.1,    # Head forward position (normalized)
            "require_symmetry": True,   # Require body symmetry
        }
        
        # Exercise-specific adjustments
        exercise_adjustments = {
            "breathing": {"require_symmetry": False, "spine_straight_threshold": 20},
            "desk_stretch": {"neck_angle_max": 30, "require_symmetry": False},
            "neck_shoulder": {"neck_angle_max": 25, "shoulder_diff_max": 12},
            "eye_exercise": {"neck_angle_max": 15, "require_symmetry": True},
            "body_scan": {"require_symmetry": False, "spine_straight_threshold": 25},
        }
        
        if exercise_type in exercise_adjustments:
            self.rules.update(exercise_adjustments[exercise_type])
    
    def analyze(self, angles, landmarks):
        """Analyze pose based on angles and landmarks"""
        if not landmarks:
            return {"overall_status": "no_person", "issues": [], "corrections": []}
        
        lm = landmarks.landmark
        analysis = {
            "overall_status": "correct",
            "issues": [],
            "corrections": [],
            "spine_straight": True,
            "shoulders_level": True,
            "head_aligned": True,
            "hips_level": True,
        }
        
        # Check neck angle
        neck_angle = angles.get("neck", 0)
        if neck_angle > self.rules["neck_angle_max"]:
            analysis["issues"].append({
                "type": "neck_tilt",
                "severity": "high" if neck_angle > 30 else "medium",
                "value": neck_angle,
                "threshold": self.rules["neck_angle_max"],
                "message": f"Neck tilted {neck_angle:.1f}° (max: {self.rules['neck_angle_max']}°)"
            })
            analysis["head_aligned"] = False
        
        # Check shoulder alignment
        shoulder_diff = angles.get("shoulder", 0)
        if shoulder_diff > self.rules["shoulder_diff_max"]:
            analysis["issues"].append({
                "type": "uneven_shoulders",
                "severity": "medium",
                "value": shoulder_diff,
                "threshold": self.rules["shoulder_diff_max"],
                "message": f"Shoulders uneven by {shoulder_diff:.1f}°"
            })
            analysis["shoulders_level"] = False
        
        # Check spine alignment (simplified)
        if len(lm) > 24:
            # Calculate spine curvature
            nose_y = lm[0].y
            hip_y = (lm[23].y + lm[24].y) / 2
            
            if abs(nose_y - hip_y) > 0.3:  # Simplified threshold
                analysis["issues"].append({
                    "type": "spine_curvature",
                    "severity": "medium",
                    "message": "Spine not aligned properly"
                })
                analysis["spine_straight"] = False
        
        # Check head forward position
        if len(lm) > 12:
            # Simplified: check if head is too far forward relative to shoulders
            head_forward = lm[0].x - (lm[11].x + lm[12].x) / 2
            if abs(head_forward) > self.rules["head_forward_max"]:
                analysis["issues"].append({
                    "type": "head_forward",
                    "severity": "low",
                    "message": "Head is too far forward"
                })
        
        # Check hip alignment
        if len(lm) > 24:
            hip_diff = abs(lm[23].y - lm[24].y)
            if hip_diff > 0.05:  # 5% difference
                analysis["issues"].append({
                    "type": "uneven_hips",
                    "severity": "low",
                    "message": "Hips are not level"
                })
                analysis["hips_level"] = False
        
        # Determine overall status
        if any(issue["severity"] == "high" for issue in analysis["issues"]):
            analysis["overall_status"] = "incorrect"
        elif len(analysis["issues"]) > 2:
            analysis["overall_status"] = "incorrect"
        elif len(analysis["issues"]) > 0:
            analysis["overall_status"] = "warning"
        
        # Generate correction suggestions
        analysis["corrections"] = self.generate_corrections(analysis["issues"])
        
        return analysis
    
    def generate_corrections(self, issues):
        """Generate correction suggestions based on issues"""
        corrections = []
        
        for issue in issues:
            if issue["type"] == "neck_tilt":
                corrections.append("Keep your head straight and aligned with spine")
            elif issue["type"] == "uneven_shoulders":
                corrections.append("Relax and level your shoulders")
            elif issue["type"] == "spine_curvature":
                corrections.append("Sit up straight, align spine vertically")
            elif issue["type"] == "head_forward":
                corrections.append("Pull your head back over your shoulders")
            elif issue["type"] == "uneven_hips":
                corrections.append("Balance weight evenly on both hips")
        
        return corrections