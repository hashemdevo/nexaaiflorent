
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users, Clock, TrendingUp, Calendar, ArrowRight, Brain, AlertOctagon, Link as LinkIcon, Fingerprint } from 'lucide-react';
import { db } from '../../services/firebaseConfig';
import { collection, query, getDocs, addDoc, updateDoc, doc, where, orderBy, setDoc } from 'firebase/firestore';
import { useApp } from '../../contexts/AppContext';
import { ClientEmployee } from '../../types';
import { ClientService } from '../../services/clientService';

interface Shift {
    id?: string;
    employeeId: string;
    date: string;
    type: 'MORNING' | 'EVENING' | 'NIGHT';
    startTime: string;
    endTime: string;
    actualClockIn?: string;
    actualClockOut?: string;
    status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'MISSED';
    baseHours: number;
    overtimeHours: number;
}

export const RetailShift: React.FC = () => {
    const { currentUserIdentity } = useApp();
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<ClientEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiPeakSuggestions, setAiPeakSuggestions] = useState("");
    const [isBiometricSimulating, setBiometricSimulating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const emps = await ClientService.getEmployees();
            setEmployees(emps);
            
            const today = new Date().toISOString().split('T')[0];
            const q = query(collection(db, 'retail_shifts'), where('date', '==', today));
            const snap = await getDocs(q);
            let loadedShifts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Shift));

            // If empty, seed mock shifts for today
            if (loadedShifts.length === 0 && emps.length > 0) {
                const initShift: Shift = {
                    employeeId: emps[0].id,
                    date: today,
                    type: 'MORNING',
                    startTime: '08:00',
                    endTime: '16:00',
                    status: 'SCHEDULED',
                    baseHours: 8,
                    overtimeHours: 0
                };
                const docRef = await addDoc(collection(db, 'retail_shifts'), initShift);
                loadedShifts.push({ ...initShift, id: docRef.id });
            }

            setShifts(loadedShifts);
            
            // Build AI suggestions
            setAiPeakSuggestions("AI Analytics: High foot traffic expected between 18:00 - 20:00. Recommend assigning 2 extra staff. Overtime cost estimated at $85.");
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateBiometricClockIn = async (shift: Shift) => {
        if (!shift.id) return;
        setBiometricSimulating(true);
        setTimeout(async () => {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            await updateDoc(doc(db, 'retail_shifts', shift.id), {
                status: 'ACTIVE',
                actualClockIn: timeStr
            });
            await loadData();
            setBiometricSimulating(false);
        }, 1500);
    };

    const handleClockOut = async (shift: Shift) => {
        if (!shift.id || !shift.actualClockIn) return;
        
        // Calculate overtime
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Simplified OT calc for demo
        const scheduledOutTime = new Date();
        const [h, m] = shift.endTime.split(':');
        scheduledOutTime.setHours(parseInt(h), parseInt(m), 0);
        
        let otHours = 0;
        if (now > scheduledOutTime) {
            const diffMs = now.getTime() - scheduledOutTime.getTime();
            otHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
        }

        await updateDoc(doc(db, 'retail_shifts', shift.id), {
            status: 'COMPLETED',
            actualClockOut: timeStr,
            overtimeHours: otHours
        });
        await loadData();
    };

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col font-sans" dir="ltr">
            <div className="flex justify-between items-center mb-2 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-indigo-500" /> Retail Shift Manager
                    </h1>
                    <p className="text-on-surface-muted mt-1">Biometric time tracking, AI peak scheduling, and overtime management.</p>
                </div>
                <div className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-xl">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                    <span className="font-bold text-on-surface">Today, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 shrink-0">
                {/* Active Shifts Block */}
                <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-surface/5 relative overflow-hidden md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                            <Clock className="h-5 w-5 text-indigo-500" /> Live Shifts & Biometrics
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {loading ? <div className="text-on-surface-muted">Loading...</div> : shifts.map(shift => {
                            const emp = employees.find(e => e.id === shift.employeeId);
                            return (
                                <div key={shift.id} className="flex justify-between items-center p-4 bg-surface rounded-xl border border-border border-l-4 border-l-primary shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center font-bold text-on-surface">
                                            {emp?.name.substring(0, 2).toUpperCase() || 'UK'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-on-surface">{emp?.name || 'Unknown'}</p>
                                            <p className="text-xs text-on-surface-muted flex gap-2 items-center">
                                                <span>Scheduled: {shift.startTime} - {shift.endTime}</span>
                                                {shift.overtimeHours > 0 && <span className="text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded">+{shift.overtimeHours} OT</span>}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {shift.status === 'SCHEDULED' && (
                                            <button 
                                                onClick={() => handleSimulateBiometricClockIn(shift)}
                                                disabled={isBiometricSimulating}
                                                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold px-4 py-2 rounded-lg border border-indigo-500/30 transition flex items-center gap-2 text-sm"
                                            >
                                                {isBiometricSimulating ? <Brain className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
                                                Terminal Scan
                                            </button>
                                        )}
                                        {shift.status === 'ACTIVE' && (
                                            <>
                                                <div className="text-xs text-emerald-500 font-bold flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> In: {shift.actualClockIn}
                                                </div>
                                                <button 
                                                    onClick={() => handleClockOut(shift)}
                                                    className="bg-surface hover:bg-red-500/20 text-on-surface hover:text-red-500 font-bold px-4 py-2 rounded-lg border border-border transition text-sm"
                                                >
                                                    Clock Out
                                                </button>
                                            </>
                                        )}
                                        {shift.status === 'COMPLETED' && (
                                            <div className="text-xs text-on-surface-muted font-bold flex items-center gap-2 px-3 py-1.5 bg-surface-highlight rounded-lg">
                                                Done (In: {shift.actualClockIn} - Out: {shift.actualClockOut})
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {shifts.length === 0 && !loading && (
                            <div className="text-center p-8 bg-surface border border-dashed border-border rounded-xl">
                                <p className="text-on-surface-muted">No shifts scheduled for today.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI & Reporting Block */}
                <div className="glass-panel p-6 rounded-2xl border border-primary/30 flex flex-col justify-between shadow-[0_0_15px_rgba(20,241,149,0.05)]">
                    <div>
                        <h3 className="font-bold text-lg text-on-surface flex items-center gap-2 mb-4">
                            <Brain className="h-5 w-5 text-primary" /> AI Peak Forecast
                        </h3>
                        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl mb-4">
                            <p className="text-sm text-on-surface leading-relaxed">
                                {aiPeakSuggestions}
                            </p>
                        </div>
                    </div>
                    
                    <button className="w-full py-3 border border-border bg-surface hover:border-primary/50 rounded-xl font-bold text-sm text-on-surface transition flex items-center justify-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" /> Generate Rota
                    </button>
                </div>
            </div>
        </div>
    );
};
