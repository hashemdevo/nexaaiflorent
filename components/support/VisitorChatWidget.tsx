
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, ArrowRight } from 'lucide-react';
import { ChatStorageService, Message, ChatSession } from '../../services/support/chatStorage';

export const VisitorChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [visitorId] = useState(ChatStorageService.getVisitorId());
    const [messages, setMessages] = useState<Message[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [detailsForm, setDetailsForm] = useState({ name: '', email: '', phone: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const syncChat = () => {
            const sessions = ChatStorageService.getSessions();
            const mySession = sessions[visitorId];
            if (mySession) {
                if (mySession.visitorDetails) setIsRegistered(true);
                setMessages(prev => {
                    if (prev.length !== mySession.messages.length) {
                        const lastMsg = mySession.messages[mySession.messages.length - 1];
                        if (lastMsg && lastMsg.sender === 'admin' && !isOpen) setHasUnread(true);
                        return mySession.messages;
                    }
                    return prev;
                });
            }
        };
        syncChat();
        const interval = setInterval(syncChat, 1000);
        window.addEventListener('storage', syncChat);
        return () => { clearInterval(interval); window.removeEventListener('storage', syncChat); };
    }, [visitorId, isOpen]);

    useEffect(() => {
        if (isOpen && isRegistered && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setHasUnread(false);
        }
    }, [messages, isOpen, isRegistered]);

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!detailsForm.name || !detailsForm.email) return;
        const currentSession: ChatSession = ChatStorageService.getSessions()[visitorId] || {
            id: visitorId, visitorName: detailsForm.name, visitorDetails: detailsForm,
            messages: [], unreadCount: 0, lastMessage: 'Chat initialized', lastTimestamp: Date.now()
        };
        currentSession.visitorDetails = detailsForm;
        currentSession.visitorName = detailsForm.name;
        ChatStorageService.saveSession(currentSession);
        setIsRegistered(true);
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;
        const newMessage: Message = { id: Date.now().toString(), sender: 'visitor', text: input, timestamp: Date.now(), read: false };
        const currentSession = ChatStorageService.getSessions()[visitorId] || {
            id: visitorId, visitorName: detailsForm.name || `Guest`, visitorDetails: isRegistered ? undefined : detailsForm,
            messages: [], unreadCount: 0, lastMessage: '', lastTimestamp: Date.now()
        };
        currentSession.messages.push(newMessage);
        currentSession.lastMessage = input;
        currentSession.lastTimestamp = Date.now();
        currentSession.unreadCount += 1;
        ChatStorageService.saveSession(currentSession);
        setInput('');
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans flex flex-col items-end pointer-events-none">
            {isOpen && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-[350px] h-[500px] flex flex-col overflow-hidden mb-4 pointer-events-auto animate-fade-in origin-bottom-right">
                    <div className="bg-zinc-800 p-4 flex justify-between items-center border-b border-zinc-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-black font-bold">NL</div>
                            <div><h3 className="font-bold text-white text-sm">Nexa Support</h3><div className="flex items-center gap-1 text-[10px] text-zinc-400"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</div></div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white"><Minimize2 className="h-5 w-5" /></button>
                    </div>
                    {!isRegistered ? (
                        <div className="flex-1 bg-zinc-900 p-6 flex flex-col justify-center space-y-6">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <input required type="text" value={detailsForm.name} onChange={e => setDetailsForm({...detailsForm, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white" placeholder="Name" />
                                <input required type="email" value={detailsForm.email} onChange={e => setDetailsForm({...detailsForm, email: e.target.value})} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white" placeholder="Email" />
                                <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">Start Chat <ArrowRight className="h-4 w-4" /></button>
                            </form>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/95">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${msg.sender === 'visitor' ? 'bg-primary text-black' : 'bg-zinc-800 text-zinc-200'}`}>{msg.text}</div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSend} className="p-3 bg-zinc-800 border-t border-zinc-700 flex gap-2">
                                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-zinc-900 border border-zinc-600 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-primary" />
                                <button type="submit" className="bg-primary hover:bg-primary-hover text-black p-2.5 rounded-xl"><Send className="h-5 w-5" /></button>
                            </form>
                        </>
                    )}
                </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative group ${isOpen ? 'bg-zinc-800 text-white' : 'bg-primary text-black hover:scale-110'}`}>
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
                {!isOpen && hasUnread && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-bounce">1</span>}
            </button>
        </div>
    );
};
