
import React from 'react';
import { FileText } from 'lucide-react';

export const MessageTemplates: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Welcome Email', 'Invoice Reminder', 'Seasonal Sale', 'Dunning Notice', 'Product Launch'].map((tpl, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-surface/50 hover:border-pink-500/50 transition cursor-pointer group">
                    <div className="p-3 bg-pink-500/10 rounded-lg text-pink-500 w-fit mb-3">
                        <FileText className="h-6 w-6" />
                    </div>
                    <h4 className="font-bold text-on-surface">{tpl}</h4>
                    <p className="text-xs text-on-surface-muted mt-1">Last edited 2 days ago</p>
                    <button className="mt-4 text-xs font-bold text-pink-500 opacity-0 group-hover:opacity-100 transition">Use Template →</button>
                </div>
            ))}
        </div>
    );
};
