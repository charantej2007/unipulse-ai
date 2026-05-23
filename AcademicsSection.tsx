import React, { useState, useRef } from 'react';
import { Search, FileText, Download, Eye, PlayCircle, Bot, BookOpen, Sparkles, Clock, AlertCircle, Check, Copy, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { useAuth } from '../context/AuthContext';

interface ResourceDocument {
    title: string;
    topics: string;
    preview_url: string;
    download_url: string;
    youtube_links: string[];
}

interface AcademicsSectionProps {
    hideHeader?: boolean;
    compact?: boolean;
}

export function AcademicsSection({ hideHeader = false, compact = false }: AcademicsSectionProps) {
    const { isAdmin } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<ResourceDocument[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<ResourceDocument | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadSuccess(false);

        // Simulate a document upload and processing delay
        setTimeout(() => {
            setIsUploading(false);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }, 1500);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setHasSearched(true);
        setSelectedDoc(null); // Reset preview on new search

        try {
            // Using absolute URL if hosted on different port locally or relative in production
            // @ts-ignore
            const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${baseUrl}/api/resources?query=${encodeURIComponent(searchQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data.documents || []);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error("Failed to search resources:", error);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAskAI = (doc: ResourceDocument) => {
        const event = new CustomEvent('open-chatbot-with-context', {
            detail: {
                context: `User is studying ${searchQuery || 'Academic subjects'}. Current Topic Document: ${doc.title}. Key Topics: ${doc.topics}. Please assist them with questions on this material.`
            }
        });
        window.dispatchEvent(event);
    };

    const handleDownload = (doc: ResourceDocument) => {
        // @ts-ignore
        const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        window.open(`${baseUrl}${doc.download_url}`, '_blank');
    };

    return (
        <section id="academics" className={compact ? "py-4 md:py-6" : "py-16 md:py-24"}>
            <div className="container mx-auto px-4">
                {!hideHeader && (
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Explore <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Academics</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-8">
                            Explore study materials, deepen understanding, and prepare smarter with interactive AI integration.
                        </p>
                    </div>
                )}

                {/* Search Bar UI */}
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-violet-500 overflow-hidden">
                        <Search className="h-5 w-5 text-slate-400 ml-4" />
                        <input
                            type="text"
                            placeholder="Search subject (e.g., Data Structures, ML, DBMS...)"
                            className="flex-1 px-4 py-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isSearching || !searchQuery.trim()}
                            className="px-6 py-4 bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {/* Admin Upload UI */}
                {isAdmin && (
                    <div className="max-w-2xl mx-auto mt-6 text-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.docx,.txt"
                        />
                        <Button
                            variant="outline"
                            className={`border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 dark:border-violet-800 dark:text-violet-300 dark:bg-violet-900/30 dark:hover:bg-violet-900/50 transition-all ${uploadSuccess ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : ''}`}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-violet-600 mr-2"></div>
                                    Uploading...
                                </>
                            ) : uploadSuccess ? (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Document Uploaded!
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload New Document (Admin)
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Search Results Area */}
                {hasSearched && (
                    <div className="w-full mx-auto mt-8">
                        {isSearching ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.map((doc, idx) => (
                                    <div key={idx} className="flex flex-col">
                                        <Card className={`group flex flex-col h-full hover:shadow-xl transition-all duration-300 border-2 overflow-hidden relative ${selectedDoc?.title === doc.title ? 'border-violet-500 shadow-violet-500/20' : 'hover:border-violet-200 dark:hover:border-violet-800 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm'}`}>
                                            <CardHeader className="pb-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-600/20 flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
                                                        <FileText className="h-6 w-6" />
                                                    </div>
                                                </div>
                                                <CardTitle className="text-xl leading-tight mb-2">{doc.title}</CardTitle>
                                                <CardDescription className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                    <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Topics Covered</span>
                                                    {doc.topics || "General Concept"}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardFooter className="pt-2 pb-6 flex flex-wrap gap-2 mt-auto">
                                                <Button
                                                    variant={selectedDoc?.title === doc.title ? "secondary" : "default"}
                                                    className="flex-1 min-w-[120px]"
                                                    onClick={() => setSelectedDoc(selectedDoc?.title === doc.title ? null : doc)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    {selectedDoc?.title === doc.title ? 'Hide Preview' : 'Read'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 min-w-[120px]"
                                                    onClick={() => handleDownload(doc)}
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No documents found</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                    We couldn't find any resources matching "{searchQuery}". Try searching for broader topics like "Database" or "Machine Learning".
                                </p>
                            </div>
                        )}
                    </div>
                )}



                {/* Selected Document Embedded View & Tools */}
                {selectedDoc && (
                    <div className="w-full mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <FileText className="h-6 w-6 text-violet-600" />
                                Reading: {selectedDoc.title}
                            </h3>
                            <Button
                                variant="default"
                                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20"
                                onClick={() => handleAskAI(selectedDoc)}
                            >
                                <Bot className="w-5 h-5 mr-2" />
                                Ask AI About This Topic
                            </Button>
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8 h-[600px] md:h-[800px]">
                            {/* @ts-ignore */}
                            <iframe
                                src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${selectedDoc.preview_url}`}
                                className="w-full h-full rounded-xl bg-white"
                                title={selectedDoc.title}
                            />
                        </div>

                        {/* YouTube Curations */}
                        {selectedDoc.youtube_links && selectedDoc.youtube_links.length > 0 && (
                            <div className="mt-12 bg-white/50 dark:bg-slate-800/30 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <PlayCircle className="h-6 w-6 text-red-500" />
                                    Recommended Video Resources
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {selectedDoc.youtube_links.map((link, idx) => {
                                        // Try to extract video ID for thumbnail
                                        let videoId = '';
                                        try {
                                            if (link.includes('v=')) {
                                                videoId = link.split('v=')[1].split('&')[0];
                                            } else if (link.includes('youtu.be/')) {
                                                videoId = link.split('youtu.be/')[1].split('?')[0];
                                            }
                                        } catch (e) { }

                                        return (
                                            <a
                                                key={idx}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group block relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-lg hover:border-red-500/50 hover:-translate-y-1 bg-black aspect-video"
                                            >
                                                {videoId ? (
                                                    <img
                                                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                                        alt="Video Thumbnail"
                                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                                        <PlayCircle className="h-12 w-12 text-slate-500" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="bg-red-600 text-white rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                        <PlayCircle className="h-8 w-8" />
                                                    </div>
                                                </div>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section >
    );
}
