
import React from 'react';
import { Send } from 'lucide-react';

export const ComposeMessage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h3 className="font-bold text-lg text-on-surface mb-4">New Message</h3>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-muted uppercase">Campaign Name</label>
                    <input type="text" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-pink-500" placeholder="e.g. Weekly Newsletter" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-muted uppercase">Channel</label>
                    <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-pink-500">
                        <option>Email</option>
                        <option>SMS</option>
                        <option>Push Notification</option>
                    </select>
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-on-surface-muted uppercase">Target Audience</label>
                    <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-on-surface outline-none focus:border-pink-500">
                        <option>All Customers</option>
                        <option>Active in last 30 days</option>
                        <option>High Value (VIP)</option>
                        <option>Churn Risk</option>
                    </select>
                </div>
                <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-on-surface-muted uppercase">Message Content</label>
                    <textarea className="w-full h-48 bg-background border border-border rounded-xl p-4 text-on-surface outline-none focus:border-pink-500 resize-none" placeholder="Type your message here... (HTML supported for Email)"></textarea>
                </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button className="px-6 py-2.5 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition">Save Draft</button>
                <button className="px-6 py-2.5 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700 transition shadow-lg flex items-center gap-2">
                    <Send className="h-4 w-4" /> Send Now
                </button>
            </div>
        </div>
    );
};
