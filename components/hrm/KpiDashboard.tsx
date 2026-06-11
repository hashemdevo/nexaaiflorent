import React, { useState, useEffect } from 'react';
import { Target, Plus, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ClientService } from '../../services/clientService';
import { ClientEmployee } from '../../types';
import { KpiObjective } from '../../services/core/types/hr';
import { KpiService } from '../../services/hrm/kpi';

export const KpiDashboard: React.FC = () => {
    const [employees, setEmployees] = useState<ClientEmployee[]>([]);
    const [kpis, setKpis] = useState<KpiObjective[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    
    const [formState, setFormState] = useState({
        employeeId: '',
        title: '',
        category: 'FINANCIAL' as KpiObjective['category'],
        targetValue: 100,
        unit: '%',
        period: 'QUARTERLY' as KpiObjective['period'],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
        weight: 25
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const emps = await ClientService.getEmployees();
            setEmployees(emps.filter(e => e.status !== 'SUSPENDED'));
            
            let allKpis: KpiObjective[] = [];
            for (const emp of emps) {
                const empKpis = await KpiService.getByEmployee(emp.id);
                allKpis = [...allKpis, ...empKpis];
            }
            setKpis(allKpis);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateKpi = async () => {
        if (!formState.employeeId || !formState.title) return;
        try {
            await KpiService.create({
                employeeId: formState.employeeId,
                title: formState.title,
                category: formState.category,
                targetValue: formState.targetValue,
                currentValue: 0,
                unit: formState.unit,
                period: formState.period,
                startDate: formState.startDate,
                endDate: formState.endDate,
                status: 'ON_TRACK',
                weight: formState.weight
            });
            setIsFormOpen(false);
            loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to create KPI");
        }
    };

    const handleUpdateProgress = async (kpiId: string, newValue: number, newStatus: KpiObjective['status']) => {
        try {
            await KpiService.updateProgress(kpiId, newValue, newStatus);
            loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to update KPI");
        }
    };

    const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || 'Unknown';

    const getStatusParams = (status: string) => {
        switch(status) {
            case 'ON_TRACK': return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: TrendingUp, label: 'On Track' };
            case 'AT_RISK': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: AlertCircle, label: 'At Risk' };
            case 'BEHIND': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: Clock, label: 'Behind' };
            case 'ACHIEVED': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle, label: 'Achieved' };
            default: return { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20', icon: Target, label: status };
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-on-surface">Organizational KPI Tracking</h2>
                    <p className="text-sm text-on-surface-muted">Monitor key performance indicators per employee</p>
                </div>
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-black font-bold px-4 py-2 rounded-xl transition flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" /> New KPI
                </button>
            </div>

            {isLoading ? (
                <div className="py-12 text-center text-on-surface-muted">Loading KPIs...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {kpis.map(kpi => {
                        const statusParams = getStatusParams(kpi.status);
                        const StatusIcon = statusParams.icon;
                        const progress = Math.min(100, Math.max(0, (kpi.currentValue / kpi.targetValue) * 100));
                        
                        return (
                            <div key={kpi.id} className="glass-panel p-5 rounded-2xl border border-border flex flex-col justify-between hover:border-primary/30 transition">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${statusParams.bg} ${statusParams.color} ${statusParams.border} flex items-center gap-1`}>
                                            <StatusIcon className="h-3 w-3" /> {statusParams.label}
                                        </div>
                                        <span className="text-xs font-mono text-on-surface-muted bg-surface px-2 py-1 rounded">W: {kpi.weight}%</span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-on-surface mb-1">{kpi.title}</h3>
                                    <p className="text-sm text-on-surface-muted mb-4">{getEmployeeName(kpi.employeeId)}</p>

                                    <div className="space-y-2 mb-6">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-on-surface-muted uppercase">{kpi.category.replace('_', ' ')}</span>
                                            <span className="font-bold text-on-surface">{kpi.currentValue} / {kpi.targetValue} {kpi.unit}</span>
                                        </div>
                                        <div className="h-2 w-full bg-surface-highlight rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : progress >= 75 ? 'bg-primary' : progress >= 40 ? 'bg-yellow-500' : 'bg-red-500'} transition-all duration-1000`} 
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 flex gap-2">
                                    <input 
                                        type="number" 
                                        className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-on-surface w-24 outline-none focus:border-primary"
                                        placeholder="Value"
                                        defaultValue={kpi.currentValue}
                                        onBlur={(e) => {
                                            if (e.target.value) {
                                                const val = parseFloat(e.target.value);
                                                let stat = kpi.status;
                                                if (val >= kpi.targetValue) stat = 'ACHIEVED';
                                                handleUpdateProgress(kpi.id, val, stat);
                                            }
                                        }}
                                    />
                                    <select 
                                        className="bg-background border border-border rounded-lg px-2 py-1.5 text-sm text-on-surface flex-1 outline-none focus:border-primary"
                                        value={kpi.status}
                                        onChange={(e) => handleUpdateProgress(kpi.id, kpi.currentValue, e.target.value as KpiObjective['status'])}
                                    >
                                        <option value="ON_TRACK">On Track</option>
                                        <option value="AT_RISK">At Risk</option>
                                        <option value="BEHIND">Behind</option>
                                        <option value="ACHIEVED">Achieved</option>
                                    </select>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isFormOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-surface w-full max-w-xl rounded-2xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-lg font-bold text-on-surface">Define New KPI Objective</h2>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <div>
                                <label className="block text-xs font-bold text-on-surface-muted mb-1">Employee</label>
                                <select 
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-on-surface"
                                    value={formState.employeeId}
                                    onChange={(e) => setFormState({...formState, employeeId: e.target.value})}
                                >
                                    <option value="">- Select -</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-muted mb-1">KPI Title</label>
                                <input 
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-on-surface"
                                    value={formState.title}
                                    placeholder="e.g. Increase Quarterly Sales"
                                    onChange={(e) => setFormState({...formState, title: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-muted mb-1">Category</label>
                                    <select 
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-on-surface"
                                        value={formState.category}
                                        onChange={(e) => setFormState({...formState, category: e.target.value as any})}
                                    >
                                        <option value="FINANCIAL">Financial</option>
                                        <option value="CUSTOMER">Customer</option>
                                        <option value="INTERNAL_PROCESS">Internal Process</option>
                                        <option value="LEARNING_GROWTH">Learning & Growth</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-muted mb-1">Period</label>
                                    <select 
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-on-surface"
                                        value={formState.period}
                                        onChange={(e) => setFormState({...formState, period: e.target.value as any})}
                                    >
                                        <option value="MONTHLY">Monthly</option>
                                        <option value="QUARTERLY">Quarterly</option>
                                        <option value="YEARLY">Yearly</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-muted mb-1">Target</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-on-surface"
                                        value={formState.targetValue}
                                        onChange={(e) => setFormState({...formState, targetValue: parseFloat(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-muted mb-1">Unit</label>
                                    <input 
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-on-surface"
                                        value={formState.unit}
                                        placeholder="%, SAR, Count"
                                        onChange={(e) => setFormState({...formState, unit: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-muted mb-1">Weight %</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-on-surface"
                                        value={formState.weight}
                                        onChange={(e) => setFormState({...formState, weight: parseFloat(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-border flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-lg hover:bg-surface">Cancel</button>
                            <button onClick={handleCreateKpi} className="bg-primary text-black font-bold px-6 py-2 rounded-lg">Create KPI</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
