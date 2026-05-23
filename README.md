# 🎓 UniPulse : An AI-Powered Academic and Career Guidance Platform

An AI-powered web application that recommends academic courses aligned with a student’s skills, interests, education level, and career goals, using Machine Learning, NLP, and Google Gemini.

🚀 Problem Statement

Students often struggle to choose the right academic courses that align with their long-term career goals due to lack of personalized guidance. Existing platforms provide generic recommendations without considering individual skills, interests, and career readiness.

This project solves that problem by delivering personalized, explainable, and career-focused course recommendations.

💡 Solution Overview

The system:
Builds a student profile from inputs
Matches it with course profiles using NLP-based similarity
Generates top course recommendations with match scores
Identifies skill gaps
Uses Gemini AI to generate:
Learning roadmaps
Conversational career guidance (chatbot)

✨ Key Features
✅ Core Features
Personalized course recommendations
Match score & ranking
Explainable AI (“Why this course?”)
Career readiness indicator
Skill gap analysis
REST API–based architecture

🌟 Advanced Features

AI-powered learning roadmap generation (Gemini)
Career guidance chatbot (Gemini)
Course filtering by difficulty & domain
Scalable frontend–backend design

🧠 Machine Learning Approach
Type: Content-based recommendation system

Techniques used:
TF-IDF Vectorization
Cosine Similarity

Why this approach?
Lightweight
Explainable
Fast inference
Ideal for academic text matching

🏗️ System Architecture
Frontend (React / Next.js)
        |
        | REST API
        |
Backend (FastAPI)
        |
        |-- ML Recommendation Engine
        |-- Gemini AI (Roadmap + Chatbot)

🛠️ Tech Stack
Frontend
Next.js
HTML, CSS (Rich Blue Theme)
Fetch / Axios

Backend
Python
FastAPI
Pandas, NumPy
Scikit-learn

AI & Cloud (Google Technologies)
Google Gemini API (roadmap + chatbot)
Google Colab (ML development)
Google Cloud–compatible deployment
Deployment
Antigravity (free hosting)

📁 Project Structure
project-root/
│
├── frontend/        # React / Next.js UI
├── backend/
│   ├── app.py
│   ├── recommender.py
│   ├── gemini_service.py
│   ├── data/
│   └── requirements.txt
└── README.md

⚙️ How to Run Locally
Backend
cd backend
pip install -r requirements.txt
uvicorn app:app --reload

Frontend
cd frontend
npm install
npm run dev

🔐 Environment Variables
Create a .env file in backend:
GEMINI_API_KEY=your_gemini_api_key

🌐 Live Demo
Frontend: (add deployed URL)
Backend API: (add deployed URL)

🧪 Example Use Case
Student enters skills, interests, and career goal
System recommends top 3–5 aligned courses
Shows match score and explanation
Displays missing skills
Gemini generates a personalized learning roadmap
Chatbot answers career-related questions

🏆 Why This Project Stands Out
Real-world problem
Explainable ML
Google AI integration
Clean architecture
Fully deployable
Built within hackathon constraints

🔮 Future Enhancements
Integration with real university course APIs
User authentication & profiles
Feedback-based recommendation improvement
Analytics dashboard for institutions

👨‍💻 Team

Team Lead: CHARAN TEJ U
Team Members : KANDA KEDARESWAR , KANCHARLA SURYA SAI TEJA , VEMULA CHENCHU NAGA VENKATA THARUN SAI
Institution: KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION 

📜 License

This project is developed for academic and hackathon purposes.
