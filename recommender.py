import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any
from preprocessing import StudentProfile, construct_profile_text, preprocess_text

class CourseRecommender:
    def __init__(self, data_path: str = "backend/data/courses.csv"):
        self.data_path = data_path
        self.df = None
        self.tfidf_matrix = None
        self.vectorizer = None
        self._load_data()
        self._train_model()
        
        # Standard Career-to-Skill probability mapping
        self.career_skill_weights = {
            "Data Scientist": {"Python": 0.3, "Statistics": 0.3, "Machine Learning": 0.4},
            "Machine Learning Engineer": {"Python": 0.3, "Machine Learning": 0.5, "Deep Learning": 0.2},
            "Data Analyst": {"SQL": 0.4, "Excel": 0.3, "Statistics": 0.3},
            "Software Developer": {"Algorithms": 0.3, "Data Structures": 0.3, "Java": 0.2, "Python": 0.2},
            "Web Developer": {"HTML": 0.2, "CSS": 0.2, "React": 0.3, "Node": 0.3},
            "Cloud Engineer": {"AWS": 0.4, "Azure": 0.3, "Linux": 0.3},
            "Cybersecurity Analyst": {"Cryptography": 0.4, "Networking": 0.3, "Ethical Hacking": 0.3},
            "Database Administrator": {"SQL": 0.5, "Normalization": 0.3, "NoSQL": 0.2}
        }

    def _load_data(self):
        try:
            self.df = pd.read_csv(self.data_path)
            # Fill NaN values
            self.df = self.df.fillna("")
            
            # Create a combined features column for the courses
            self.df['combined_features'] = self.df.apply(
                lambda x: f"{x['name']} {x['difficulty']} {x['skills'].replace('|', ' ')} {x['domain']} {x['careerPaths'].replace('|', ' ')} {x['description']}",
                axis=1
            )
            # Preprocess
            self.df['combined_features'] = self.df['combined_features'].apply(preprocess_text)
            
        except FileNotFoundError:
            print(f"Error: Data file not found at {self.data_path}")
            self.df = pd.DataFrame()

    def _train_model(self):
        if self.df is not None and not self.df.empty:
            self.vectorizer = TfidfVectorizer(stop_words='english')
            self.tfidf_matrix = self.vectorizer.fit_transform(self.df['combined_features'])

    def recommend(self, profile: StudentProfile, top_n: int = 5) -> List[Dict[str, Any]]:
        if self.df is None or self.df.empty:
            return []

        # Construct profile text
        profile_text = construct_profile_text(profile)
        profile_text = preprocess_text(profile_text)

        # Vectorize profile
        profile_vector = self.vectorizer.transform([profile_text])

        # Calculate cosine similarity
        similarity_scores = cosine_similarity(profile_vector, self.tfidf_matrix).flatten()

        # Get top indices
        top_indices = similarity_scores.argsort()[::-1][:top_n]

        recommendations = []
        for idx in top_indices:
            score = similarity_scores[idx]
            if score > 0.05: # Threshold
                course = self.df.iloc[idx].to_dict()
                
                # Calculate Explainable AI Feature (skill contribution)
                # We need the element-wise multiplication of profile and course TF-IDF vectors
                # to see which terms contributed the most to the cosine similarity
                course_vector = self.tfidf_matrix[idx]
                
                # Element-wise product of sparse matrices
                overlap = profile_vector.multiply(course_vector)
                
                skill_contribution = []
                if overlap.nnz > 0:
                    # Get indices of non-zero elements
                    cx = overlap.tocoo()
                    # Map indices back to feature names (words)
                    feature_names = self.vectorizer.get_feature_names_out()
                    
                    # Store (word, weight)
                    contributions = []
                    total_weight = 0.0
                    for _, j, v in zip(cx.row, cx.col, cx.data):
                        word = feature_names[j]
                        contributions.append((word, v))
                        total_weight += v
                    
                    # Sort by weight descending
                    contributions.sort(key=lambda x: x[1], reverse=True)
                    
                    # Normalize weights to percentages (summing to 1 or representing relative contribution)
                    for word, weight in contributions[:5]: # Take top 5 overlapping keywords
                        normalized_weight = round((weight / total_weight) * 100) if total_weight > 0 else 0
                        
                        # Capitalize nicely for UI display
                        capitalized_word = word.capitalize()
                        skill_contribution.append({
                            "skill": capitalized_word,
                            "weight": normalized_weight
                        })
                
                recs = {
                    "course": {
                        "id": str(course['id']),
                        "name": course['name'],
                        "difficulty": course['difficulty'],
                        # CSV stores as pipe separated, convert back to list
                        "skills": course['skills'].split('|') if course['skills'] else [],
                        "domain": course['domain'],
                        "careerPaths": course['careerPaths'].split('|') if course['careerPaths'] else [],
                        "description": course['description']
                    },
                    "matchScore": int(round(score * 100)),
                    "explanation": self._generate_explanation(course, profile),
                    "skill_contribution": skill_contribution,
                    "skillsMatched": self._get_matched_skills(course, profile),
                    "skillsMissing": self._get_missing_skills(course, profile)
                }
                recommendations.append(recs)

        return recommendations

    def calculate_career_probabilities(self, profile: StudentProfile) -> List[Dict[str, Any]]:
        user_skills = [skill.lower().strip() for skill in profile.skills]
        probabilities = []
        
        for career, weights in self.career_skill_weights.items():
            score = 0.0
            total_possible_weight = sum(weights.values())
            
            for required_skill, weight in weights.items():
                if required_skill.lower().strip() in user_skills:
                    score += weight
                    
            if total_possible_weight > 0:
                probability = int(round((score / total_possible_weight) * 100))
                # Only include careers where they have at least 1% match to keep it clean
                if probability > 0:
                    probabilities.append({
                        "career": career,
                        "probability": probability
                    })
                    
        # Sort descending by probability
        probabilities.sort(key=lambda x: x['probability'], reverse=True)
        return probabilities

    def _get_matched_skills(self, course, profile: StudentProfile) -> List[str]:
        course_skills = set(course['skills'].split('|')) if course['skills'] else set()
        user_skills = set(profile.skills)
        return list(course_skills.intersection(user_skills))

    def _get_missing_skills(self, course, profile: StudentProfile) -> List[str]:
        course_skills = set(course['skills'].split('|')) if course['skills'] else set()
        user_skills = set(profile.skills)
        return list(course_skills - user_skills)

    def _generate_explanation(self, course, profile: StudentProfile) -> str:
        reasons = []
        
        # Check career alignment
        course_paths = course['careerPaths'].split('|') if course['careerPaths'] else []
        if profile.careerGoal in course_paths:
            reasons.append(f"aligns with your {profile.careerGoal} career goal")

        # Check domain alignment
        if profile.interests and course['domain'] in profile.interests:
            reasons.append(f"matches your interest in {course['domain']}")
            
        # Check skill overlap
        matched = self._get_matched_skills(course, profile)
        if matched:
             reasons.append(f"builds on your {', '.join(matched[:2])} skills")
             
        if not reasons:
            return "Recommended based on overall profile similarity."
            
        return f"Recommended because this course {' and '.join(reasons[:2])}."
