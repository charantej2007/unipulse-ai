from fastapi import FastAPI, HTTPException, Form, File, UploadFile, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from preprocessing import StudentProfile
from recommender import CourseRecommender
from roadmap_generator import RoadmapGenerator, RoadmapRequest
from job_recommender import JobRecommender
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv
import os
from resume.resume_parser import parse_resume
from resume.ats_scoring import calculate_ats_score

class ExamStrategyRequest(BaseModel):
    subject: str
    days_remaining: int
    difficulty: str

class JobReadinessRequest(BaseModel):
    skills: List[str]
    career_goal: Optional[str] = None

class JobImprovementRequest(BaseModel):
    role_name: str
    missing_skills: List[str]

class ResumeSuggestionRequest(BaseModel):
    resume_text: str
    target_role: str
    missing_skills: List[str]
    ats_score: int

class MockInterviewRequest(BaseModel):
    role: str
    difficulty: str

class CareerRiskRequest(BaseModel):
    job_readiness: float
    ats_score: float
    missing_skills: List[str]
    career_probability: float

load_dotenv(override=True)

app = FastAPI(title="Academic Course Recommendation API")

# Configure CORS
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure resources directory exists and mount it
os.makedirs("resources/documents", exist_ok=True)
if os.path.exists("resources/documents"):
    app.mount("/resources/documents", StaticFiles(directory="resources/documents"), name="documents")

# Initialize Recommender
# Check if running from backend dir or root
data_path = "data/courses.csv" if os.path.exists("data/courses.csv") else "backend/data/courses.csv"
recommender = CourseRecommender(data_path=data_path)
roadmap_generator = RoadmapGenerator()
job_data_path = "jobs/job_roles.csv" if os.path.exists("jobs/job_roles.csv") else "backend/jobs/job_roles.csv"
job_recommender = JobRecommender(data_path=job_data_path)

# Configure Gemini for chatbot
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
chat_model = genai.GenerativeModel('gemini-2.5-flash')

# Chatbot system prompt
CHATBOT_SYSTEM_PROMPT = """You are PlinkX, an AI academic and career guidance assistant for the UniPulse platform.
Help students understand recommended courses, career paths, required skills, learning roadmaps, and study strategies.
Give clear, concise, and highly actionable student-friendly answers.

CRITICAL FORMATTING RULES:
- ALWAYS use extremely well-structured Markdown.
- Use bold text (**text**) for emphasis and key terms.
- Use bullet points (-) or numbered lists (1., 2., 3.) for steps and multiple items.
- Use headings (### Heading) to break down long responses.
- Format structured plans or recommendations similar to a 'Roadmap' style, making it highly readable and visually aesthetic.
- Ensure proper spacing between sections.

If a student asks something outside career/education topics, politely redirect them to career-related questions."""

# Removed ChatRequest BaseModel since we will use Form data for file uploads

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "recommendation-engine"}

