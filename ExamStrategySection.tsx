import React, { useState } from 'react';
import { FileText, Sparkles, BookOpen, Clock, AlertCircle, Check, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import ReactMarkdown from 'react-markdown';

export function ExamStrategySection() {
    const [examSubject, setExamSubject] = useState('');
    const [examDays, setExamDays] = useState<number | ''>(14);
    const [examDifficulty, setExamDifficulty] = useState('Intermediate');
    const [examStrategy, setExamStrategy] = useState('');
    const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
    const [strategyError, setStrategyError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerateStrategy = async () => {
        if (!examSubject.trim() || !examDays) {
            setStrategyError("Please provide a subject and valid days remaining.");
            return;
        }

        setIsGeneratingStrategy(true);
        setStrategyError('');
        setExamStrategy('');

        try {
            // @ts-ignore
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${baseUrl}/api/exam-strategy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: examSubject,
                    days_remaining: Number(examDays),
                    difficulty: examDifficulty
                })
            });

            if (response.ok) {
                const data = await response.json();
                setExamStrategy(data.strategy_plan);
            } else {
                const errorData = await response.json();
                setStrategyError(errorData.detail || "Failed to generate strategy. Please try again.");
            }
        } catch (error) {
            console.error("Failed to generate exam strategy:", error);
            setStrategyError("Network error. Please try again.");
        } finally {
            setIsGeneratingStrategy(false);
        }
    };

    const copyToClipboard = () => {
        if (!examStrategy) return;
        navigator.clipboard.writeText(examStrategy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full mx-auto mt-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card className="border-0 shadow-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                <CardHeader className="relative z-10 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                            AI Exam Strategy Planner
                        </CardTitle>
                    </div>
                    <CardDescription className="text-base">
                        Generate a highly personalized day-by-day survival plan tailored to your exam timeline and academic level.
                    </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-violet-500" />
                                Exam Subject
                            </label>
                            <select
                                value={examSubject}
                                onChange={(e) => setExamSubject(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-violet-500 outline-none transition-shadow"
                            >
                                <option value="" disabled>Select subject...</option>
                                <option value="Data Structures and Algorithms">Data Structures & Algo</option>
                                <option value="Machine Learning">Machine Learning</option>
                                <option value="Database Management">Database Management</option>
                                <option value="Computer Networks">Computer Networks</option>
                                <option value="Operating Systems">Operating Systems</option>
                                <option value="Calculus and Math">Calculus & Math</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" />
                                Days Remaining
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={examDays}
                                onChange={(e) => setExamDays(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                                placeholder="e.g. 14"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                Difficulty Target
                            </label>
                            <select
                                value={examDifficulty}
                                onChange={(e) => setExamDifficulty(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-orange-500 outline-none transition-shadow"
                            >
                                <option value="Beginner">Beginner (Pass)</option>
                                <option value="Intermediate">Intermediate (Good Grade)</option>
                                <option value="Advanced">Advanced (Top Marks)</option>
                            </select>
                        </div>
                    </div>

                    {strategyError && (
                        <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm flex items-center gap-2 border border-red-200 dark:border-red-800/30">
                            <AlertCircle className="h-4 w-4" />
                            {strategyError}
                        </div>
                    )}

                    <div className="flex justify-end mb-6">
                        <Button
                            onClick={handleGenerateStrategy}
                            disabled={isGeneratingStrategy}
                            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white min-w-[200px]"
                        >
                            {isGeneratingStrategy ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Generating Plan...
                                </>
                            ) : (
                                <>Generate AI Strategy</>
                            )}
                        </Button>
                    </div>

                    {examStrategy && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-3 px-2">
                                <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-violet-500" />
                                    Your Strategic Blueprint
                                </h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="text-slate-500 hover:text-violet-600"
                                >
                                    {copied ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                                    {copied ? 'Copied Details' : 'Copy'}
                                </Button>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[500px] overflow-y-auto prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-violet-700 dark:text-violet-400" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-3 mb-1 text-slate-800 dark:text-slate-200" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />
                                    }}
                                >
                                    {examStrategy}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
