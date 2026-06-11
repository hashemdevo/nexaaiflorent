
import React, { useRef, useState } from 'react';
import { Upload, Mic, Type, Scan, FileText, Loader2 } from 'lucide-react';

interface AIInputFormProps {
    onAnalyze: (type: 'TEXT' | 'IMAGE' | 'AUDIO', content: string, mime?: string) => void;
    isProcessing: boolean;
}

type AiMethod = 'SCAN' | 'TEXT' | 'VOICE';

export const AIInputForm: React.FC<AIInputFormProps> = ({ onAnalyze, isProcessing }) => {
    const [aiMethod, setAiMethod] = useState<AiMethod>('SCAN');
    
    const [textInput, setTextInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

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
        if (!textInput.trim() || isProcessing) return;
        onAnalyze('TEXT', textInput);
    };

    const startRecording = async () => {
        if (isProcessing) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64String = (reader.result as string).split(',')[1];
                    onAnalyze('AUDIO', base64String, 'audio/webm');
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            alert("Microphone access denied. Please enable it in your browser settings.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
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
                {aiMethod === 'SCAN' && (
                    <div onClick={() => !isProcessing && fileInputRef.current?.click()} className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-surface-highlight/20 transition group p-8">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileSelect} disabled={isProcessing} />
                        <div className="w-24 h-24 bg-surface-highlight rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition shadow-inner">
                            {isProcessing ? <Loader2 className="h-10 w-10 text-secondary animate-spin" /> : <Upload className="h-10 w-10 text-secondary" />}
                        </div>
                        <h3 className="text-xl font-bold text-on-surface">{isProcessing ? 'Analyzing Document...' : 'Upload Invoice or Receipt'}</h3>
                        <p className="text-on-surface-muted mt-2 text-center max-w-sm">The AI will extract financial data automatically.</p>
                    </div>
                )}
                {aiMethod === 'TEXT' && (
                    <div className="w-full h-full p-8 flex flex-col">
                        <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder="e.g., 'Paid $4,500 to Delta Construction for Office Renovation on 25th Oct via Bank Transfer'" className="flex-1 w-full bg-background border border-border rounded-xl p-6 text-lg text-on-surface outline-none focus:border-secondary transition resize-none placeholder:text-on-surface-muted/30 leading-relaxed" disabled={isProcessing} />
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleTextSubmit} disabled={isProcessing || !textInput.trim()} className="px-8 py-4 bg-secondary text-white font-bold rounded-xl shadow-glow-secondary hover:bg-secondary/90 transition flex items-center gap-2 disabled:opacity-50">
                                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><FileText className="h-5 w-5" /> Analyze Text</>}
                            </button>
                        </div>
                    </div>
                )}
                {aiMethod === 'VOICE' && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer ${isRecording ? 'bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.4)] scale-110 border-2 border-red-500' : 'bg-surface-highlight border-2 border-border hover:border-secondary'}`} onClick={isRecording ? stopRecording : startRecording}>
                            {isProcessing ? <Loader2 className="h-12 w-12 text-secondary animate-spin" /> : isRecording ? <Mic className="h-12 w-12 text-red-500 animate-pulse" /> : <Mic className="h-12 w-12 text-on-surface-muted" />}
                        </div>
                        <div className="text-center mt-8">
                            <h3 className="text-2xl font-bold text-on-surface mb-2">{isProcessing ? 'Processing Audio...' : isRecording ? 'Listening...' : 'Click Mic to Record'}</h3>
                            <p className="text-on-surface-muted max-w-xs mx-auto">{isRecording ? 'Speak clearly describing the transaction details.' : 'The AI will convert your speech to a ledger entry.'}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
