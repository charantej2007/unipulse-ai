import os
import google.generativeai as genai
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv(override=True)

class RoadmapRequest(BaseModel):
    career_goal: str
    skills: List[str]
    interests: List[str]
    education_level: str
    duration: Optional[str] = "6 months"

class RoadmapGenerator:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("Warning: GEMINI_API_KEY not found in environment variables.")
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')

    def generate_roadmap(self, profile: RoadmapRequest) -> str:
        print(f"Generating roadmap for: {profile.career_goal}")
        env_key = os.getenv("GEMINI_API_KEY")
        print(f"API Key present: {bool(env_key)}")
        
        if not self.model:
            print("Model not initialized (missing key)")
            return "Error: Gemini API key not configured. Please provide an API key to generate a roadmap."

        prompt = f"""
        Act as an expert career counselor and curriculum designer.
        Create a detailed {profile.duration} learning roadmap for a student aspiring to become a {profile.career_goal}.
        
        Student Profile:
        - Current Education: {profile.education_level}
        - Existing Skills: {', '.join(profile.skills)}
        - Interests: {', '.join(profile.interests)}
        
        RETURN JSON ONLY. The output must be a valid JSON object with the following structure:
        {{
            "roadmap": [
                {{
                    "phase": "Phase Name (e.g., Month 1-2: Foundations)",
                    "goal": "Main goal of this phase",
                    "concepts": ["Concept 1", "Concept 2"],
                    "projects": ["Project 1", "Project 2"],
                    "resources": [
                        {{
                            "title": "Resource Name",
                            "type": "Video/Article/Course",
                            "url": "Valid URL to the resource (e.g., official docs, coursera course)"
                        }}
                    ]
                }}
            ],
            "career_launch": {{
                "tips": ["Tip 1", "Tip 2"],
                "portfolio_ideas": ["Idea 1"]
            }}
        }}
        Do not include markdown formatting like ```json ... ```. Just the raw JSON string.
        """

        try:
            # Simple exponential backoff retry
            max_retries = 6
            base_delay = 5
            
            for attempt in range(max_retries):
                try:
                    response = self.model.generate_content(prompt)
                    text = response.text
                    # Clean up potential markdown formatting
                    if text.startswith("```json"):
                        text = text.replace("```json", "").replace("```", "")
                    elif text.startswith("```"):
                         text = text.replace("```", "")
                    return text.strip()
                except Exception as e:
                    error_str = str(e)
                    if "429" in error_str and attempt < max_retries - 1:
                        import time
                        import random
                        # Calculate delay: base * 2^attempt + jitter
                        # 5, 10, 20, 40, 80...
                        delay = (base_delay * (2 ** attempt)) + (random.random() * 0.5)
                        print(f"Rate limit hit. Retrying in {delay:.2f}s... (Attempt {attempt + 1}/{max_retries})")
                        time.sleep(delay)
                        continue
                    else:
                        raise e
                        
        except Exception as e:
            return f"Error generating roadmap after retries: {str(e)}"
