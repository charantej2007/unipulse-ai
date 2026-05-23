import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import {
  StudentProfile,
  getRecommendations,
  CourseRecommendation,
  analyzeSkillGap,
  calculateCareerReadiness,
  SkillGapAnalysis,
  getRequiredSkillsForCareer,
  SkillWithStatus
} from '../utils/recommendationEngine';
import { API_BASE_URL } from '../config';
import { Course } from '../data/courses';
import { ArrowLeft, Star, TrendingUp, CheckCircle2, AlertCircle, XCircle, BookOpen, Map, Loader2, Sparkles, Target, Route, Building2, GraduationCap, Award, Brain, Search, Briefcase, Activity, Mic, ShieldAlert, Compass } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { RoadmapView } from '../components/RoadmapView';
import { OverviewSection } from '../components/OverviewSection';
import { FutureScopeSection } from '../components/FutureScopeSection';
import { CourseDetailsDialog } from '../components/CourseDetailsDialog';
import { AcademicsSection } from '../components/AcademicsSection';
import { ExamStrategySection } from '../components/ExamStrategySection';
import { JobReadinessSection } from '../components/JobReadinessSection';
import { ResumeAnalyzerSection } from '../components/ResumeAnalyzerSection';
import { ModelEvaluationSection } from '../components/ModelEvaluationSection';
import { MockInterviewSection } from '../components/MockInterviewSection';
import { CareerRiskAnalyzer } from '../components/CareerRiskAnalyzer';
import { ExploreSection } from '../components/ExploreSection';

