import React, { useState, useEffect } from 'react';
import { Target, Briefcase, ExternalLink, AlertCircle, Loader2, Award, Zap, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { StudentProfile, SkillWithStatus } from '../utils/recommendationEngine';
import ReactMarkdown from 'react-markdown';

interface JobReadinessResult {
    role_name: string;
    job_type: string;
    readiness_score: number;
    recommendation: string;
    missing_skills: string[];
    portal_links: string[];
}

interface JobReadinessSectionProps {
    profile: StudentProfile;
}

export function JobReadinessSection({ profile }: JobReadinessSectionProps) {
    const [readinessData, setReadinessData] = useState<JobReadinessResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Improvement plan state
    const [generatingPlanFor, setGeneratingPlanFor] = useState<string | null>(null);
    const [improvementPlans, setImprovementPlans] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchReadiness = async () => {
            try {
                setIsLoading(true);
                // @ts-ignore
                const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

                // Extract skill names if they are objects
                const skillsList = profile.skills.map((s: any) => typeof s === 'string' ? s : s.name);

                const response = await fetch(`${baseUrl}/api/job-readiness`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        skills: skillsList,
                        career_goal: profile.careerGoal
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setReadinessData(data.readiness);
                } else {
                    setError("Failed to fetch job readiness data.");
                }
            } catch (err) {
                console.error("Error fetching job readiness:", err);
                setError("Network error. Could not connect to the server.");
            } finally {
                setIsLoading(false);
            }
        };

        if (profile && profile.skills.length > 0) {
            fetchReadiness();
        }
    }, [profile]);

    const handleGeneratePlan = async (role: string, missingSkills: string[]) => {
        if (improvementPlans[role]) return; // Already generated

        try {
            setGeneratingPlanFor(role);
            // @ts-ignore
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

            const response = await fetch(`${baseUrl}/api/job-improvement-plan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role_name: role,
                    missing_skills: missingSkills
                })
            });

            if (response.ok) {
                const data = await response.json();
                setImprovementPlans(prev => ({ ...prev, [role]: data.improvement_plan }));
            }
        } catch (err) {
            console.error("Error generating improvement plan:", err);
        } finally {
            setGeneratingPlanFor(null);
        }
    };

    const getReadinessColor = (score: number) => {
        if (score >= 80) return "bg-green-500";
        if (score >= 60) return "bg-blue-500";
        return "bg-amber-500";
    };

    const getReadinessTextColor = (score: number) => {
        if (score >= 80) return "text-green-600 dark:text-green-400";
        if (score >= 60) return "text-blue-600 dark:text-blue-400";
        return "text-amber-600 dark:text-amber-400";
    };

    const getPortalName = (url: string) => {
        if (url.includes('linkedin.com')) return 'LinkedIn';
        if (url.includes('indeed.com')) return 'Indeed';
        if (url.includes('internshala.com')) return 'Internshala';
        if (url.includes('naukri.com')) return 'Naukri';
        return 'Job Portal';
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <Loader2 className="h-10 w-10 text-violet-500 animate-spin mb-4" />
                <p className="text-muted-foreground">Analyzing your job readiness...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-red-700 dark:text-red-400 mb-1">Analysis Failed</h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80">{error}</p>
            </div>
        );
    }

    if (readinessData.length === 0) {
        return (
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
                <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300 mb-2">No roles found</h3>
                <p className="text-slate-500">We don't have job readiness data for your specific profile yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                    <Target className="h-6 w-6 text-violet-600" />
                    Career Opportunities & Job Readiness
                </h2>
                <p className="text-muted-foreground">
                    See how your current skills map to active tech roles in the industry.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {readinessData.map((job, idx) => (
                    <Card key={idx} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className={`${job.job_type === 'Internship' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'}`}>
                                    {job.job_type}
                                </Badge>
                                <div className="flex items-center gap-1 font-bold text-lg">
                                    <span className={getReadinessTextColor(job.readiness_score)}>
                                        {job.readiness_score}%
                                    </span>
                                    <span className="text-xs text-muted-foreground font-normal">Ready</span>
                                </div>
                            </div>
                            <CardTitle className="text-xl leading-tight">{job.role_name}</CardTitle>
                            <CardDescription className="font-medium text-slate-700 dark:text-slate-300 mt-1">
                                {job.recommendation}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-4 flex-grow space-y-4">
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1 mt-1">
                                    <span>Skill Match</span>
                                    <span>{job.readiness_score}%</span>
                                </div>
                                <Progress value={job.readiness_score} className={`h-2 ${getReadinessColor(job.readiness_score)}`} />
                            </div>

                            {job.missing_skills.length > 0 && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2 flex items-center gap-1">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Skills to Improve:
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {job.missing_skills.map(skill => (
                                            <Badge key={skill} variant="outline" className="text-xs bg-white dark:bg-slate-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action plan section for low readiness */}
                            {job.readiness_score < 70 && job.missing_skills.length > 0 && (
                                <div className="mt-4">
                                    {!improvementPlans[job.role_name] ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                            onClick={() => handleGeneratePlan(job.role_name, job.missing_skills)}
                                            disabled={generatingPlanFor === job.role_name}
                                        >
                                            {generatingPlanFor === job.role_name ? (
                                                <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Generating Plan...</>
                                            ) : (
                                                <><Zap className="h-3.5 w-3.5 mr-2" /> Generate Improvement Plan</>
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-sm mt-3 animate-in fade-in zoom-in-95 duration-300 max-h-64 overflow-y-auto border border-violet-100 dark:border-violet-900/40">
                                            <div className="flex items-center gap-2 mb-3 text-violet-700 dark:text-violet-400 font-medium pb-2 border-b border-slate-200 dark:border-slate-800">
                                                <BookOpen className="h-4 w-4" /> AI Improvement Plan
                                            </div>
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                                                <ReactMarkdown>
                                                    {improvementPlans[job.role_name]}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="pt-2 pb-4 px-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 mt-auto">
                            <div className="w-full space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Apply Now</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {job.portal_links.map((link, lIdx) => (
                                        <a
                                            key={lIdx}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground transition-colors group"
                                        >
                                            {getPortalName(link)}
                                            <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-violet-500" />
                                        </a>
                                    ))}
                                    {job.portal_links.length === 0 && (
                                        <span className="text-sm text-slate-500 italic">No direct links available</span>
                                    )}
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div >
    );
}
