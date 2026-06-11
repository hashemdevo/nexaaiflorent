
import React, { useState } from 'react';
import { Mail, Send, History, FileText, Plus } from 'lucide-react';
import { CampaignHistory } from './communication/CampaignHistory';
import { ComposeMessage } from './communication/ComposeMessage';
import { MessageTemplates } from './communication/MessageTemplates';

export const CommunicationHub: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'COMPOSE' | 'HISTORY' | 'TEMPLATES'>('HISTORY');

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Mail className="h-8 w-8 text-pink-500" /> Communication Center
                    </h1>
                    <p className="text-on-surface-muted mt-1">Manage marketing campaigns, notifications, and alerts.</p>
                </div>
                <button 
                    onClick={() => setActiveTab('COMPOSE')}
                    className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Nav */}
                <div className="space-y-2">
                    <button 
                        onClick={() => setActiveTab('HISTORY')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === 'HISTORY' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'text-on-surface-muted hover:bg-surface-highlight'}`}
                    >
                        <History className="h-4 w-4" /> Campaign History
                    </button>
                    <button 
                        onClick={() => setActiveTab('COMPOSE')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === 'COMPOSE' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'text-on-surface-muted hover:bg-surface-highlight'}`}
                    >
                        <Send className="h-4 w-4" /> Compose
                    </button>
                    <button 
                        onClick={() => setActiveTab('TEMPLATES')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${activeTab === 'TEMPLATES' ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'text-on-surface-muted hover:bg-surface-highlight'}`}
                    >
                        <FileText className="h-4 w-4" /> Templates
                    </button>
                </div>

                {/* Main Area */}
                <div className="lg:col-span-3">
                    <div className="glass-panel p-6 rounded-2xl border border-border min-h-[500px]">
                        {activeTab === 'HISTORY' && <CampaignHistory />}
                        {activeTab === 'COMPOSE' && <ComposeMessage />}
                        {activeTab === 'TEMPLATES' && <MessageTemplates />}
                    </div>
                </div>
            </div>
        </div>
    );
};
