import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ShieldAlert, ShieldCheck, Shield, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { Progress } from './ui/progress';

interface CareerRiskProps {
    jobReadiness: number;
    atsScore: number;
    missingSkills: string[];
    careerProbability: number;
}

interface RiskAnalysis {
    risk_score: number;
    risk_level: string;
    confidence_score: number;
    recommendation: string;
    risk_areas: string[];
}

export function CareerRiskAnalyzer({ jobReadiness, atsScore, missingSkills, careerProbability }: CareerRiskProps) {
    const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRiskAnalysis = async () => {
            try {
                // @ts-ignore
                const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const response = await fetch(`${baseUrl}/api/analyze-career-risk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        job_readiness: jobReadiness,
                        ats_score: atsScore || 50, // default if no resume uploaded
                        missing_skills: missingSkills,
                        career_probability: careerProbability || 50,
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setAnalysis(data);
                }
            } catch (error) {
                console.error("Failed to analyze career risk:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRiskAnalysis();
    }, [jobReadiness, atsScore, missingSkills, careerProbability]);

    if (loading || !analysis) {
        return (
            <div className="w-full mx-auto mt-4 p-8 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    const isHighRisk = analysis.risk_level === 'High Risk';
    const isMediumRisk = analysis.risk_level === 'Medium Risk';
    const isLowRisk = analysis.risk_level === 'Low Risk';

    return (
        <div className="w-full mx-auto mt-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Main Risk Dashboard */}
                <Card className="col-span-1 md:col-span-2 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl overflow-hidden relative">
                    <div className={`absolute right-0 top-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none ${isHighRisk ? 'bg-rose-500/10' : isMediumRisk ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`} />

                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl ${isHighRisk ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' : isMediumRisk ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'}`}>
                                {isHighRisk ? <ShieldAlert className="h-6 w-6" /> : isMediumRisk ? <Shield className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                    Career Risk Analyzer
                                </CardTitle>
                                <CardDescription>Real-time predictive analysis of your employability trajectory</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-8 justify-center py-6">
                            {/* Circular Indicator (Simulated with progress and text) */}
                            <div className="relative flex items-center justify-center">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                                    <circle
                                        cx="64" cy="64" r="60"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={377}
                                        strokeDashoffset={377 - (377 * analysis.confidence_score) / 100}
                                        className={`transition-all duration-1000 ease-out ${isHighRisk ? 'text-rose-500' : isMediumRisk ? 'text-amber-500' : 'text-emerald-500'}`}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{analysis.confidence_score}%</span>
                                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Confidence</span>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1 text-center sm:text-left">
                                <div>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${isHighRisk ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50' : isMediumRisk ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'}`}>
                                        {isHighRisk ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                        {analysis.risk_level}
                                    </div>
                                </div>
                                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {analysis.recommendation}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Risk Areas Breakdown */}
                <Card className="col-span-1 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            Critical Risk Areas
                        </CardTitle>
                        <CardDescription>Metrics dragging down your score</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">Missing Skills Vulnerability</span>
                                <span className="font-semibold text-rose-600">{analysis.risk_areas.length * 3}% Penalty</span>
                            </div>
                            <Progress value={Math.min(100, analysis.risk_areas.length * 15)} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-rose-500" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">ATS Alignment Risk</span>
                                <span className="font-semibold text-amber-600">{100 - atsScore}%</span>
                            </div>
                            <Progress value={100 - atsScore} className="h-2 bg-slate-100 dark:bg-slate-800 [&>div]:bg-amber-500" />
                        </div>

                        {analysis.risk_areas.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Top Missing Competencies</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.risk_areas.slice(0, 5).map((skill, idx) => (
                                        <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
