import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Badge } from '@/app/components/ui/badge';
import { ALL_SKILLS, ALL_DOMAINS, ALL_CAREER_PATHS } from '@/app/data/courses';
import {
  X,
  ArrowLeft,
  Sparkles,
  Target,
  BookOpen,
  GraduationCap,
  Rocket,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { Link } from 'react-router';
import { StudentProfile, SkillWithStatus, SkillStatus } from '@/app/utils/recommendationEngine';
import { Navbar } from '@/app/components/Navbar';
import { useAuth } from '@/app/context/AuthContext';

export function ProfilePage() {
  const navigate = useNavigate();
  const { updateUserProfile, userProfile, loading } = useAuth();
  const [skills, setSkills] = useState<SkillWithStatus[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [careerGoal, setCareerGoal] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedSkillStatus, setSelectedSkillStatus] = useState<SkillStatus>('not_started');
  const [selectedInterest, setSelectedInterest] = useState('');

  const steps = [
    { icon: Target, label: 'Skills', active: skills.length > 0 },
    { icon: BookOpen, label: 'Interests', active: interests.length > 0 },
    { icon: GraduationCap, label: 'Career', active: !!careerGoal },
    { icon: Zap, label: 'Education', active: !!educationLevel }
  ];

  useEffect(() => {
    if (loading) return;

    if (userProfile && userProfile.isProfileComplete) {
      const loadedSkills = userProfile.skills || [];
      if (loadedSkills.length > 0 && typeof loadedSkills[0] === 'string') {
        setSkills((loadedSkills as unknown as string[]).map(s => ({ name: s, status: 'not_started' as SkillStatus })));
      } else {
        setSkills(loadedSkills as SkillWithStatus[]);
      }
      setInterests(userProfile.interests || []);
      setCareerGoal(userProfile.careerGoal || '');
      setEducationLevel(userProfile.educationLevel || '');
      setDifficulty(userProfile.difficulty || '');
    } else {
      const storedProfile = sessionStorage.getItem('studentProfile');
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          const loadedSkills = parsed.skills || [];
          if (loadedSkills.length > 0 && typeof loadedSkills[0] === 'string') {
            setSkills(loadedSkills.map((s: string) => ({ name: s, status: 'not_started' as SkillStatus })));
          } else {
            setSkills(loadedSkills);
          }
          setInterests(parsed.interests || []);
          setCareerGoal(parsed.careerGoal || '');
          setEducationLevel(parsed.educationLevel || '');
          setDifficulty(parsed.difficulty || '');
        } catch (e) {
          console.error('Failed to parse stored profile', e);
        }
      }
    }
  }, [userProfile, loading]);

  const handleAddSkill = () => {
    if (selectedSkill && !skills.find(s => s.name === selectedSkill)) {
      setSkills([...skills, { name: selectedSkill, status: selectedSkillStatus }]);
      setSelectedSkill('');
      setSelectedSkillStatus('not_started');
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter(s => s.name !== skillName));
  };

  const handleUpdateSkillStatus = (skillName: string, newStatus: SkillStatus) => {
    setSkills(skills.map(s => s.name === skillName ? { ...s, status: newStatus } : s));
  };

  const handleAddInterest = () => {
    if (selectedInterest && !interests.includes(selectedInterest)) {
      setInterests([...interests, selectedInterest]);
      setSelectedInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const getStatusColor = (status: SkillStatus) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'ongoing': return 'bg-amber-500 hover:bg-amber-600';
      case 'not_started': return 'bg-rose-500 hover:bg-rose-600';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (skills.length === 0 || interests.length === 0 || !careerGoal || !educationLevel) {
      alert('Please fill in all required fields');
      return;
    }

    const profile: StudentProfile = {
      skills,
      interests,
      careerGoal,
      educationLevel,
      difficulty: difficulty || undefined
    };

    try {
      await updateUserProfile({
        ...profile,
        isProfileComplete: true
      });

      sessionStorage.setItem('studentProfile', JSON.stringify(profile));
      navigate('/recommendations');
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. Please try again.");
    }
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

      <div className="container mx-auto px-4 py-8 max-w-4xl pt-24 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium mb-4">
            <Sparkles className="h-3 w-3" />
            Profile Setup
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Tell Us About <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Yourself</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Complete your profile to receive AI-powered course recommendations aligned with your career goals.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-4 mb-10">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${step.active
                ? 'bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/25'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                {step.active ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
              </div>
              <span className={`text-xs font-medium ${step.active ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skills Input */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Your Current Skills *</CardTitle>
                  <CardDescription>
                    Select the technical skills you have and their learning status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="flex-1 h-11 bg-slate-50 dark:bg-slate-800">
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_SKILLS.filter((s: string) => !skills.find(sk => sk.name === s)).map((skill: string) => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedSkillStatus} onValueChange={(v) => setSelectedSkillStatus(v as SkillStatus)}>
                  <SelectTrigger className="w-full sm:w-[160px] h-11 bg-slate-50 dark:bg-slate-800">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Completed
                      </span>
                    </SelectItem>
                    <SelectItem value="ongoing">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Ongoing
                      </span>
                    </SelectItem>
                    <SelectItem value="not_started">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Not Started
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddSkill} disabled={!selectedSkill} className="h-11 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700">
                  Add Skill
                </Button>
              </div>

              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Ongoing</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Not Started</span>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                {skills.map((skill: SkillWithStatus) => (
                  <Badge
                    key={skill.name}
                    className={`gap-1 text-white px-3 py-1.5 ${getStatusColor(skill.status)}`}
                  >
                    {skill.name}
                    <Select
                      value={skill.status}
                      onValueChange={(v) => handleUpdateSkillStatus(skill.name, v as SkillStatus)}
                    >
                      <SelectTrigger className="h-4 w-4 p-0 border-0 bg-transparent hover:bg-white/20 rounded">
                        <span className="sr-only">Change status</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="not_started">Not Started</SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.name)}
                      className="ml-1 hover:text-white/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills selected yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Areas of Interest *</CardTitle>
                  <CardDescription>
                    What domains are you interested in exploring?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedInterest} onValueChange={setSelectedInterest}>
                  <SelectTrigger className="flex-1 h-11 bg-slate-50 dark:bg-slate-800">
                    <SelectValue placeholder="Select an interest" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_DOMAINS.filter(d => !interests.includes(d)).map(domain => (
                      <SelectItem key={domain} value={domain}>{domain}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddInterest} disabled={!selectedInterest} className="h-11 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                  Add Interest
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[48px] p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                {interests.map(interest => (
                  <Badge key={interest} variant="secondary" className="gap-1 px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 dark:hover:bg-cyan-900/50">
                    {interest}
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(interest)}
                      className="ml-1 hover:text-cyan-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {interests.length === 0 && (
                  <p className="text-sm text-muted-foreground">No interests selected yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Career Goal */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Target Career Goal *</CardTitle>
                  <CardDescription>
                    What career path are you aiming for?
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Select value={careerGoal} onValueChange={setCareerGoal}>
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-800">
                  <SelectValue placeholder="Select your career goal" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CAREER_PATHS.map(career => (
                    <SelectItem key={career} value={career}>{career}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Education Level */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Current Education Level *</CardTitle>
                  <CardDescription>
                    Your current level of education
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Select value={educationLevel} onValueChange={setEducationLevel}>
                <SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-800">
                  <SelectValue placeholder="Select your education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Difficulty Preference */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Preferred Course Difficulty</CardTitle>
                  <CardDescription>
                    Optional: Choose your preferred difficulty level
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup value={difficulty} onValueChange={setDifficulty} className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Beginner" id="beginner" className="border-emerald-500 text-emerald-500" />
                  <Label htmlFor="beginner" className="cursor-pointer">Beginner</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Intermediate" id="intermediate" className="border-amber-500 text-amber-500" />
                  <Label htmlFor="intermediate" className="cursor-pointer">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Advanced" id="advanced" className="border-rose-500 text-rose-500" />
                  <Label htmlFor="advanced" className="cursor-pointer">Advanced</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-xl shadow-violet-500/25"
            >
              <Rocket className="h-5 w-5 mr-2" />
              Get AI-Powered Recommendations
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