export function RecommendationsPage() {
  const navigate = useNavigate();
  const { userProfile, loading } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [careerProbabilities, setCareerProbabilities] = useState<{ career: string; probability: number }[]>([]);
  const [skillGap, setSkillGap] = useState<SkillGapAnalysis | null>(null);
  const [readinessScore, setReadinessScore] = useState(0);
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseRecommendation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Try to get profile from context first, then session storage
    let currentProfile: StudentProfile | null = null;

    if (userProfile && userProfile.isProfileComplete) {
      // Map Firestore profile to StudentProfile (ensure types match)
      currentProfile = {
        skills: (userProfile.skills || []).map((skill: any) =>
          typeof skill === 'string'
            ? { name: skill, status: 'completed' as const }
            : skill
        ),
        interests: userProfile.interests || [],
        careerGoal: userProfile.careerGoal || '',
        educationLevel: userProfile.educationLevel || '',
        difficulty: userProfile.difficulty
      };
    } else {
      const storedProfile = sessionStorage.getItem('studentProfile');
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile);
        currentProfile = {
          ...parsed,
          skills: (parsed.skills || []).map((skill: any) =>
            typeof skill === 'string'
              ? { name: skill, status: 'completed' as const }
              : skill
          )
        };
      }
    }

    if (!currentProfile) {
      navigate('/profile');
      return;
    }

    setProfile(currentProfile);

    // Generate recommendations asynchronously
    const fetchRecommendations = async (prof: StudentProfile) => {
      try {
        // Map frontend SkillWithStatus objects down to just the string names for the backend
        const payload = {
          ...prof,
          skills: prof.skills.map(skill => skill.name)
        };

        const response = await fetch(`${API_BASE_URL}/api/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations || []);
          if (data.career_probabilities) {
            setCareerProbabilities(data.career_probabilities);
          }
        } else {
          // Fallback to local if backend fails
          setRecommendations(getRecommendations(prof));
        }
      } catch (e) {
        setRecommendations(getRecommendations(prof));
      }
    };

    fetchRecommendations(currentProfile);

    // Analyze skill gap
    const gap = analyzeSkillGap(currentProfile);
    setSkillGap(gap);

    const readiness = calculateCareerReadiness(currentProfile);
    setReadinessScore(readiness);
  }, [navigate, userProfile, loading]);

  useEffect(() => {
    const storedRoadmap = localStorage.getItem('career_roadmap');
    if (storedRoadmap) {
      try {
        // Validate if it is parseable JSON before setting
        JSON.parse(storedRoadmap);
        setRoadmap(storedRoadmap);
      } catch (e) {
        // If invalid JSON (maybe old plain text), ignore or clear
        console.error("Invalid stored roadmap", e);
        localStorage.removeItem('career_roadmap');
      }
    }
  }, []);

  const handleGenerateRoadmap = async () => {
    if (!profile) return;

    setRoadmapLoading(true);
    setRoadmapError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          career_goal: profile.careerGoal,
          skills: profile.skills.map((s: SkillWithStatus) => s.name),  // Extract skill names from objects
          interests: profile.interests,
          education_level: profile.educationLevel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate roadmap');
      }

      const data = await response.json();
      setRoadmap(data.roadmap);

      // Save stringified JSON to localStorage
      // Ensure we are saving the JSON string as the component expects a string (which it parses) or object.
      // The backend returns { roadmap: "..." } where "..." is the JSON string from Gemini.
      // Wait, let's check backend.
      // Backend returns {"roadmap": text.strip()}. And text.strip() is a JSON string.
      // So data.roadmap is a JSON STRING.
      localStorage.setItem('career_roadmap', data.roadmap);

    } catch (err: any) {
      setRoadmapError(err.message || 'An unexpected error occurred');
    } finally {
      setRoadmapLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center animate-pulse">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading your recommendations...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const getReadinessMessage = (score: number) => {
    if (score >= 80) return "You are well prepared for this career path!";
    if (score >= 60) return "You are moderately prepared. Completing the recommended courses will significantly improve readiness.";
    if (score >= 40) return "You have a good foundation. Focus on building the missing skills through recommended courses.";
    return "You're starting your journey. The recommended courses will help you build essential skills.";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-accent";
    if (score >= 40) return "bg-warning";
    return "bg-primary";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-background relative">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-400/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <Navbar />
      <div className="container mx-auto px-4 py-8 w-full max-w-none pt-24 relative z-10">
        <Link to="/profile" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Edit Profile
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" />
            AI-Powered Insights
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Your <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Personalized</span> Recommendations
          </h1>
          <p className="text-muted-foreground text-lg">
            Based on your skills, interests, and career goal: <strong className="text-foreground">{profile.careerGoal}</strong>
          </p>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-11 max-w-none h-12 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl overflow-x-auto hide-scrollbar">
            <TabsTrigger value="recommendations" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <Target className="h-4 w-4 hidden sm:inline" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="skill-gap" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <TrendingUp className="h-4 w-4 hidden sm:inline" />
              Skill Gap
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <Route className="h-4 w-4 hidden sm:inline" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="job-readiness" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <Briefcase className="h-4 w-4 hidden sm:inline" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="future-scope" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <Building2 className="h-4 w-4 hidden sm:inline" />
              Future
            </TabsTrigger>
            <TabsTrigger value="academics" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <GraduationCap className="h-4 w-4 hidden sm:inline" />
              Academics
            </TabsTrigger>
            <TabsTrigger value="exam-strategy" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <Brain className="h-4 w-4 hidden sm:inline" />
              Strategy
            </TabsTrigger>
            <TabsTrigger value="model-evaluation" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <Activity className="h-4 w-4 hidden sm:inline" />
              Evaluation
            </TabsTrigger>
            <TabsTrigger value="mock-interview" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <Mic className="h-4 w-4 hidden sm:inline" />
              Interview
            </TabsTrigger>
            <TabsTrigger value="career-risk" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <ShieldAlert className="h-4 w-4 hidden sm:inline" />
              Risk
            </TabsTrigger>
            <TabsTrigger value="explore" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-md gap-2">
              <Compass className="h-4 w-4 hidden sm:inline" />
              Explore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="academics" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-blue-500/5" />
              <CardContent className="space-y-6 relative pt-4 pb-8">
                <AcademicsSection hideHeader compact />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exam-strategy" className="space-y-6">
            <ExamStrategySection />
            <ResumeAnalyzerSection />
          </TabsContent>

          <TabsContent value="model-evaluation" className="space-y-6">
            <ModelEvaluationSection />
          </TabsContent>

          <TabsContent value="mock-interview" className="space-y-6">
            <MockInterviewSection />
          </TabsContent>

          <TabsContent value="career-risk" className="space-y-6">
            <CareerRiskAnalyzer
              jobReadiness={readinessScore}
              atsScore={70} // A mock ATS default until dynamically tracked across tabs
              missingSkills={skillGap?.missingSkills || []}
              careerProbability={65}
            />
          </TabsContent>

          <TabsContent value="explore" className="space-y-6">
            <ExploreSection />
          </TabsContent>

          <TabsContent value="job-readiness" className="space-y-6">
            <JobReadinessSection profile={profile} />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            {/* Overview Section */}
            {skillGap && (
              <OverviewSection
                careerGoal={profile.careerGoal}
                currentSkills={profile.skills}
                requiredSkills={getRequiredSkillsForCareer(profile.careerGoal)}
                strongSkills={skillGap.strongSkills}
                moderateSkills={skillGap.moderateSkills}
                missingSkills={skillGap.missingSkills}
                readinessScore={readinessScore}
              />
            )}

            {/* Career Alignment Probability */}
            {careerProbabilities.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-blue-500/5" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    Career Alignment Probability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  {careerProbabilities.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <span className="text-slate-700 dark:text-slate-300">{item.career}</span>
                        <span className={item.probability >= 50 ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"}>
                          {item.probability}%
                        </span>
                      </div>
                      <Progress value={item.probability} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Career Readiness Indicator */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-blue-500/5" />
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Career Readiness Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    {readinessScore}%
                  </div>
                  <div className="text-right max-w-md">
                    <p className="text-sm text-muted-foreground">
                      {getReadinessMessage(readinessScore)}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={readinessScore} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Course Recommendations */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-violet-600" />
                Recommended Courses
              </h2>

              {recommendations.map((rec, index) => (
                <Card key={rec.course.id} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {rec.course.name}
                          <Badge variant="outline">{rec.course.difficulty}</Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {rec.course.description}
                        </CardDescription>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-accent mb-1">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="font-semibold">{rec.matchScore}% Match</span>
                        </div>
                        <Progress value={rec.matchScore} className="h-2 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm">
                        <strong>Why recommended: </strong>
                        {rec.explanation}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium mb-2">Skills Covered:</p>
                        <div className="flex flex-wrap gap-2">
                          {rec.course.skills.map((skill: string) => (
                            <Badge
                              key={skill}
                              variant={rec.skillsMatched.includes(skill) ? "default" : "secondary"}
                            >
                              {skill}
                              {rec.skillsMatched.includes(skill) && " ✓"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {rec.skill_contribution && rec.skill_contribution.length > 0 && (
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value={`explanation-${index}`} className="border-b-0">
                          <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline text-violet-600 dark:text-violet-400">
                            <span className="flex items-center gap-2">
                              <Brain className="h-4 w-4" />
                              Why This Recommendation?
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-2">
                              <p className="text-xs text-muted-foreground mb-3">
                                Our AI analyzed your profile and found these skills strongly matching the course content:
                              </p>
                              {rec.skill_contribution.map((contrib, idx) => (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{contrib.skill}</span>
                                    <span className="text-muted-foreground">{contrib.weight}% Match</span>
                                  </div>
                                  <Progress value={contrib.weight} className="h-1.5" />
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(rec);
                          setDialogOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(rec);
                          setDialogOpen(true);
                        }}
                      >
                        Start Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skill-gap" className="space-y-6">
            {skillGap && (
              <>
                {/* Skills Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills Match Summary</CardTitle>
                    <CardDescription>
                      Overview of your skill alignment with the {profile.careerGoal} role
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Strong Skills */}
                    {skillGap.strongSkills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4" style={{ color: '#2ECC71' }} />
                          <h3 className="font-medium">Strong Skills</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {skillGap.strongSkills.map((skill: string) => (
                            <Badge key={skill} style={{ backgroundColor: '#2ECC71', color: 'white' }}>
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Moderate Skills */}
                    {skillGap.moderateSkills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4" style={{ color: '#F39C12' }} />
                          <h3 className="font-medium">Moderate Skills</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {skillGap.moderateSkills.map((skill: string) => (
                            <Badge key={skill} style={{ backgroundColor: '#F39C12', color: 'white' }}>
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {skillGap.missingSkills.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-destructive" />
                          <h3 className="font-medium">Missing Skills</h3>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-6">
                          {skillGap.missingSkills.map((skill: string) => (
                            <Badge key={skill} variant="destructive">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Missing Skills Cards */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold">Skill Gap Analysis</h2>
                  <p className="text-muted-foreground">
                    Courses to help you develop skills required for {profile.careerGoal}
                  </p>

                  {Array.from(skillGap.recommendedCourses.entries()).map(([skill, courses]: [string, Course[]]) => (
                    <Card key={skill}>
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-destructive" />
                          <div>
                            <CardTitle>Missing Skill: {skill}</CardTitle>
                            <CardDescription>
                              {courses.length > 0 ? 'Recommended courses to learn this skill' : 'No specific courses found'}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      {courses.length > 0 && (
                        <CardContent className="space-y-3">
                          {courses.map((course: Course) => {
                            // Find the recommendation for this course
                            const courseRec = recommendations.find(r => r.course.id === course.id);
                            return (
                              <div key={course.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <BookOpen className="h-5 w-5 text-primary" />
                                  <div>
                                    <p className="font-medium">{course.name}</p>
                                    <p className="text-sm text-muted-foreground">{course.difficulty}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (courseRec) {
                                      setSelectedCourse(courseRec);
                                      setDialogOpen(true);
                                    } else {
                                      // Create a basic recommendation object for courses not in recommendations
                                      const basicRec: CourseRecommendation = {
                                        course: course,
                                        matchScore: 75,
                                        skillsMatched: profile?.skills.map((s: SkillWithStatus) => s.name).filter((s: string) => course.skills.includes(s)) || [],
                                        skillsMissing: course.skills.filter((s: string) => !profile?.skills.some((ps: SkillWithStatus) => ps.name === s)),
                                        explanation: `This course covers ${skill} which is a required skill for your career goal.`
                                      };
                                      setSelectedCourse(basicRec);
                                      setDialogOpen(true);
                                    }
                                  }}
                                >
                                  View Course
                                </Button>
                              </div>
                            );
                          })}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="roadmap" className="space-y-6">
            <RoadmapView
              roadmap={roadmap}
              loading={roadmapLoading}
              onGenerate={handleGenerateRoadmap}
              error={roadmapError}
            />
          </TabsContent>

          <TabsContent value="future-scope" className="space-y-6">
            <FutureScopeSection careerGoal={profile.careerGoal} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Course Details Dialog */}
      <CourseDetailsDialog
        recommendation={selectedCourse}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentReadiness={readinessScore}
      />
    </div>
  );
}
