import React, { useState, useEffect, useRef } from 'react';
import { NotebookPen, X, Bold, List, History, PlusSquare } from 'lucide-react';

export interface NoteDocument {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
}

export function NotesWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [notes, setNotes] = useState<NoteDocument[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const [savedNotice, setSavedNotice] = useState(false);
    const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    // Initial load from local storage
    useEffect(() => {
        const savedNotes = localStorage.getItem('unipulse_notes_v2');
        let parsedNotes: NoteDocument[] = [];

        if (savedNotes) {
            try {
                parsedNotes = JSON.parse(savedNotes);
                setNotes(parsedNotes);
            } catch (e) {
                console.error("Failed to parse notes", e);
            }
        } else {
            // Migrate legacy single note if it exists
            const legacyNote = localStorage.getItem('unipulse_notes');
            if (legacyNote && legacyNote.trim()) {
                const newNote = {
                    id: Date.now().toString(),
                    title: extractTitle(legacyNote) || "My First Note",
                    content: legacyNote,
                    updatedAt: new Date().toISOString()
                };
                parsedNotes = [newNote];
                setNotes(parsedNotes);
                localStorage.setItem('unipulse_notes_v2', JSON.stringify(parsedNotes));
            }
        }

        // Initialize active note if opening for the first time
        if (isOpen && !activeNoteId && !showHistory) {
            if (parsedNotes.length > 0) {
                setActiveNoteId(parsedNotes[0].id);
            } else {
                startNewNote();
            }
        }
    }, [isOpen]);

    // Load content into editor when active note changes
    useEffect(() => {
        if (isOpen && !showHistory && editorRef.current) {
            const activeNote = notes.find(n => n.id === activeNoteId);
            if (activeNote) {
                editorRef.current.innerHTML = activeNote.content;
            } else {
                editorRef.current.innerHTML = '';
            }
            // Small delay to ensure focus works after layout shift
            setTimeout(() => editorRef.current?.focus(), 50);
        }
    }, [activeNoteId, showHistory, isOpen]);

    // Close notes when chatbot opens
    useEffect(() => {
        const handleCloseNotes = () => setIsOpen(false);
        window.addEventListener('close-notes', handleCloseNotes);
        return () => window.removeEventListener('close-notes', handleCloseNotes);
    }, []);

    const toggleNotes = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (newIsOpen) {
            window.dispatchEvent(new CustomEvent('close-chatbot'));
        }
    };

    const extractTitle = (htmlContent: string) => {
        // Strip HTML and get first ~30 chars
        const tmp = document.createElement("DIV");
        tmp.innerHTML = htmlContent;
        const text = tmp.textContent || tmp.innerText || "";
        const cleanText = text.trim().split('\n')[0];
        return cleanText.length > 30 ? cleanText.substring(0, 30) + '...' : cleanText;
    };

    // Handle saving
    const handleInput = () => {
        if (!editorRef.current || !activeNoteId) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            const content = editorRef.current?.innerHTML || '';
            const title = extractTitle(content) || "Untitled Note";
            const now = new Date().toISOString();

            setNotes(prevNotes => {
                const existingIndex = prevNotes.findIndex(n => n.id === activeNoteId);
                let newNotes;

                if (existingIndex >= 0) {
                    newNotes = [...prevNotes];
                    newNotes[existingIndex] = { ...newNotes[existingIndex], content, title, updatedAt: now };
                } else {
                    newNotes = [{ id: activeNoteId, title, content, updatedAt: now }, ...prevNotes];
                }

                // Sort by descending date
                newNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                localStorage.setItem('unipulse_notes_v2', JSON.stringify(newNotes));
                return newNotes;
            });

            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 2000);
        }, 1000); // Save organically while typing
    };

    const startNewNote = () => {
        const newId = Date.now().toString();
        const newNote: NoteDocument = {
            id: newId,
            title: "New Note",
            content: "",
            updatedAt: new Date().toISOString()
        };

        setNotes(prev => {
            const updated = [newNote, ...prev];
            localStorage.setItem('unipulse_notes_v2', JSON.stringify(updated));
            return updated;
        });

        setActiveNoteId(newId);
        setShowHistory(false);
    };

    const loadNote = (id: string) => {
        setActiveNoteId(id);
        setShowHistory(false);
    };

    const formatCommand = (command: string, event: React.MouseEvent) => {
        event.preventDefault(); // Prevent focus loss from editor
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
        handleInput(); // Trigger a save on format change
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    return (
        <>
            {/* Widget Toggle Button */}
            <button
                onClick={toggleNotes}
                className={`fixed bottom-[104px] right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen
                    ? 'bg-slate-800 text-white rotate-0'
                    : 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
                    }`}
                aria-label={isOpen ? 'Close notes' : 'Open notes'}
                title="Notes"
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <NotebookPen className="h-6 w-6" />
                )}
            </button>

            {/* Notes Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-[60] w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-yellow-200 dark:border-yellow-900/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                                    <NotebookPen className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-amber-900 dark:text-amber-50">
                                        {showHistory ? "Notes History" : "Quick Notes"}
                                    </h3>
                                    <p className="text-xs text-amber-800/80 dark:text-amber-100/80">
                                        {showHistory ? "View your previous notes" : "Note down key points to remember"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!showHistory && (
                                    <span className={`text-xs text-amber-900/70 dark:text-amber-100/70 transition-opacity duration-300 mr-1 ${savedNotice ? 'opacity-100' : 'opacity-0'}`}>
                                        Saved
                                    </span>
                                )}
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="p-1 hover:bg-black/10 rounded-full transition-colors text-amber-900 dark:text-amber-50"
                                    title={showHistory ? "Back to Note" : "View History"}
                                >
                                    <History className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-black/10 rounded-full transition-colors text-amber-900 dark:text-amber-50"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {showHistory ? (
                        /* History View */
                        <div className="flex-1 overflow-y-auto p-4 bg-amber-50/50 dark:bg-slate-900/50 flex flex-col">
                            <button
                                onClick={startNewNote}
                                className="w-full mb-4 px-4 py-2 rounded-md font-medium inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 shadow-sm border border-amber-200 dark:border-slate-700"
                            >
                                <PlusSquare className="h-4 w-4 mr-2" />
                                Start New Note
                            </button>

                            <div className="space-y-2 flex-1">
                                {notes.length === 0 ? (
                                    <div className="text-center text-muted-foreground text-sm py-8">
                                        No previous notes found.
                                    </div>
                                ) : (
                                    notes.map((note) => (
                                        <div
                                            key={note.id}
                                            onClick={() => loadNote(note.id)}
                                            className={`p-3 rounded-lg cursor-pointer transition-all border ${activeNoteId === note.id ? 'border-amber-400 bg-amber-100/50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-300 dark:hover:border-amber-700'}`}
                                        >
                                            <h4 className="font-medium text-sm truncate">{note.title || "Untitled"}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-[10px] text-muted-foreground opacity-75">
                                                    {new Date(note.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Toolbar */}
                            <div className="px-3 py-2 bg-amber-50 dark:bg-slate-800/50 border-b border-amber-100 dark:border-slate-800 flex gap-1">
                                <button
                                    onMouseDown={(e) => formatCommand('bold', e)}
                                    className="p-1.5 min-w-[32px] rounded text-slate-600 dark:text-slate-300 hover:bg-amber-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center font-bold"
                                    title="Bold text"
                                >
                                    <Bold className="h-4 w-4" />
                                </button>
                                <div className="w-px h-6 bg-amber-200 dark:bg-slate-700 mx-1 align-middle self-center"></div>
                                <button
                                    onMouseDown={(e) => formatCommand('insertUnorderedList', e)}
                                    className="p-1.5 min-w-[32px] rounded text-slate-600 dark:text-slate-300 hover:bg-amber-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center"
                                    title="Bullet List"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 overflow-y-auto w-full relative group bg-white dark:bg-slate-900">
                                <div className="absolute inset-0 pointer-events-none p-4 text-muted-foreground/40 text-sm peer-focus-within:hidden"
                                    style={{ display: (editorRef.current?.innerText.trim() || '') === '' ? 'block' : 'none' }}>
                                    Start typing your notes here...
                                </div>
                                <div
                                    ref={editorRef}
                                    className="w-full h-full p-4 peer outline-none text-sm leading-relaxed whitespace-pre-wrap 
                                    prose prose-sm dark:prose-invert focus:outline-none max-w-none
                                    [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-1 [&_li]:my-0 [&_p]:my-1 [&_strong]:font-bold"
                                    contentEditable
                                    onInput={handleInput}
                                    onPaste={handlePaste}
                                    suppressContentEditableWarning
                                    style={{ minHeight: '100%' }}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
