
import React, { useState } from 'react';
import { Calendar, Clock, User, CheckCircle2, MoreHorizontal, Plus, Search, ChevronRight, ChevronLeft, CreditCard } from 'lucide-react';

const MOCK_APPOINTMENTS = [
    { id: 'APT-101', time: '09:00 AM', patient: 'Sarah Connor', type: 'Consultation', status: 'CHECKED_IN', doctor: 'Dr. Samy' },
    { id: 'APT-102', time: '09:30 AM', patient: 'John Doe', type: 'Follow-up', status: 'CONFIRMED', doctor: 'Dr. Samy' },
    { id: 'APT-103', time: '10:00 AM', patient: 'Jane Smith', type: 'Checkup', status: 'CANCELLED', doctor: 'Dr. Samy' },
    { id: 'APT-104', time: '10:30 AM', patient: 'Michael Knight', type: 'Emergency', status: 'WAITING', doctor: 'Dr. Samy' },
    { id: 'APT-105', time: '11:00 AM', patient: '-', type: 'Available', status: 'FREE', doctor: 'Dr. Samy' },
];

export const ClinicScheduler: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-cyan-500" /> Clinic Scheduler
                    </h1>
                    <p className="text-on-surface-muted mt-1">Manage doctor schedules, patient check-ins, and daily flow.</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-xl">
                        <button className="p-1 hover:bg-surface-highlight rounded"><ChevronLeft className="h-4 w-4" /></button>
                        <span className="font-bold text-on-surface w-32 text-center">{selectedDate.toDateString()}</span>
                        <button className="p-1 hover:bg-surface-highlight rounded"><ChevronRight className="h-4 w-4" /></button>
                    </div>
                    <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Book Appointment
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Schedule List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="glass-panel p-6 rounded-2xl border border-border">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-on-surface">Dr. Samy's Schedule</h3>
                            <div className="flex gap-2">
                                <span className="flex items-center gap-1 text-xs text-secondary bg-secondary/10 px-2 py-1 rounded"><CheckCircle2 className="h-3 w-3" /> 2 Checked In</span>
                                <span className="flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded"><Clock className="h-3 w-3" /> 1 Waiting</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {MOCK_APPOINTMENTS.map((apt, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 rounded-xl border transition ${
                                    apt.status === 'FREE' ? 'border-dashed border-border bg-transparent hover:bg-surface-highlight/30' : 
                                    'border-border bg-surface hover:border-cyan-500/30'
                                }`}>
                                    <div className="flex items-center gap-6">
                                        <span className="font-mono font-bold text-on-surface w-20">{apt.time}</span>
                                        {apt.status === 'FREE' ? (
                                            <span className="text-on-surface-muted italic text-sm">Available Slot</span>
                                        ) : (
                                            <div>
                                                <h4 className="font-bold text-on-surface text-sm">{apt.patient}</h4>
                                                <p className="text-xs text-on-surface-muted">{apt.type}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {apt.status !== 'FREE' && (
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                                apt.status === 'CHECKED_IN' ? 'bg-secondary/10 text-secondary' :
                                                apt.status === 'WAITING' ? 'bg-warning/10 text-warning' :
                                                apt.status === 'CANCELLED' ? 'bg-danger/10 text-danger' :
                                                'bg-surface-highlight text-on-surface-muted'
                                            }`}>
                                                {apt.status.replace('_', ' ')}
                                            </span>
                                        )}
                                        {apt.status === 'FREE' ? (
                                            <button className="text-xs font-bold text-cyan-500 hover:underline">Book Slot</button>
                                        ) : (
                                            <button className="text-on-surface-muted hover:text-on-surface">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Quick Actions & Billing */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-border">
                        <h3 className="font-bold text-lg text-on-surface mb-4">Patient Queue</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-surface/50 rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-xs">1</div>
                                    <div>
                                        <p className="font-bold text-sm text-on-surface">Michael Knight</p>
                                        <p className="text-xs text-on-surface-muted">Waiting: 15m</p>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-cyan-500 border border-cyan-500/30 px-3 py-1.5 rounded-lg hover:bg-cyan-500/10">Call In</button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-surface/50 rounded-xl border border-border opacity-60">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-surface-highlight text-on-surface flex items-center justify-center font-bold text-xs">2</div>
                                    <div>
                                        <p className="font-bold text-sm text-on-surface">Sarah Connor</p>
                                        <p className="text-xs text-on-surface-muted">With Doctor</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-border bg-gradient-to-br from-cyan-900/10 to-transparent">
                        <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-secondary" /> Quick Billing
                        </h3>
                        <div className="space-y-4">
                            <select className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-on-surface outline-none">
                                <option>General Consultation ($50)</option>
                                <option>Follow-up ($30)</option>
                                <option>Specialist Checkup ($100)</option>
                            </select>
                            <button className="w-full py-3 bg-secondary text-white font-bold rounded-xl shadow-glow-secondary hover:bg-secondary/90 transition">
                                Generate Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
