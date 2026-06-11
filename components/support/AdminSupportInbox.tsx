
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User, Search, CheckCircle2, Shield, Mail, ArrowRightLeft, Loader2 } from 'lucide-react';
import { ChatStorageService, ChatSession, Message } from '../../services/support/chatStorage';
import { JournalService } from '../../services/ledger/journal';
import { useApp } from '../../contexts/AppContext';

export const AdminSupportInbox: React.FC<{ onClose?: () => void; embedded?: boolean }> = ({ onClose, embedded = false }) => {
    const { currentUserIdentity } = useApp();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [replyInput, setReplyInput] = useState('');
    const [refunding, setRefunding] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSessions = () => {
            const allSessions = Object.values(ChatStorageService.getSessions()).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
            setSessions(allSessions);
        };
        fetchSessions();
        const interval = setInterval(fetchSessions, 1000);
        window.addEventListener('storage', fetchSessions);
        return () => { clearInterval(interval); window.removeEventListener('storage', fetchSessions); };
    }, []);

    useEffect(() => {
        if (selectedSessionId && messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [sessions, selectedSessionId]);

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyInput.trim() || !selectedSessionId) return;
        const allSessions = ChatStorageService.getSessions();
        const session = allSessions[selectedSessionId];
        if (session) {
            const newMsg: Message = { id: Date.now().toString(), sender: 'admin', text: replyInput, timestamp: Date.now(), read: false };
            session.messages.push(newMsg);
            session.lastMessage = `You: ${replyInput}`;
            session.lastTimestamp = Date.now();
            ChatStorageService.saveSession(session);
            setReplyInput('');
        }
    };

    const markAsRead = (sessionId: string) => {
        const allSessions = ChatStorageService.getSessions();
        if (allSessions[sessionId]) {
            allSessions[sessionId].unreadCount = 0;
            ChatStorageService.saveSession(allSessions[sessionId]);
            setSelectedSessionId(sessionId);
        }
    };

    const handleIssueRefund = async (session: ChatSession) => {
        setRefunding(true);
        try {
            // Create a Journal Entry for the Refund
            const refundAmount = 50; // Mock fixed amount for demo
            await JournalService.postEntry({
                transactionDate: new Date().toISOString().split('T')[0],
                postedDate: new Date().toISOString(),
                reference: `TICKET-${session.id}`,
                description: `Customer Refund - Support Ticket: ${session.visitorName || 'Unknown'}`,
                lines: [
                    { accountId: '4100', accountName: 'Sales Returns and Allowances', debit: refundAmount, credit: 0 },
                    { accountId: '1000', accountName: 'Main Bank Account', debit: 0, credit: refundAmount }
                ],
                totalAmount: refundAmount,
                createdBy: currentUserIdentity || 'SYS_SUPPORT'
            }, null as any);

            // Add system message to chat
            const newMsg: Message = { 
                id: Date.now().toString(), 
                sender: 'admin', 
                text: `[SYSTEM]: A refund of $${refundAmount} has been processed and logged to the ledger (Ref: TICKET-${session.id}).`, 
                timestamp: Date.now(), 
                read: false 
            };
            session.messages.push(newMsg);
            session.lastMessage = `[Refund Processed]`;
            session.lastTimestamp = Date.now();
            ChatStorageService.saveSession(session);
        } catch (e) {
            console.error("Refund failed", e);
        } finally {
            setRefunding(false);
        }
    };

    const selectedSession = sessions.find(s => s.id === selectedSessionId);
    const containerClasses = embedded ? "w-full h-[600px] flex bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-lg" : "fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 md:p-8 animate-fade-in";
    const innerWrapperClasses = embedded ? "w-full h-full flex overflow-hidden" : "bg-zinc-900 w-full max-w-6xl h-[85vh] rounded-3xl border border-zinc-700 shadow-2xl flex overflow-hidden relative";

    return (
        <div className={containerClasses} dir="ltr">
            <div className={innerWrapperClasses}>
                {!embedded && onClose && <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-zinc-800 rounded-full hover:text-white"><X className="h-5 w-5" /></button>}
                <div className="w-1/3 min-w-[250px] border-r border-zinc-800 flex flex-col bg-black/20">
                    <div className="p-4 border-b border-zinc-800"><h2 className="text-xl font-bold text-white flex gap-2"><MessageCircle className="text-primary"/> Inbox</h2><div className="mt-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"/><input type="text" placeholder="Search..." className="w-full bg-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white"/></div></div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {sessions.map(session => (
                            <div key={session.id} onClick={() => markAsRead(session.id)} className={`p-4 border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/50 ${selectedSessionId === session.id ? 'bg-zinc-800/80 border-l-4 border-l-primary' : ''}`}>
                                <div className="flex justify-between mb-1"><span className={`font-bold text-sm ${session.unreadCount > 0 ? 'text-white' : 'text-zinc-400'}`}>{session.visitorName}</span>{session.unreadCount > 0 && <div className="w-2 h-2 bg-primary rounded-full"></div>}</div>
                                <div className="text-xs text-zinc-600 truncate">{session.lastMessage}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 flex flex-col bg-zinc-900 relative">
                    {selectedSession ? (
                        <>
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 shadow-md z-10 filter backdrop-blur-md">
                                <div className="flex items-center gap-4"><div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400"><User className="h-6 w-6"/></div><div><h3 className="font-bold text-white text-lg">{selectedSession.visitorName}</h3><div className="text-xs text-zinc-400 flex gap-2"><Mail className="h-3 w-3"/> {selectedSession.visitorDetails?.email}</div></div></div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => handleIssueRefund(selectedSession)}
                                        disabled={refunding}
                                        className="px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 transition rounded-lg flex items-center gap-2 text-sm font-bold border border-orange-500/20">
                                        {refunding ? <Loader2 className="h-3 w-3 animate-spin"/> : <ArrowRightLeft className="h-3 w-3"/>}
                                        Issue Refund
                                    </button>
                                    <button className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary transition rounded-lg flex gap-2 text-sm font-bold"><CheckCircle2 className="h-3 w-3"/> Resolve</button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-black/20 custom-scrollbar">
                                {selectedSession.messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[70%] px-6 py-4 rounded-3xl text-sm ${msg.sender === 'admin' ? (msg.text.includes('[SYSTEM]') ? 'bg-orange-500/20 border border-orange-500/50 text-orange-200' : 'bg-primary text-black') : 'bg-zinc-800 text-zinc-200'}`}>{msg.text}</div></div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-6 border-t border-zinc-800 bg-zinc-900"><form onSubmit={handleReply} className="flex gap-4"><input type="text" value={replyInput} onChange={(e) => setReplyInput(e.target.value)} placeholder="Type reply..." className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-6 py-4 text-white outline-none focus:border-primary" autoFocus /><button type="submit" className="bg-primary hover:bg-primary-hover text-black px-8 py-4 rounded-xl font-bold flex gap-2 transition shadow-[0_0_15px_rgba(20,241,149,0.2)]"><Send className="h-5 w-5"/> Reply</button></form></div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600"><MessageCircle className="h-16 w-16 opacity-50 mb-4"/><h3>Select a conversation</h3></div>
                    )}
                </div>
            </div>
        </div>
    );
};