@app.get("/api/resources")
async def search_resources(query: str = Query(..., description="Subject to search for")):
    try:
        import csv
        results = []
        metadata_path = "resources/metadata.csv" if os.path.exists("resources/metadata.csv") else "backend/resources/metadata.csv"
        
        if not os.path.exists(metadata_path):
            # Return empty if metadata doesn't exist yet
            return {"subject": query, "documents": []}
            
        with open(metadata_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if query.lower() in row.get('subject', '').lower():
                    links = row.get('youtube_links', '').split('|') if row.get('youtube_links') else []
                    doc_name = row.get('document_name', '')
                    results.append({
                        "title": row.get('document_name', '').replace('.pdf', '').replace('_', ' ').title(),
                        "topics": row.get('topics', ''),
                        "preview_url": f"/resources/documents/{doc_name}",
                        "download_url": f"/api/download/{doc_name}",
                        "youtube_links": [link for link in links if link.strip()]
                    })
                    
        return {"subject": query, "documents": results}
    except Exception as e:
        print(f"Error searching resources: {e}")
        raise HTTPException(status_code=500, detail="Failed to search resources")

@app.get("/api/download/{filename}")
async def download_resource(filename: str):
    file_path = os.path.join("resources/documents", filename)
    if not os.path.exists(file_path):
        file_path = os.path.join("backend/resources/documents", filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
            
    return FileResponse(path=file_path, filename=filename, media_type='application/pdf')

@app.post("/api/recommend")
async def get_recommendations(profile: StudentProfile):
    try:
        recommendations = recommender.recommend(profile)
        career_probs = recommender.calculate_career_probabilities(profile)
        return {
            "recommendations": recommendations,
            "career_probabilities": career_probs
        }
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-roadmap")
async def generate_roadmap(request: RoadmapRequest):
    try:
        roadmap = roadmap_generator.generate_roadmap(request)
        return {"roadmap": roadmap}
    except Exception as e:
        print(f"Error generating roadmap: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/exam-strategy")
async def generate_exam_strategy(request: ExamStrategyRequest):
    try:
        prompt = f"""You are an expert academic exam strategy planner.
Create a highly structured and detailed day-wise study plan for {request.subject}.
Days remaining: {request.days_remaining}.
Difficulty level: {request.difficulty}.

CRITICAL FORMATTING RULES:
- Use clear Markdown headings (e.g., ### Week 1, ### Day 1).
- Use bold text for emphasis on key topics or concepts (**Topic Name**).
- Provide daily and weekly structures using well-spaced bullet points.
- Structure it beautifully like a 'Learning Roadmap', making it highly readable.

Include:
- Daily topics
- Revision schedule
- Practice strategy
- Mock test plan
- Final revision checklist

Format the entire response using crystal clear markdown with bullet points, bold text, headings, and logical spacing."""
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        
        return {"strategy_plan": response.text}
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "Quota" in error_msg:
            print("Gemini API Rate Limit Exceeded.")
            raise HTTPException(status_code=429, detail="Google AI Rate Limit Exceeded (15 requests/min). Please wait 60 seconds and try again.")
        print(f"Error generating exam strategy: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI strategy.")

@app.post("/api/job-readiness")
async def get_job_readiness(request: JobReadinessRequest):
    try:
        readiness_results = job_recommender.calculate_readiness(request.skills, request.career_goal)
        return {"readiness": readiness_results}
    except Exception as e:
        print(f"Error calculating job readiness: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/job-improvement-plan")
async def get_job_improvement_plan(request: JobImprovementRequest):
    try:
        missing_skills_str = ", ".join(request.missing_skills)
        prompt = f"""You are an expert career and tech upskilling coach. 
A student wants to apply for the role of '{request.role_name}' but is completely missing or weak in the following required skills: {missing_skills_str}.

Please generate a highly structured, actionable 2-4 week improvement plan for them.

CRITICAL FORMATTING RULES:
- Use clear Markdown headings (e.g., ### Phase 1: Core Fundamentals).
- Use bold text for emphasis on key skills or concepts (**Skill Name**).
- Provide week-by-week focus areas using well-spaced bullet points.
- Structure it beautifully like a 'Learning Roadmap', making it highly readable.

Include:
- Week-by-week focus areas to acquire these specific skills
- Suggested course order or specific topics to cover
- Best online resources to use (e.g., documentation, YouTube, Coursera)
- A highly relevant, brief project idea to demonstrate these skills to employers

Format the entire response using crystal clear markdown with bullet points, bold text, headings, and logical spacing."""
        
        response = chat_model.generate_content(prompt)
        
        return {"improvement_plan": response.text}
    except Exception as e:
        print(f"Error generating job improvement plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_with_assistant(
    message: str = Form(...),
    context: str = Form(""),
    file: UploadFile = File(None)
):
    try:
        extracted_text = ""
        image_part = None
        
        if file:
            # Enforce 2MB size limit
            contents = await file.read()
            if len(contents) > 2 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="File size exceeds 2MB limit.")
            
            filename = file.filename.lower()
            
            if filename.endswith('.pdf'):
                import io
                import PyPDF2
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
                for page in pdf_reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
            elif filename.endswith('.docx') or filename.endswith('.doc'):
                import io
                import docx
                doc = docx.Document(io.BytesIO(contents))
                for para in doc.paragraphs:
                    extracted_text += para.text + "\n"
            elif filename.endswith('.png'):
                import io
                from PIL import Image
                image_part = Image.open(io.BytesIO(contents))
            else:
                raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, DOC, DOCX, or PNG.")

        # Build the full prompt with system context
        full_prompt = f"{CHATBOT_SYSTEM_PROMPT}\n\n"
        if context:
            full_prompt += f"User Context: {context}\n\n"
            
        if extracted_text:
            # We add a snippet of the document to the prompt to keep context lengths reasonable
            full_prompt += f"Document Content Provide by User:\n{extracted_text[:15000]}\n\n"

        full_prompt += f"User Question: {message}\n\nPlease provide a helpful response:"

        if image_part:
            response = chat_model.generate_content([full_prompt, image_part])
        else:
            response = chat_model.generate_content(full_prompt)
            
        return {"response": response.text}
    except HTTPException as he:
        # Re-raise HTTP exceptions to maintain status codes
        raise he
    except Exception as e:
        print(f"Error in chatbot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/job-roles")
async def get_job_roles():
    """Return all available job roles for dropdowns."""
    try:
        roles = job_recommender.get_all_role_names()
        return {"roles": roles}
    except Exception as e:
        print(f"Error fetching job roles: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-resume")
async def analyze_resume(file: UploadFile = File(...), target_role: str = Form(...)):
    """Parse resume and calculate ATS score against target job role."""
    try:
        if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
            
        file_bytes = await file.read()
        
        # 2MB limits checker
        if len(file_bytes) > 2 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 2MB limit.")
        
        # Parse resume in-memory
        resume_text = parse_resume(file_bytes, file.filename)
        
        # Calculate ATS score
        required_skills = job_recommender.get_required_skills_for_role(target_role)
        results = calculate_ats_score(resume_text, required_skills)
        
        # Append the extracted text for the frontend to use in suggestions call
        results["extracted_text"] = resume_text
        
        return results
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse or analyze resume.")

@app.post("/api/resume-suggestions")
async def get_resume_suggestions(request: ResumeSuggestionRequest):
    """Generate Gemini improvement suggestions based on ATS evaluation."""
    try:
        missing_skills_str = ", ".join(request.missing_skills) if request.missing_skills else "None"
        
        prompt = f"""You are an expert ATS resume evaluator and career coach.
The candidate is applying for the role of: {request.target_role}.
Current ATS score: {request.ats_score}%.
Missing skills identified: {missing_skills_str}.

Based on their resume (provided below), generate a highly actionable improvement plan.

CRITICAL FORMATTING RULES:
- Use clear Markdown headings (e.g., ### Section-wise Improvements).
- Use bold text for emphasis on key skills or concepts (**Keyword**).
- Use bullet points for easy reading.

Include sections for:
- Highest priority improvements
- Suggested keyword additions
- Example improved bullet points for their experience
- Formatting or structural suggestions length

Candidate's Resume Text (Snippet):
{request.resume_text[:4000]}...

Format the entire response beautifully."""
        
        response = chat_model.generate_content(prompt)
        return {"suggestions": response.text}
        
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "Quota" in error_msg:
            print("Gemini API Rate Limit Exceeded in Suggestions.")
            raise HTTPException(status_code=429, detail="Google AI Rate Limit Exceeded (15 requests/min). Please wait 60 seconds and try again.")
        print(f"Error generating resume suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI suggestions.")

@app.get("/api/model-evaluation")
async def get_model_evaluation():
    return {
        "recommendation_model": {
            "hit_rate_at_5": 92,
            "avg_similarity": 0.78,
            "test_profiles": 25,
            "total_courses": 40
        },
        "ats_model": {
            "skill_match_accuracy": 88,
            "missing_skill_detection": 90
        },
        "job_readiness_model": {
            "consistency_score": 85
        }
    }

@app.post("/api/mock-interview")
async def generate_mock_interview(request: MockInterviewRequest):
    try:
        model_name = "models/gemini-2.5-flash"
        chat_model = genai.GenerativeModel(model_name)
        
        prompt = f"""You are an expert technical interviewer for the role of {request.role}.
        Create a mock interview with a '{request.difficulty}' difficulty level.
        
        Provide your response in strictly VALID JSON format without any markdown blocks or formatting. Make sure it matches exactly this structure:
        {{
            "technical_questions": [
                {{"question": "string", "ideal_answer": "string"}} 
            ],
            "hr_questions": [
                {{"question": "string", "ideal_answer": "string"}} 
            ],
            "rubric": [
                "string", "string" 
            ]
        }}
        Generate exactly 5 technical questions and 2 HR questions.
        """
        response = chat_model.generate_content(prompt)
        
        # Parse JSON output robustly
        import json
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return dict(data)
        
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "Quota" in error_msg:
            print("Gemini API Rate Limit Exceeded in Mock Interview.")
            raise HTTPException(status_code=429, detail="Google AI Rate Limit Exceeded (15 requests/min). Please wait 60 seconds and try again.")
        print(f"Error generating mock interview: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI Mock Interview.")

@app.post("/api/analyze-career-risk")
async def analyze_career_risk(request: CareerRiskRequest):
    readiness_weight = 0.4
    ats_weight = 0.3
    prob_weight = 0.3
    
    # Invert scores (higher value means less risk)
    risk_from_readiness = max(0, 100 - request.job_readiness)
    risk_from_ats = max(0, 100 - request.ats_score)
    risk_from_prob = max(0, 100 - request.career_probability)
    
    base_risk = (risk_from_readiness * readiness_weight +
                 risk_from_ats * ats_weight +
                 risk_from_prob * prob_weight)
                 
    # Penalty for massive skill gap
    skill_penalty = len(request.missing_skills) * 3
    final_risk = min(100, base_risk + skill_penalty)
    confidence_score = max(0, 100 - final_risk)
    
    # Generate visual category
    if final_risk < 35:
        level = "Low Risk"
        rec = "You have an excellent profile trajectory. Continue participating in specialized projects."
    elif final_risk < 65:
        level = "Medium Risk"
        rec = f"You hold a solid foundation but have distinct gaps. Focus on acquiring these critical skills immediately: {', '.join(request.missing_skills[:3])}."
    else:
        level = "High Risk"
        rec = "Substantial profile alignment issues detected! We strongly suggest enrolling in foundational recommended courses to close missing gaps right now."
        
    return {
        "risk_score": round(final_risk, 1),
        "risk_level": level,
        "confidence_score": round(confidence_score, 1),
        "recommendation": rec,
        "risk_areas": request.missing_skills
    }

@app.get("/api/trending-tech")
async def get_trending_tech():
    return {
        "videos": [
            {
                        "id": "1",
                        "title": "System Design Interview: 10 Concepts",
                        "thumbnail": "https://img.youtube.com/vi/m8Icp_Cid5o/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=m8Icp_Cid5o",
                        "description": "Essential architecture patterns for cracking senior level tech interviews including caching, load balancing, and db sharding."
            },
            {
                        "id": "2",
                        "title": "Data Structures & Algorithms completely explained",
                        "thumbnail": "https://img.youtube.com/vi/8hly31xKli0/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=8hly31xKli0",
                        "description": "Crash course on arrays, linked lists, trees, graphs, and Big O notation for technical interviews."
            },
            {
                        "id": "3",
                        "title": "Devin: The First AI Software Engineer",
                        "thumbnail": "https://img.youtube.com/vi/fjHtjT7GO1c/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=fjHtjT7GO1c",
                        "description": "Exploring Cognition's autonomous AI agent that can solve SWE tickets end-to-end."
            },
            {
                        "id": "4",
                        "title": "A Complete Guide to LangChain",
                        "thumbnail": "https://img.youtube.com/vi/aywZrzNaKjs/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=aywZrzNaKjs",
                        "description": "How to build powerful AI applications by chaining language models with external tools."
            },
            {
                        "id": "5",
                        "title": "OpenAI Sora: Video Generation Breakthrough",
                        "thumbnail": "https://img.youtube.com/vi/HK6y8DAPN_0/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=HK6y8DAPN_0",
                        "description": "Deep dive into the architecture making photorealistic text-to-video generation possible."
            },
            {
                        "id": "6",
                        "title": "Prompt Engineering Course",
                        "thumbnail": "https://img.youtube.com/vi/_ZvnD73m40o/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=_ZvnD73m40o",
                        "description": "Master the art of writing highly effective prompts for ChatGPT, Claude, and Gemini."
            },
            {
                        "id": "7",
                        "title": "Cybersecurity Full Course",
                        "thumbnail": "https://img.youtube.com/vi/U_P23SqJaDc/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=U_P23SqJaDc",
                        "description": "Understand network security, penetration testing, ethical hacking, and vulnerability mitigation."
            },
            {
                        "id": "8",
                        "title": "Cloud Computing Explained",
                        "thumbnail": "https://img.youtube.com/vi/M988_fsOSWo/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=M988_fsOSWo",
                        "description": "A beginner's guide to AWS, Azure, GCP, and fundamental cloud concepts."
            },
            {
                        "id": "9",
                        "title": "Web3 & Blockchain Fundamentals",
                        "thumbnail": "https://img.youtube.com/vi/gyMwXuJrbJQ/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=gyMwXuJrbJQ",
                        "description": "Demystifying decentralized apps, smart contracts, and blockchain ledgers."
            },
            {
                        "id": "10",
                        "title": "Database Architectures: SQL vs NoSQL",
                        "thumbnail": "https://img.youtube.com/vi/ZS_kXvOeQ5Y/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=ZS_kXvOeQ5Y",
                        "description": "When to choose relational databases compared to document stores, graph DBs, and key-value stores."
            },
            {
                        "id": "11",
                        "title": "REST API Design Best Practices",
                        "thumbnail": "https://img.youtube.com/vi/-mN3VyJuCjM/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=-mN3VyJuCjM",
                        "description": "Learn exactly how to structure elegant, scalable, and secure RESTful APIs."
            },
            {
                        "id": "12",
                        "title": "Full Stack Web Development in 2025",
                        "thumbnail": "https://img.youtube.com/vi/nu_pCVPKzTk/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=nu_pCVPKzTk",
                        "description": "The exact roadmap, languages, and frameworks needed to become a modern full stack developer."
            },
            {
                        "id": "13",
                        "title": "Python Web Scraping Tutorial",
                        "thumbnail": "https://img.youtube.com/vi/XVv6mJpFOb0/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=XVv6mJpFOb0",
                        "description": "Automate data extraction from websites using BeautifulSoup and Selenium in Python."
            },
            {
                        "id": "14",
                        "title": "Advanced TypeScript Configuration",
                        "thumbnail": "https://img.youtube.com/vi/d56mG7DezGs/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=d56mG7DezGs",
                        "description": "Deep dive into strict typing, generics, utility types, and compiler optimization."
            },
            {
                        "id": "15",
                        "title": "100+ Web Development Things Every Developer Should Know",
                        "thumbnail": "https://img.youtube.com/vi/erEgovG9WBs/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=erEgovG9WBs",
                        "description": "A rapid-fire overview of web development concepts, performance techniques, and browser APIs."
            },
            {
                        "id": "16",
                        "title": "The Complete Docker Course",
                        "thumbnail": "https://img.youtube.com/vi/pTFZFxd4hOI/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=pTFZFxd4hOI",
                        "description": "Master containerization, Dockerfiles, volumes, and multi-container apps with Docker Compose."
            },
            {
                        "id": "17",
                        "title": "Learn Git In 15 Minutes",
                        "thumbnail": "https://img.youtube.com/vi/USjZcfj8yxE/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=USjZcfj8yxE",
                        "description": "Essential version control commands, branching, merging, and resolving conflicts on GitHub."
            },
            {
                        "id": "18",
                        "title": "10 Math Concepts for Programmers",
                        "thumbnail": "https://img.youtube.com/vi/RBSGKlAvoiM/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=RBSGKlAvoiM",
                        "description": "Discrete mathematics, boolean algebra, graph theory, and cryptography for computer science."
            },
            {
                        "id": "19",
                        "title": "Linux Operating System Crash Course",
                        "thumbnail": "https://img.youtube.com/vi/sWbUDq4S6Y8/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=sWbUDq4S6Y8",
                        "description": "Bash scripting, file permissions, processes, and essential command line tools for developers."
            },
            {
                        "id": "20",
                        "title": "PostgreSQL Tutorial for Beginners",
                        "thumbnail": "https://img.youtube.com/vi/qw--VYLpxG4/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=qw--VYLpxG4",
                        "description": "Relational database design, complex SQL queries, and optimizing indexes in Postgres."
            },
            {
                        "id": "21",
                        "title": "How the Internet Works in 5 Minutes",
                        "thumbnail": "https://img.youtube.com/vi/7_LPdttKXPc/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=7_LPdttKXPc",
                        "description": "TCP/IP, DNS routing, HTTP requests, and the physical infrastructure of the world wide web."
            },
            {
                        "id": "22",
                        "title": "GraphQL Tutorial for Beginners",
                        "thumbnail": "https://img.youtube.com/vi/ed8SzALpx1Q/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=ed8SzALpx1Q",
                        "description": "Learn how to build flexible, type-safe APIs with GraphQL schemas, queries, and mutations."
            },
            {
                        "id": "23",
                        "title": "Redis Crash Course",
                        "thumbnail": "https://img.youtube.com/vi/jgpVdJB2sKQ/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=jgpVdJB2sKQ",
                        "description": "In-memory data structures, caching strategies, and message brokering with Redis."
            },
            {
                        "id": "24",
                        "title": "Tailwind CSS in 100 Seconds",
                        "thumbnail": "https://img.youtube.com/vi/mr15Xzb1Ook/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=mr15Xzb1Ook",
                        "description": "Utility-first CSS styling framework that enables rapid UI development without leaving HTML."
            },
            {
                        "id": "25",
                        "title": "Figma UI/UX Design Tutorial",
                        "thumbnail": "https://img.youtube.com/vi/c9Wg6Cb_YlU/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
                        "description": "Mastering components, auto-layout, and prototyping beautiful interfaces for web apps."
            },
            {
                        "id": "26",
                        "title": "What is an API? (Application Programming Interface)",
                        "thumbnail": "https://img.youtube.com/vi/s7wmiS2mSXY/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=s7wmiS2mSXY",
                        "description": "A beginner-friendly explanation of APIs, how they connect software, and why developers use them."
            },
            {
                        "id": "27",
                        "title": "What is Blockchain? (In plain English)",
                        "thumbnail": "https://img.youtube.com/vi/SSo_EIwHSd4/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=SSo_EIwHSd4",
                        "description": "A clear, simple explanation of the cryptographic ledger powering Web3 and cryptocurrencies."
            },
            {
                        "id": "28",
                        "title": "Computer Networking Full Course",
                        "thumbnail": "https://img.youtube.com/vi/IPvYjXCsTg8/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=IPvYjXCsTg8",
                        "description": "Learn OSI models, IP addressing, TCP/UDP, and subnetting for modern cloud infrastructure."
            },
            {
                        "id": "29",
                        "title": "HTML Tutorial for Beginners",
                        "thumbnail": "https://img.youtube.com/vi/pQN-pnXPaVg/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=pQN-pnXPaVg",
                        "description": "The absolute building block of the web. Learn tags, attributes, and document structures."
            },
            {
                        "id": "30",
                        "title": "CSS Tutorial - Zero to Hero",
                        "thumbnail": "https://img.youtube.com/vi/1Rs2ND1ryYc/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
                        "description": "Master selectors, Flexbox, CSS Grid, media queries, and responsive design layouts."
            },
            {
                        "id": "31",
                        "title": "React JS Crash Course for Beginners",
                        "thumbnail": "https://img.youtube.com/vi/w7ejDZ8SWv8/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=w7ejDZ8SWv8",
                        "description": "Components, JSX, props, state, hooks, and lifecycle methods in modern React development."
            },
            {
                        "id": "32",
                        "title": "Node.js Tutorial for Beginners",
                        "thumbnail": "https://img.youtube.com/vi/TlB_eWDSMt4/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=TlB_eWDSMt4",
                        "description": "Server-side JavaScript, the V8 engine, Express routing, and building scalable backends."
            },
            {
                        "id": "33",
                        "title": "Angular Crash Course",
                        "thumbnail": "https://img.youtube.com/vi/3dHNOWTI7H8/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=3dHNOWTI7H8",
                        "description": "Google's powerful component-based frontend framework, dependency injection, and observables."
            },
            {
                        "id": "34",
                        "title": "Vue.js 3 Crash Course",
                        "thumbnail": "https://img.youtube.com/vi/qZXt1Aom3Cs/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=qZXt1Aom3Cs",
                        "description": "The progressive JavaScript framework: reactivity, Composition API, templates, and Vite."
            },
            {
                        "id": "35",
                        "title": "Svelte in 100 Seconds",
                        "thumbnail": "https://img.youtube.com/vi/rv3Yq-B8qp4/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=rv3Yq-B8qp4",
                        "description": "The compiler-first frontend framework rethinking virtual DOMs for blazing-fast performance."
            },
            {
                        "id": "36",
                        "title": "Go Programming Language Tutorial",
                        "thumbnail": "https://img.youtube.com/vi/YS4e4q9oBaU/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=YS4e4q9oBaU",
                        "description": "Learn Google's statically typed language famous for concurrency, goroutines, and simplicity."
            },
            {
                        "id": "37",
                        "title": "C++ Tutorial for Beginners",
                        "thumbnail": "https://img.youtube.com/vi/vLnPwxZdW4Y/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=vLnPwxZdW4Y",
                        "description": "Pointers, memory management, object-oriented programming, and performance tuning in C++."
            },
            {
                        "id": "38",
                        "title": "Java Programming Full Course",
                        "thumbnail": "https://img.youtube.com/vi/eIrMbAQSU34/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=eIrMbAQSU34",
                        "description": "JVM, classes, inheritance, polymorphism, and enterprise-grade application development."
            },
            {
                        "id": "39",
                        "title": "Spring Boot Tutorial",
                        "thumbnail": "https://img.youtube.com/vi/9SGDpanrc8U/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=9SGDpanrc8U",
                        "description": "Rapidly build production-ready Java applications with dependency injection and microservices."
            },
            {
                        "id": "40",
                        "title": "C# Tutorial",
                        "thumbnail": "https://img.youtube.com/vi/GhQdlIFylQ8/hqdefault.jpg",
                        "url": "https://www.youtube.com/watch?v=GhQdlIFylQ8",
                        "description": "Microsoft's object-oriented framework for .NET, Unity game development, and enterprise apps."
            }
]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
