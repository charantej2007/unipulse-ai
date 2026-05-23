import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Target, BarChart, Database, Zap, Activity, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ModelMetrics {
    recommendation_model: {
        hit_rate_at_5: number;
        avg_similarity: number;
        test_profiles: number;
        total_courses: number;
    };
    ats_model: {
        skill_match_accuracy: number;
        missing_skill_detection: number;
    };
    job_readiness_model: {
        consistency_score: number;
    };
}

export function ModelEvaluationSection() {
    const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                // @ts-ignore
                const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const response = await fetch(`${baseUrl}/api/model-evaluation`);
                if (response.ok) {
                    const data = await response.json();
                    setMetrics(data);
                }
            } catch (error) {
                console.error("Failed to fetch model evaluation metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading || !metrics) {
        return (
            <div className="w-full mx-auto mt-4 p-8 flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <section className="w-full mx-auto mt-4 animate-in fade-in slide-in-from-bottom-8 duration-500">

            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex justify-center items-center gap-2">
                    <Activity className="h-8 w-8 text-blue-500" />
                    Model Evaluation & Performance
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Transparent metrics and validation parameters powering the UniPulse AI engines.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                {/* Recommendation Engine Metrics */}
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                <Target className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Course Recommendation Engine</CardTitle>
                        </div>
                        <CardDescription>Collaborative Filtering & Content Similarity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Hit Rate */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Top-K Hit Rate (K=5)</div>
                                    <div className="text-xs text-slate-500">Expected course in Top 5 output</div>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">{metrics.recommendation_model.hit_rate_at_5}%</div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" style={{ width: `${metrics.recommendation_model.hit_rate_at_5}%` }}></div>
                            </div>
                        </div>

                        {/* Similarity */}
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Average Cosine Similarity</div>
                                    <div className="text-xs text-slate-500">Feature vector alignment</div>
                                </div>
                                <div className="text-2xl font-bold text-blue-600">{metrics.recommendation_model.avg_similarity}</div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full" style={{ width: `${metrics.recommendation_model.avg_similarity * 100}%` }}></div>
                            </div>
                        </div>

                        {/* Dataset Details */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <Database className="h-4 w-4 text-slate-400" />
                                {metrics.recommendation_model.test_profiles} Test Profiles
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <BarChart className="h-4 w-4 text-slate-400" />
                                {metrics.recommendation_model.total_courses} Catalog Courses
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* ATS Analyzer Metrics */}
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">ATS Resume Analyzer</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-center">
                                    <div className="text-3xl font-bold text-indigo-600 mb-1">{metrics.ats_model.skill_match_accuracy}%</div>
                                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Skill Match Accuracy</div>
                                    <div className="text-[10px] text-slate-500 mt-1">Manual validation alignment</div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 text-center">
                                    <div className="text-3xl font-bold text-indigo-600 mb-1">{metrics.ats_model.missing_skill_detection}%</div>
                                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Missing Skill Detection</div>
                                    <div className="text-[10px] text-slate-500 mt-1">True positive identification</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Readiness Engine Metrics */}
                    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100">Job Readiness Engine</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-100 dark:border-cyan-900/30">
                                <div>
                                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-cyan-600" />
                                        Consistency Score
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">Skill match vs readiness parity</div>
                                </div>
                                <div className="text-3xl font-bold text-cyan-600">{metrics.job_readiness_model.consistency_score}%</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Explainability Section */}
            <Card className="border-0 shadow-sm bg-blue-50/50 dark:bg-blue-950/20">
                <CardContent className="p-6">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                        <Activity className="h-4 w-4" /> Why do these metrics matter?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-700 dark:text-slate-300">
                        <div>
                            <p className="mb-2"><strong className="text-slate-900 dark:text-white">Why rely on Hit Rate@5?</strong></p>
                            <p className="text-slate-600 dark:text-slate-400">In recommendation systems, raw accuracy is flawed. Hit Rate@5 measures strictly if the most valuable course appears in the top 5 distinct algorithmic outputs, simulating real-world user scrolling behavior.</p>
                        </div>
                        <div>
                            <p className="mb-2"><strong className="text-slate-900 dark:text-white">Why use Cosine Similarity?</strong></p>
                            <p className="text-slate-600 dark:text-slate-400">When mapping skills to required job competencies, cosine similarity measures the multidimensional geometric distance between vectors rather than simple keyword overlap, avoiding false negatives on synonymous skills.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </section>
    );
}
