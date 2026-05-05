class FeedbackGenerator:
    def __init__(self):
        self.feedback_templates = {
            "study_default": {
                "correct": [
                    "Perfect study posture! Keep it up.",
                    "Excellent alignment for studying.",
                    "Great posture for focused work."
                ],
                "warning": [
                    "Good posture, minor adjustments needed.",
                    "Almost perfect, just a small tweak.",
                    "Decent posture, could be better."
                ],
                "incorrect": [
                    "Please adjust your posture for better study habits.",
                    "Your posture needs correction for optimal studying.",
                    "Let's fix your posture for better focus."
                ]
            },
            "breathing": {
                "correct": [
                    "Perfect breathing posture! Deep breaths now.",
                    "Excellent alignment for breathing exercises.",
                    "Great posture for relaxation."
                ],
                "incorrect": [
                    "Relax your shoulders for better breathing.",
                    "Straighten your spine to allow full lung expansion."
                ]
            },
            # Add more exercise types as needed
        }
    
    def generate(self, analysis, exercise_type="study_default"):
        """Generate feedback based on analysis"""
        status = analysis.get("overall_status", "incorrect")
        issues = analysis.get("issues", [])
        corrections = analysis.get("corrections", [])
        
        # Get appropriate template
        templates = self.feedback_templates.get(exercise_type, self.feedback_templates["study_default"])
        
        # Select primary message
        if status == "correct" and templates.get("correct"):
            primary_message = self.select_random(templates["correct"])
        elif status == "warning" and templates.get("warning"):
            primary_message = self.select_random(templates["warning"])
        elif templates.get("incorrect"):
            primary_message = self.select_random(templates["incorrect"])
        else:
            primary_message = "Please adjust your posture."
        
        # Generate detailed feedback
        detailed_feedback = []
        
        if issues:
            # Add issue-based feedback
            for issue in issues[:3]:  # Max 3 issues
                detailed_feedback.append(issue.get("message", "Posture issue detected"))
        
        if corrections:
            # Add correction suggestions
            for correction in corrections[:3]:  # Max 3 corrections
                detailed_feedback.append(correction)
        
        # If no specific feedback, add general tips
        if not detailed_feedback:
            if status == "correct":
                detailed_feedback.append("Maintain this posture for best results")
            else:
                detailed_feedback.append("Check your alignment and try again")
        
        return {
            "primary_message": primary_message,
            "detailed_feedback": detailed_feedback,
            "status": status,
            "issue_count": len(issues)
        }
    
    def select_random(self, items):
        """Select random item from list"""
        import random
        return random.choice(items) if items else ""