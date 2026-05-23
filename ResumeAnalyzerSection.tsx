import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Sparkles, Briefcase, CheckCircle2, XCircle, AlertCircle, ChevronDown, Check, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import ReactMarkdown from 'react-markdown';

interface ATSResult {
    ats_score: number;
    skill_match_score: number;
    tfidf_similarity: number;
    matched_skills: string[];
    missing_skills: string[];
    structure_score: number;
    recommendation: string;
    extracted_text: string;
}

export function ResumeAnalyzerSection() {
    const [jobRoles, setJobRoles] = useState<string[]>([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // Suggestion state
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState('');
    const [copied, setCopied] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    // @ts-ignore
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        // Fetch job roles for the dropdown
        fetch(`${baseUrl}/api/job-roles`)
            .then(res => res.json())
            .then(data => {
                if (data.roles) {
                    setJobRoles(data.roles);
                }
            })
            .catch(err => console.error("Failed to load job roles", err));
    }, []);

    const validateAndSetFile = (selectedFile: File) => {
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];

        // 2MB size limit (2 * 1024 * 1024 bytes)
        if (selectedFile.size > 2 * 1024 * 1024) {
            setFile(null);
            setError('File size must be 2MB or less.');
            return;
        }

        if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.pdf') || selectedFile.name.endsWith('.docx')) {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please upload a valid PDF or DOCX file.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            setError('Please upload your resume first.');
            return;
        }
        if (!selectedRole) {
            setError('Please select a target job role.');
            return;
        }

        setIsAnalyzing(true);
        setError('');
        setAtsResult(null);
        setSuggestions('');

        try {
            // Read file into memory first to bypass Windows/OneDrive lock ERR_FAILED bugs
            const fileBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target?.result) resolve(e.target.result as ArrayBuffer);
                    else reject(new Error("File is empty or cannot be read"));
                };
                reader.onerror = () => reject(new Error("File streaming failed (Make sure the file is fully downloaded to your PC and not a cloud-only file)"));
                reader.readAsArrayBuffer(file);
            });

            // Reconstruct file as a raw Blob
            const fileBlob = new Blob([fileBuffer], { type: file.type || 'application/octet-stream' });

            const formData = new FormData();
            formData.append('file', fileBlob, file.name);
            formData.append('target_role', selectedRole);

            // Hardcode the absolute URL to prevent environment variable corruption
            const response = await fetch(`http://localhost:8000/api/analyze-resume`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setAtsResult(data);
            } else {
                const errData = await response.json();
                setError(errData.detail || 'Failed to analyze resume.');
            }
        } catch (err) {
            console.error(err);
            setError('Network error. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateSuggestions = async () => {
        if (!atsResult) return;

        setIsGeneratingSuggestions(true);
        try {
            // Hardcode the absolute URL
            const response = await fetch(`http://localhost:8000/api/resume-suggestions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resume_text: atsResult.extracted_text,
                    target_role: selectedRole,
                    missing_skills: atsResult.missing_skills,
                    ats_score: atsResult.ats_score
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to generate suggestions.');
            }
        } catch (err) {
            console.error(err);
            setError('Network error generating suggestions.');
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };

    const copySuggestions = () => {
        navigator.clipboard.writeText(suggestions);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to get color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20';
        if (score >= 60) return 'text-orange-500 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20';
        return 'text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
    };

    const getScoreTextColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="w-full mx-auto w-full mt-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-xl">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                                AI Resume ATS Analyzer
                            </CardTitle>
                            <CardDescription className="text-sm md:text-base mt-1">
                                Evaluate your resume against industry standards and identify critical skill gaps before applying.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">

                    {/* Inputs Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-indigo-500" />
                                Target Job Role
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow text-slate-700 dark:text-slate-200 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat pr-10"
                            >
                                <option value="" disabled>Select the role you're applying for...</option>
                                {jobRoles.map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Upload className="h-4 w-4 text-violet-500" />
                                Upload Resume (PDF/DOCX)
                            </label>
                            <div
                                className={`w-full relative border-2 border-dashed rounded-xl transition-colors cursor-pointer ${isDragging
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <div className="px-4 py-2.5 flex items-center justify-between text-slate-500 dark:text-slate-400">
                                    <span className="truncate">{file ? file.name : "Click to select a file..."}</span>
                                    {file ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Upload className="h-5 w-5" />}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-in fade-in">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !file || !selectedRole}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white py-6 rounded-xl shadow-lg shadow-indigo-500/20 transition-all font-semibold text-base"
                    >
                        {isAnalyzing ? (
                            <div className="flex items-center gap-2">
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Analyzing Resume Context...
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Evaluate ATS Compatibility
                            </div>
                        )}
                    </Button>

                    {/* Results Section */}
                    {atsResult && (
                        <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                            <hr className="border-slate-100 dark:border-slate-800" />

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Score Card */}
                                <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${getScoreColor(atsResult.ats_score)} md:w-1/3 text-center`}>
                                    <div className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-2">ATS Match Score</div>
                                    <div className="text-6xl font-black">{atsResult.ats_score}<span className="text-3xl opacity-60">%</span></div>

                                    <div className="mt-5 w-full flex justify-between items-center text-xs opacity-90 px-1 border-t border-black/10 dark:border-white/10 pt-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="font-black text-sm">{atsResult.skill_match_score}%</span>
                                            <span className="opacity-80">Skills</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="font-black text-sm">{atsResult.tfidf_similarity}%</span>
                                            <span className="opacity-80">Semantic</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="font-black text-sm">{atsResult.structure_score}/10</span>
                                            <span className="opacity-80">Structure</span>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm opacity-90 font-medium px-4 leading-relaxed">{atsResult.recommendation}</p>
                                </div>

                                {/* Skills Analysis */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:w-2/3">
                                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            Matched Skills ({atsResult.matched_skills.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {atsResult.matched_skills.length > 0 ? atsResult.matched_skills.map(skill => (
                                                <span key={skill} className="px-2.5 py-1 rounded-md bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20 text-xs font-medium">
                                                    {skill}
                                                </span>
                                            )) : <span className="text-sm text-slate-500">No core skills matched.</span>}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            Missing Skills ({atsResult.missing_skills.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {atsResult.missing_skills.length > 0 ? atsResult.missing_skills.map(skill => (
                                                <span key={skill} className="px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-xs font-medium">
                                                    {skill}
                                                </span>
                                            )) : <span className="text-sm text-slate-500">All required skills present!</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* AI Suggestions Button */}
                            {!suggestions && (
                                <Button
                                    onClick={handleGenerateSuggestions}
                                    disabled={isGeneratingSuggestions}
                                    variant="outline"
                                    className="w-full border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 py-6 rounded-xl"
                                >
                                    {isGeneratingSuggestions ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-5 w-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                                            Generating Resume Improvements...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5" />
                                            Generate AI Improvement Suggestions
                                        </div>
                                    )}
                                </Button>
                            )}

                            {/* Suggestions Results */}
                            {suggestions && (
                                <div className="mt-6 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/20 p-6 relative animate-in fade-in">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={copySuggestions}
                                        className="absolute top-4 right-4 text-slate-500 hover:text-indigo-600 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm shadow-sm"
                                    >
                                        {copied ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>

                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-indigo-500" />
                                        AI Resume Coach
                                    </h3>

                                    <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300">
                                        <ReactMarkdown
                                            components={{
                                                h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-5 mb-2 text-indigo-700 dark:text-indigo-400" {...props} />,
                                                h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-2 text-slate-800 dark:text-slate-200" {...props} />,
                                                h3: ({ node, ...props }) => <h3 className="text-md font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200" {...props} />,
                                                p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5" {...props} />,
                                                li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />
                                            }}
                                        >
                                            {suggestions}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
