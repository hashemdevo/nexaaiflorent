
import React from 'react';
import { Search } from 'lucide-react';

const MOCK_CAMPAIGNS = [
    { id: 'CMP-001', name: 'October Sale Blast', type: 'EMAIL', audience: 'All Customers', status: 'SENT', date: 'Oct 20', sent: 1250, openRate: '24%' },
    { id: 'CMP-002', name: 'Invoice Reminders', type: 'SMS', audience: 'Overdue > 30 Days', status: 'SCHEDULED', date: 'Oct 28', sent: 45, openRate: '-' },
    { id: 'CMP-003', name: 'Holiday Welcome', type: 'EMAIL', audience: 'New Signups', status: 'DRAFT', date: '-', sent: 0, openRate: '-' },
];

export const CampaignHistory: React.FC = () => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-on-surface">Recent Campaigns</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                    <input type="text" placeholder="Search..." className="bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-on-surface outline-none focus:border-pink-500" />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-highlight text-on-surface-muted uppercase text-xs font-bold">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Campaign</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Audience</th>
                            <th className="px-4 py-3">Sent</th>
                            <th className="px-4 py-3">Engagement</th>
                            <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {MOCK_CAMPAIGNS.map(camp => (
                            <tr key={camp.id} className="hover:bg-surface-highlight/20 transition">
                                <td className="px-4 py-3">
                                    <div className="font-bold text-on-surface">{camp.name}</div>
                                    <div className="text-xs text-on-surface-muted font-mono">{camp.date}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${camp.type === 'EMAIL' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                                        {camp.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-on-surface-muted">{camp.audience}</td>
                                <td className="px-4 py-3 font-mono">{camp.sent}</td>
                                <td className="px-4 py-3 text-emerald-500 font-bold">{camp.openRate}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`text-xs font-bold uppercase ${camp.status === 'SENT' ? 'text-secondary' : camp.status === 'SCHEDULED' ? 'text-warning' : 'text-on-surface-muted'}`}>
                                        {camp.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
