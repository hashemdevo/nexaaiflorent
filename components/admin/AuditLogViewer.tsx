
import React, { useState } from 'react';
import { History, Search, ShieldCheck } from 'lucide-react';
import { AuditLogEntry } from '../../types';

export const AuditLogViewer: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredLogs = logs.filter(log => 
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort Newest First

    const getActionColor = (action: string) => {
        switch (action) {
            case 'LOGIN': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'SECURITY': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'APPROVE': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'CREATE': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'REJECT': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
        }
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto space-y-6 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <History className="h-8 w-8 text-primary" /> Audit Trail
                    </h2>
                    <p className="text-zinc-400 mt-1">Review administrative actions and security events.</p>
                </div>
                <div className="relative w-full md:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input 
                        type="text" 
                        placeholder="Search user, action, or target..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-primary" 
                    />
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-950 border-b border-zinc-800 text-zinc-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Actor</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Target Object</th>
                                <th className="px-6 py-4">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                        <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        No audit records found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-zinc-800/30 transition">
                                        <td className="px-6 py-4 font-mono text-zinc-400 text-xs">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">
                                                    {log.actorName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-white">{log.actorName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-300 font-mono text-xs">
                                            {log.target}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 italic max-w-xs truncate">
                                            {log.details || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
