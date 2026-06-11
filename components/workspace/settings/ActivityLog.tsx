
import React, { useEffect, useState } from 'react';
import { Activity, Search } from 'lucide-react';
import { ClientService } from '../../../services/clientService';
import { ClientActivityLog } from '../../../types';

export const ActivityLog: React.FC = () => {
    const [logs, setLogs] = useState<ClientActivityLog[]>([]);

    useEffect(() => {
        ClientService.getLogs()
            .then(data => {
                if (Array.isArray(data)) {
                    setLogs(data);
                }
            })
            .catch(err => {
                console.error("Error loaded logs: ", err);
            });
    }, []);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Activity Log
            </h3>

            <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-surface-highlight text-on-surface-muted text-xs font-bold uppercase sticky top-0">
                            <tr>
                                <th className="px-4 py-3">Time</th>
                                <th className="px-4 py-3">User</th>
                                <th className="px-4 py-3">Action</th>
                                <th className="px-4 py-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-on-surface-muted">No recent activity recorded.</td>
                                </tr>
                            ) : logs.map(log => (
                                <tr key={log.id} className="hover:bg-surface-highlight/20">
                                    <td className="px-4 py-3 font-mono text-xs text-on-surface-muted">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-on-surface">{log.actor}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-surface-highlight border border-border px-2 py-0.5 rounded text-[10px] uppercase font-bold text-on-surface">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-on-surface-muted truncate max-w-[200px]">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
