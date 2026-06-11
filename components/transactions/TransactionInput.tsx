import React, { useRef, useState } from 'react';
import { Upload, Mic, Type, Scan, FileText, Loader2, PenTool, Bot, ChevronRight, ArrowRight } from 'lucide-react';
import { ManualJournalForm } from './ManualJournalForm';
import { AIAnalysisResult } from '../../types';

interface InputMethodsProps {
    onAnalyze: (type: 'TEXT' | 'IMAGE' | 'AUDIO', content: string, mime?: string) => void;
    onManualSubmit: (data: AIAnalysisResult) => void;
    isProcessing: boolean;
}

type EntryMode = 'AI' | 'MANUAL';
type AiMethod = 'SCAN' | 'TEXT' | 'VOICE';

export const TransactionInput: React.FC<InputMethodsProps> = ({ onAnalyze, onManualSubmit, isProcessing }) => {
    const [entryMode, setEntryMode] = useState<EntryMode>('AI');
    const [aiMethod, setAiMethod] = useState<AiMethod>('SCAN');
    
    const [textInput, setTextInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Audio State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // --- Handlers ---

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64Result = ev.target?.result as string;
                const base64Data = base64Result.split(',')[1];
                const mimeType = file.type;
                onAnalyze('IMAGE', base64Data, mimeType);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleTextSubmit = () => {
        if (!textInput.trim()) return;
        onAnalyze('TEXT', textInput);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    onAnalyze('AUDIO', base64String, 'audio/mp3');
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            alert("Microphone access denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            
            {/* 1. Top Level Mode Selection */}
            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => setEntryMode('MANUAL')}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${entryMode === 'MANUAL' ? 'border-primary bg-primary/5 shadow-glow-primary' : 'border-border bg-surface hover:border-primary/50'}`}
                >
                    <div className={`p-3 rounded-full transition-colors ${entryMode === 'MANUAL' ? 'bg-primary text-black' : 'bg-surface-highlight text-on-surface-muted group-hover:text-primary'}`}>
                        <PenTool className="h-6 w-6" />
                    </div>
                    <div>
                        <span className={`block font-bold text-sm ${entryMode === 'MANUAL' ? 'text-primary' : 'text-on-surface'}`}>Manual Journal</span>
                        <span className="text-xs text-on-surface-muted mt-1 block">Traditional Debit/Credit Entry</span>
                    </div>
                    {entryMode === 'MANUAL' && <div className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full animate-pulse"></div>}
                </button>

                <button 
                    onClick={() => setEntryMode('AI')}
                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${entryMode === 'AI' ? 'border-secondary bg-secondary/5 shadow-glow-secondary' : 'border-border bg-surface hover:border-secondary/50'}`}
                >
                    <div className={`p-3 rounded-full transition-colors ${entryMode === 'AI' ? 'bg-secondary text-white' : 'bg-surface-highlight text-on-surface-muted group-hover:text-secondary'}`}>
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <span className={`block font-bold text-sm ${entryMode === 'AI' ? 'text-secondary' : 'text-on-surface'}`}>AI Automation</span>
                        <span className="text-xs text-on-surface-muted mt-1 block">Scan, Voice, or Text</span>
                    </div>
                    {entryMode === 'AI' && <div className="absolute top-3 right-3 w-3 h-3 bg-secondary rounded-full animate-pulse"></div>}
                </button>
            </div>

            {/* 2. Content Area Based on Mode */}
            <div className="flex-1 flex flex-col min-h-0">
                
                {/* --- MANUAL MODE --- */}
                {entryMode === 'MANUAL' && (
                    <div className="h-full flex flex-col animate-fade-in">
                        <ManualJournalForm onSubmit={onManualSubmit} />
                    </div>
                )}

                {/* --- AI MODE --- */}
                {entryMode === 'AI' && (
                    <div className="flex flex-col h-full animate-fade-in">
                        {/* AI Sub-Tabs */}
                        <div className="flex justify-center gap-2 mb-6 bg-surface-highlight/30 p-1 rounded-xl w-fit mx-auto border border-border">
                            {[
                                { id: 'SCAN', label: 'Scan Document', icon: Scan },
                                { id: 'TEXT', label: 'Text Description', icon: Type },
                                { id: 'VOICE', label: 'Voice Command', icon: Mic }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setAiMethod(method.id as AiMethod)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${aiMethod === method.id ? 'bg-secondary text-white shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`}
                                >
                                    <method.icon className="h-4 w-4" /> {method.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 bg-surface border border-border rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                            {/* Dynamic AI Content */}
                            
                            {/* SCAN */}
                            {aiMethod === 'SCAN' && (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-surface-highlight/20 transition group p-8"
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*,application/pdf"
                                        onChange={handleFileSelect}
                                    />
                                    <div className="w-24 h-24 bg-surface-highlight rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-inner">
                                        {isProcessing ? <Loader2 className="h-10 w-10 text-secondary animate-spin" /> : <Upload className="h-10 w-10 text-secondary" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-on-surface">
                                        {isProcessing ? 'Analyzing Document...' : 'Upload Invoice or Receipt'}
                                    </h3>
                                    <p className="text-on-surface-muted mt-2 text-center max-w-sm">
                                        Drop your file here or click to browse. The AI will extract financial data automatically.
                                    </p>
                                </div>
                            )}

                            {/* TEXT */}
                            {aiMethod === 'TEXT' && (
                                <div className="w-full h-full p-8 flex flex-col">
                                    <textarea 
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Example: 'Paid $4,500 to Delta Construction for Office Renovation on 25th Oct via Bank Transfer'"
                                        className="flex-1 w-full bg-background border border-border rounded-xl p-6 text-lg text-on-surface outline-none focus:border-secondary transition resize-none placeholder:text-on-surface-muted/30 leading-relaxed"
                                    />
                                    <div className="mt-4 flex justify-end">
                                        <button 
                                            onClick={handleTextSubmit}
                                            disabled={isProcessing || !textInput.trim()}
                                            className="px-8 py-4 bg-secondary text-white font-bold rounded-xl shadow-glow-secondary hover:bg-secondary/90 transition flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><FileText className="h-5 w-5" /> Analyze Text</>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* VOICE */}
                            {aiMethod === 'VOICE' && (
                                <div className="w-full h-full flex flex-col items-center justify-center p-8">
                                    <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer ${isRecording ? 'bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.4)] scale-110 border-2 border-red-500' : 'bg-surface-highlight border-2 border-border hover:border-secondary'}`} onClick={isRecording ? stopRecording : startRecording}>
                                        {isProcessing ? (
                                            <Loader2 className="h-12 w-12 text-secondary animate-spin" />
                                        ) : isRecording ? (
                                            <Mic className="h-12 w-12 text-red-500 animate-pulse" />
                                        ) : (
                                            <Mic className="h-12 w-12 text-on-surface-muted" />
                                        )}
                                    </div>
                                    
                                    <div className="text-center mt-8">
                                        <h3 className="text-2xl font-bold text-on-surface mb-2">
                                            {isProcessing ? 'Processing Audio...' : isRecording ? 'Listening...' : 'Click Mic to Record'}
                                        </h3>
                                        <p className="text-on-surface-muted max-w-xs mx-auto">
                                            {isRecording ? 'Speak clearly describing the transaction details.' : 'Describe the transaction naturally. The AI will convert speech to ledger entry.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
