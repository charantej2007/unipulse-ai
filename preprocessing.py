from pydantic import BaseModel
from typing import List, Optional

class StudentProfile(BaseModel):
    skills: List[str]
    interests: List[str]
    careerGoal: str
    educationLevel: str
    difficulty: Optional[str] = None

def construct_profile_text(profile: StudentProfile) -> str:
    """
    Constructs a text representation of the student profile for TF-IDF matching.
    """
    text_parts = [
        f"Goal: {profile.careerGoal}",
        f"Interests: {' '.join(profile.interests)}",
        f"Skills: {' '.join(profile.skills)}",
        f"Education: {profile.educationLevel}"
    ]
    if profile.difficulty:
        text_parts.append(f"Difficulty: {profile.difficulty}")
    
    return " ".join(text_parts)

def preprocess_text(text: str) -> str:
    """
    Basic text cleaning.
    """
    if not isinstance(text, str):
        return ""
    return text.lower().strip()
