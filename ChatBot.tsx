import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles, Minimize2, Paperclip, FileText, Image as ImageIcon, Trash2, History, PlusSquare } from 'lucide-react';
import { API_BASE_URL } from '../config';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    updatedAt: number;
}

interface ChatBotProps {
    userContext?: string; // e.g., "Career goal: Web Developer, Skills: React, JavaScript"
}

export function ChatBot({ userContext = '' }: ChatBotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

    // Active chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Default welcome message
    const welcomeMessage: Message = {
        role: 'assistant',
        content: "👋 Hi! I'm PlinkX, your AI career guidance assistant. Ask me anything about courses, career paths, skills, or study strategies!",
        timestamp: new Date()
    };

    // Listen for global custom events to open chatbot with context
    useEffect(() => {
        const handleOpenWithContext = (e: Event) => {
            const customEvent = e as CustomEvent;
            setIsOpen(true);
            window.dispatchEvent(new CustomEvent('close-notes'));
            setInput(customEvent.detail.context);
            // Optionally, focus the input
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        };

        const handleCloseChatbot = () => setIsOpen(false);

        window.addEventListener('open-chatbot-with-context', handleOpenWithContext);
        window.addEventListener('close-chatbot', handleCloseChatbot);

        return () => {
            window.removeEventListener('open-chatbot-with-context', handleOpenWithContext);
            window.removeEventListener('close-chatbot', handleCloseChatbot);
        };
    }, []);

    // Load sessions from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('unipulse_chat_sessions');
        if (saved) {
            try {
                const parsedSessions = JSON.parse(saved).map((s: any) => ({
                    ...s,
                    messages: s.messages.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    }))
                }));
                // Sort by most recent first
                parsedSessions.sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt);
                setSessions(parsedSessions);

                if (parsedSessions.length > 0) {
                    // Load the most recent session
                    setActiveSessionId(parsedSessions[0].id);
                    setMessages(parsedSessions[0].messages);
                } else {
                    startNewChat();
                }
            } catch (error) {
                console.error("Error parsing chat history:", error);
                startNewChat();
            }
        } else {
            startNewChat();
        }
    }, []);

    // Save sessions whenever messages in active session change
    useEffect(() => {
        if (!activeSessionId) return;

        setSessions(prevSessions => {
            const sessionIndex = prevSessions.findIndex(s => s.id === activeSessionId);
            let updatedSessions = [...prevSessions];

            if (sessionIndex >= 0) {
                // Determine title: first user message, or default
                let title = prevSessions[sessionIndex].title;
                if (title === "New Chat" && messages.length > 1) {
                    const firstUserMsg = messages.find(m => m.role === 'user');
                    if (firstUserMsg) {
                        // Use max 30 chars for title
                        let rawTitle = firstUserMsg.content.includes('[Attached File')
                            ? (messages[1].content.length > 10 ? messages[1].content.split('\n').pop() || "File Analysis" : "File Analysis")
                            : firstUserMsg.content;
                        title = rawTitle.slice(0, 30) + (rawTitle.length > 30 ? '...' : '');
                    }
                }

                updatedSessions[sessionIndex] = {
                    ...updatedSessions[sessionIndex],
                    messages,
                    title,
                    updatedAt: Date.now()
                };
            } else {
                // Should not happen normally as startNewChat creates the session, but fallback
                updatedSessions.unshift({
                    id: activeSessionId,
                    title: "New Chat",
                    messages,
                    updatedAt: Date.now()
                });
            }

            // Save to localStorage
            localStorage.setItem('unipulse_chat_sessions', JSON.stringify(updatedSessions));
            return updatedSessions;
        });
    }, [messages, activeSessionId]);

    const startNewChat = () => {
        const newId = Date.now().toString();
        const newSession: ChatSession = {
            id: newId,
            title: "New Chat",
            messages: [welcomeMessage],
            updatedAt: Date.now()
        };

        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newId);
        setMessages([welcomeMessage]);
        setShowHistory(false);
    };

    const loadSession = (id: string) => {
        const session = sessions.find(s => s.id === id);
        if (session) {
            setActiveSessionId(id);
            setMessages(session.messages);
            setShowHistory(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFileError(null);
        if (file) {
            // 2MB size limit
            if (file.size > 2 * 1024 * 1024) {
                setFileError("File size exceeds 2MB limit.");
                setSelectedFile(null);
            } else {
                setSelectedFile(file);
            }
        }
        // Reset input so the same file can be selected again if removed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFileError(null);
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if ((!input.trim() && !selectedFile) || isLoading) return;

        const userContent = input.trim()
            ? (selectedFile ? `[Attached File: ${selectedFile?.name}]\n${input.trim()}` : input.trim())
            : `[Attached File: ${selectedFile?.name}]`;

        const userMessage: Message = {
            role: 'user',
            content: userContent,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        const messageToSend = input.trim();
        const fileToSend = selectedFile;

        setInput('');
        setSelectedFile(null);
        setFileError(null);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('message', messageToSend || "Can you analyze this document?");
            formData.append('context', userContext);
            if (fileToSend) {
                formData.append('file', fileToSend);
            }

            const response = await fetch(`${API_BASE_URL}/api/chat`, {
                method: 'POST',
                // No need for 'Content-Type' header, fetch will automatically set it with boundary for FormData
                body: formData
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Quick suggestion buttons
    const suggestions = [
        "What skills should I learn first?",
        "How do I prepare for interviews?",
        "Suggest a learning path",
        "What's the job market like?"
    ];

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => {
                    const newIsOpen = !isOpen;
                    setIsOpen(newIsOpen);
                    if (newIsOpen) {
                        window.dispatchEvent(new CustomEvent('close-notes'));
                    }
                }}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen
                    ? 'bg-slate-800 text-white rotate-0'
                    : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white animate-pulse'
                    }`}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <MessageCircle className="h-6 w-6" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-[60] w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                        <Bot className="h-5 w-5" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">PlinkX Assistant</h3>
                                    <p className="text-xs text-white/80">{showHistory ? "Chat History" : "Powered by Gemini AI"}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className={`p-1 rounded-full transition-colors ${showHistory ? 'bg-white/30' : 'hover:bg-white/20'}`}
                                    title={showHistory ? "Back to Chat" : "View History"}
                                >
                                    <History className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <Minimize2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {showHistory ? (
                        /* History View */
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col">
                            <Button
                                onClick={startNewChat}
                                className="w-full mb-4 bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700"
                                variant="outline"
                            >
                                <PlusSquare className="h-4 w-4 mr-2" />
                                Start New Chat
                            </Button>

                            <div className="space-y-2 flex-1">
                                {sessions.length === 0 ? (
                                    <div className="text-center text-muted-foreground text-sm py-8">
                                        No previous chats found.
                                    </div>
                                ) : (
                                    sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            onClick={() => loadSession(session.id)}
                                            className={`p-3 rounded-lg cursor-pointer transition-all border ${activeSessionId === session.id ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-300 dark:hover:border-violet-700'}`}
                                        >
                                            <h4 className="font-medium text-sm truncate">{session.title}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-muted-foreground truncate max-w-[70%]">
                                                    {session.messages.length > 1 ? session.messages[session.messages.length - 1].content : "No messages yet"}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground opacity-75">
                                                    {new Date(session.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Messages View */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50 flex flex-col">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white">
                                                <Sparkles className="h-4 w-4" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[85%] p-3 rounded-2xl ${message.role === 'user'
                                                ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-sm'
                                                : 'bg-white dark:bg-slate-800 text-foreground border border-slate-200 dark:border-slate-700 rounded-bl-sm shadow-sm'
                                                }`}
                                        >
                                            {message.role === 'user' ? (
                                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                            ) : (
                                                <div className="prose dark:prose-invert max-w-none text-sm space-y-2">
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ node, ...props }) => <p className="mb-1 last:mb-0 leading-relaxed" {...props} />,
                                                            a: ({ node, ...props }) => <a className="text-violet-600 dark:text-violet-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                            li: ({ node, ...props }) => <li className="leading-snug" {...props} />,
                                                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-3 mb-1 text-violet-700 dark:text-violet-400" {...props} />,
                                                            h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="font-semibold text-slate-900 dark:text-white" {...props} />
                                                        }}
                                                    >
                                                        {message.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                            <p className={`text-[10px] mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'
                                                }`}>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {message.role === 'user' && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white">
                                                <User className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-2 justify-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-700">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Quick Suggestions (only show at start) */}
                            {messages.length <= 1 && (
                                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                                    <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => {
                                                    setInput(suggestion);
                                                    inputRef.current?.focus();
                                                }}
                                                className="text-xs px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:border-violet-300 transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto">
                                {/* Selected File Preview */}
                                {selectedFile && (
                                    <div className="px-3 pb-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-2">
                                        <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                            {selectedFile.type.startsWith('image/') ? <ImageIcon className="h-4 w-4 text-violet-500" /> : <FileText className="h-4 w-4 text-violet-500" />}
                                            <span className="text-xs truncate flex-1">{selectedFile.name}</span>
                                            <button onClick={removeFile} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-muted-foreground hover:text-destructive transition-colors">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {fileError && (
                                    <div className="px-3 pb-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-2">
                                        <p className="text-xs text-destructive">{fileError}</p>
                                    </div>
                                )}

                                {/* Input */}
                                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.png"
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 flex-shrink-0 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                            title="Attach a file (Max 2MB)"
                                            disabled={isLoading}
                                        >
                                            <Paperclip className="h-5 w-5" />
                                        </button>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Ask about careers, courses, skills..."
                                            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full border-0 focus:ring-2 focus:ring-violet-500 text-sm"
                                            disabled={isLoading}
                                        />
                                        <button
                                            onClick={sendMessage}
                                            disabled={(!input.trim() && !selectedFile) || isLoading}
                                            className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Send className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
