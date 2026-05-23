import csv
import os

class JobRecommender:
    def __init__(self, data_path="jobs/job_roles.csv"):
        # Handle both root and backend directory execution contexts
        if not os.path.exists(data_path):
            data_path = os.path.join("backend", data_path)
            
        self.job_roles = []
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    self.job_roles.append({
                        "role_name": row["role_name"],
                        "required_skills": [s.strip() for s in row["required_skills"].split('|') if s.strip()],
                        "job_type": row["job_type"],
                        "difficulty_level": row["difficulty_level"],
                        "portal_links": [link.strip() for link in row["portal_links"].split('|') if link.strip()]
                    })
        else:
            print(f"Warning: {data_path} not found.")

    def calculate_readiness(self, student_skills, career_goal=None):
        results = []
        student_skills_lower = set(s.lower() for s in student_skills)
        
        for job in self.job_roles:
            required_skills = job["required_skills"]
            if not required_skills:
                continue
                
            required_skills_lower = set(s.lower() for s in required_skills)
            matched_skills = student_skills_lower.intersection(required_skills_lower)
            missing_skills = list(required_skills_lower - student_skills_lower)
            
            # Map back to original case for missing skills display
            missing_skills_original = [s for s in required_skills if s.lower() in missing_skills]
            
            readiness_score = int((len(matched_skills) / len(required_skills)) * 100)
            
            # Determine recommendation based on score
            if readiness_score >= 80:
                recommendation = "Highly Recommended to Apply"
            elif readiness_score >= 60:
                recommendation = "Apply After Minor Skill Improvement"
            else:
                recommendation = "Upskill Before Applying"
                
            results.append({
                "role_name": job["role_name"],
                "job_type": job["job_type"],
                "readiness_score": readiness_score,
                "recommendation": recommendation,
                "missing_skills": missing_skills_original,
                "portal_links": job["portal_links"]
            })
            
        # Sort by readiness score descending
        results.sort(key=lambda x: x["readiness_score"], reverse=True)
        
        # If career goal is provided, sort matches for that goal higher
        if career_goal:
            goal_lower = career_goal.lower()
            results.sort(key=lambda x: 1 if goal_lower in x["role_name"].lower() else 2)
            
        return results

    def get_all_role_names(self) -> list[str]:
        """Return a simple list of all job role names available."""
        return [job["role_name"] for job in self.job_roles]
        
    def get_required_skills_for_role(self, role_name: str) -> list[str]:
        """Return the list of required skills for a specific role name."""
        for job in self.job_roles:
            if job["role_name"].lower() == role_name.lower():
                return job["required_skills"]
        return []
