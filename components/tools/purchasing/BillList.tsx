
import React from 'react';
import { TrendingUp } from 'lucide-react';

const MOCK_BILLS = [
    { id: 'BILL-992', vendor: 'Global Coffee Supply', date: 'Oct 10', due: 'Nov 10', amount: 1200, status: 'OPEN' },
    { id: 'BILL-993', vendor: 'Fresh Farms Ltd.', date: 'Oct 15', due: 'Oct 30', amount: 450, status: 'OPEN' },
    { id: 'BILL-801', vendor: 'Power Utility Corp', date: 'Sep 28', due: 'Oct 28', amount: 320, status: 'PAID' },
];

export const BillList: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h4 className="text-xs font-bold text-on-surface-muted uppercase mb-2">Total Payables</h4>
                    <div className="text-3xl font-bold text-on-surface flex items-center gap-2">
                        $1,650 <TrendingUp className="h-5 w-5 text-warning" />
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h4 className="text-xs font-bold text-on-surface-muted uppercase mb-2">Overdue</h4>
                    <div className="text-3xl font-bold text-danger">$0.00</div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-border flex items-center justify-between">
                    <div>
                        <h4 className="text-xs font-bold text-on-surface-muted uppercase mb-1">Cash Available</h4>
                        <div className="text-xl font-bold text-emerald-500">$45,200</div>
                    </div>
                    <button className="text-xs bg-surface-highlight px-3 py-1.5 rounded-lg border border-border hover:bg-surface text-on-surface transition">View Cash Flow</button>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-border">
                <h3 className="font-bold text-lg text-on-surface mb-4">Open Bills</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-surface-highlight text-on-surface-muted uppercase text-xs font-bold">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Bill ID</th>
                                <th className="px-4 py-3">Vendor</th>
                                <th className="px-4 py-3">Due Date</th>
                                <th className="px-4 py-3 text-right">Amount</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right rounded-r-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {MOCK_BILLS.map(bill => (
                                <tr key={bill.id} className="hover:bg-surface-highlight/20 transition">
                                    <td className="px-4 py-3 font-mono text-xs">{bill.id}</td>
                                    <td className="px-4 py-3 font-bold text-on-surface">{bill.vendor}</td>
                                    <td className="px-4 py-3 text-on-surface-muted">{bill.due}</td>
                                    <td className="px-4 py-3 text-right font-mono font-bold">${bill.amount.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                            bill.status === 'OPEN' ? 'bg-warning/10 text-warning' : 'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                            {bill.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {bill.status === 'OPEN' && (
                                            <button className="text-xs font-bold text-emerald-500 hover:underline">Pay Now</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
