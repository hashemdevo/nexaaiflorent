
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Command, X, ArrowRight, Zap, Sparkles, HelpCircle, Loader2, Moon, Sun } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { ai } from '../../services/gemini/core';
import { COMMANDS } from '../../config/commands';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
    const { 
        setCurrentView, toggleDarkMode, isDarkMode, logout, setPosEnabled, isPosEnabled,
        currentUserIndustry
    } = useApp();
    
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredCommands = useMemo(() => {
        const lowerQuery = query.toLowerCase();
        
        return COMMANDS.filter(cmd => {
            const isRelevantIndustry = 
                cmd.industry === 'ALL' || 
                currentUserIndustry === 'GENERIC' || 
                (currentUserIndustry === 'HOSPITAL' && cmd.industry === 'MEDICAL') || 
                cmd.industry === currentUserIndustry;

            if (!isRelevantIndustry) return false;

            return cmd.label.toLowerCase().includes(lowerQuery) || 
                   (cmd.keywords && cmd.keywords.some(k => k.includes(lowerQuery)));
        });
    }, [query, currentUserIndustry]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands.length > 0) executeSelected();
                else if (query) handleAiQuery(query);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, query]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setAiResponse(null);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const executeSelected = () => {
        const cmd = filteredCommands[selectedIndex];
        if (!cmd) return;

        if (cmd.view) setCurrentView(cmd.view);
        else if (cmd.id === 'act-theme') toggleDarkMode();
        else if (cmd.id === 'act-pos-toggle') setPosEnabled(!isPosEnabled);
        else if (cmd.id === 'act-logout') logout();
        else if (cmd.id === 'tool-calc') handleAiQuery("What is the best way to improve cash flow?");
        
        onClose();
    };

    const handleAiQuery = async (userQuery: string) => {
        if (!userQuery) return;
        setIsThinking(true);
        setAiResponse(null);
        try {
            const model = "gemini-2.5-flash";
            const prompt = `You are Nexa, an enterprise ERP assistant. Answer concisely. Query: "${userQuery}"`;
            const response = await ai.models.generateContent({ model, contents: prompt });
            setAiResponse(response.text || "I couldn't process that request.");
        } catch {
            setAiResponse("Sorry, AI services are currently unavailable.");
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] animate-fade-in p-4">
            <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col relative max-h-[60vh]">
                <div className="flex items-center px-4 border-b border-border h-16 bg-surface shrink-0">
                    <Search className="h-5 w-5 text-on-surface-muted" />
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); setAiResponse(null); }}
                        placeholder="Type a command or ask Nexa AI..."
                        className="flex-1 bg-transparent border-none outline-none px-4 text-on-surface placeholder:text-on-surface-muted h-full text-lg"
                    />
                    <button onClick={onClose} className="p-2 hover:bg-surface-highlight rounded-lg text-on-surface-muted transition"><X className="h-5 w-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-background/50">
                    {isThinking && <div className="p-6 flex items-center justify-center gap-3 text-primary animate-pulse border-b border-border"><Loader2 className="h-5 w-5 animate-spin" /><span className="font-bold">Nexa AI is thinking...</span></div>}
                    {aiResponse && <div className="p-6 bg-surface-highlight/10 border-b border-border"><div className="flex items-start gap-3"><div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0"><Sparkles className="h-5 w-5" /></div><div className="space-y-1"><h4 className="text-sm font-bold text-on-surface">AI Assistant</h4><p className="text-sm text-on-surface-muted leading-relaxed whitespace-pre-wrap">{aiResponse}</p></div></div></div>}

                    {!aiResponse && !isThinking && (
                        <div className="py-2">
                            {filteredCommands.length > 0 ? (
                                <div className="px-2 pb-2">
                                    <div className="px-3 py-2 text-[10px] font-bold text-on-surface-muted uppercase tracking-wider">Suggested Actions</div>
                                    {filteredCommands.map((cmd, idx) => {
                                        const Icon = cmd.icon;
                                        return (
                                            <button key={cmd.id} onClick={() => { setSelectedIndex(idx); executeSelected(); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${selectedIndex === idx ? 'bg-primary text-black font-bold shadow-glow-primary' : 'text-on-surface hover:bg-surface-highlight'}`} onMouseEnter={() => setSelectedIndex(idx)}>
                                                <Icon className={`h-5 w-5 ${selectedIndex === idx ? 'text-black' : 'text-on-surface-muted'}`} />
                                                <span className="flex-1">{cmd.label}</span>
                                                {cmd.category === 'NAVIGATION' && <ArrowRight className={`h-4 w-4 ${selectedIndex === idx ? 'opacity-100' : 'opacity-0'}`} />}
                                                {cmd.category === 'ACTION' && <Zap className={`h-4 w-4 ${selectedIndex === idx ? 'opacity-100' : 'opacity-0'}`} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : query.length > 0 && (
                                <div className="px-2 pt-2">
                                    <button onClick={() => handleAiQuery(query)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 bg-secondary text-white font-bold shadow-glow-secondary">
                                        <Sparkles className="h-5 w-5" /> <span className="flex-1">Ask AI: "{query}"</span> <HelpCircle className="h-4 w-4 opacity-50" />
                                    </button>
                                </div>
                            )}
                            {filteredCommands.length === 0 && query.length === 0 && (
                                <div className="p-12 text-center text-on-surface-muted opacity-50"><Command className="h-16 w-16 mx-auto mb-4" /><p className="text-lg font-medium">Type a command or ask a question</p></div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
