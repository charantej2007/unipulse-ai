import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sparkles, PlayCircle, Bot, ChevronDown, ChevronUp, CheckCircle2, UserCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import ReactMarkdown from 'react-markdown';

interface QA {
    question: string;
    ideal_answer: string;
}

interface MockInterviewData {
    technical_questions: QA[];
    hr_questions: QA[];
    rubric: string[];
}

export function MockInterviewSection() {
    const [role, setRole] = useState<string>('Software Engineer');
    const [difficulty, setDifficulty] = useState<string>('Medium');
    const [isGenerating, setIsGenerating] = useState(false);
    const [interviewData, setInterviewData] = useState<MockInterviewData | null>(null);
    const [error, setError] = useState<string>('');

    const handleGenerateMockInterview = async () => {
        setIsGenerating(true);
        setError('');
        setInterviewData(null);

        try {
            // @ts-ignore
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${baseUrl}/api/mock-interview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, difficulty })
            });

            if (response.ok) {
                const data = await response.json();
                setInterviewData(data);
            } else {
                const errData = await response.json();
                setError(errData.detail || 'Failed to generate mock interview');
            }
        } catch (err) {
            console.error(err);
            setError('Network Error. Please verify backend is running.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full mx-auto mt-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                    <div className="flex items-center gap-4 mb-4 relative">
                        <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl">
                            <Bot className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                                AI Mock Interview Simulator
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                                Generate personalized technical and HR interview questions with ideal answers.
                            </CardDescription>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 mt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Role</label>
                            <input
                                type="text"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g., Data Scientist"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty Level</label>
                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger className="w-full bg-white dark:bg-slate-950">
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Easy">Beginner / Junior</SelectItem>
                                    <SelectItem value="Medium">Intermediate</SelectItem>
                                    <SelectItem value="Hard">Senior / Expert</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20"
                                onClick={handleGenerateMockInterview}
                                disabled={isGenerating || !role}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="w-4 h-4 mr-2" />
                                        Start Simulator
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    {error && (
                        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {interviewData && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                            {/* Rubric */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    Evaluation Rubric
                                </h3>
                                <ul className="space-y-2">
                                    {interviewData.rubric.map((point, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                                            <div className="flex-1">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ node, ...props }) => <p className="mb-0 leading-relaxed" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-1 space-y-1" {...props} />,
                                                        li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                                    }}
                                                >
                                                    {point}
                                                </ReactMarkdown>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Technical Questions */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-blue-500" />
                                    Technical Questions
                                </h3>
                                <Accordion type="single" collapsible className="w-full space-y-3">
                                    {interviewData.technical_questions.map((qa, idx) => (
                                        <AccordionItem key={idx} value={`tech-${idx}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4">
                                            <AccordionTrigger className="text-left font-medium text-slate-800 dark:text-slate-200 py-4 hover:no-underline">
                                                <span className="flex items-center gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                                                        {idx + 1}
                                                    </span>
                                                    {qa.question}
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 pb-4 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                                                <div className="flex items-start gap-3">
                                                    <Sparkles className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong className="block text-slate-800 dark:text-slate-200 mb-1">Ideal Answer Guide:</strong>
                                                        <div className="text-slate-700 dark:text-slate-300">
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
                                                                {qa.ideal_answer}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>

                            {/* HR Questions */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                    <UserCircle className="w-5 h-5 text-rose-500" />
                                    HR & Behavioral Questions
                                </h3>
                                <Accordion type="single" collapsible className="w-full space-y-3">
                                    {interviewData.hr_questions.map((qa, idx) => (
                                        <AccordionItem key={idx} value={`hr-${idx}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4">
                                            <AccordionTrigger className="text-left font-medium text-slate-800 dark:text-slate-200 py-4 hover:no-underline">
                                                <span className="flex items-center gap-3">
                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-bold">
                                                        {idx + 1}
                                                    </span>
                                                    {qa.question}
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent className="text-sm text-slate-600 dark:text-slate-400 pb-4 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                                                <div className="flex items-start gap-3">
                                                    <Sparkles className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong className="block text-slate-800 dark:text-slate-200 mb-1">Ideal Answer Guide:</strong>
                                                        <div className="text-slate-700 dark:text-slate-300">
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
                                                                {qa.ideal_answer}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>

                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
