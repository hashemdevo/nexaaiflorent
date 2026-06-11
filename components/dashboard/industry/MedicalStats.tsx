
import React from 'react';
import { UserCheck, Activity, Syringe, HeartPulse, Stethoscope, Calendar, LayoutGrid, List } from 'lucide-react';

export const MedicalStats: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-cyan-500">Patients Today</h4>
                        <UserCheck className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">42</div>
                    <p className="text-xs text-on-surface-muted">12 New Admissions</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-on-surface">Bed Occupancy</h4>
                        <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">78%</div>
                    <p className="text-xs text-on-surface-muted">ICU: 90% Full</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-on-surface">Surgeries</h4>
                        <Syringe className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">5</div>
                    <p className="text-xs text-on-surface-muted">Scheduled Today</p>
                </div>
                <div className="glass-panel p-4 rounded-xl border border-danger/20 bg-danger/5">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-danger">Critical Alerts</h4>
                        <HeartPulse className="h-5 w-5 text-danger animate-pulse" />
                    </div>
                    <div className="text-2xl font-bold text-on-surface">1</div>
                    <p className="text-xs text-on-surface-muted">Room 302 - Code Blue</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                        <Stethoscope className="h-5 w-5 text-primary" /> Upcoming Appointments
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-surface-highlight text-on-surface-muted text-xs font-bold uppercase">
                                <tr>
                                    <th className="px-4 py-2 rounded-l-lg">Time</th>
                                    <th className="px-4 py-2">Patient</th>
                                    <th className="px-4 py-2">Doctor</th>
                                    <th className="px-4 py-2">Department</th>
                                    <th className="px-4 py-2 rounded-r-lg text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { time: '09:00 AM', patient: 'Sarah Connor', dr: 'Dr. Samy', dept: 'Cardiology', status: 'Checked In' },
                                    { time: '09:30 AM', patient: 'John Doe', dr: 'Dr. House', dept: 'Internal Med', status: 'Waiting' },
                                    { time: '10:15 AM', patient: 'Jane Smith', dr: 'Dr. Strange', dept: 'Neurology', status: 'Confirmed' },
                                ].map((appt, i) => (
                                    <tr key={i} className="hover:bg-surface-highlight/20">
                                        <td className="px-4 py-3 font-mono text-xs">{appt.time}</td>
                                        <td className="px-4 py-3 font-bold text-on-surface">{appt.patient}</td>
                                        <td className="px-4 py-3">{appt.dr}</td>
                                        <td className="px-4 py-3 text-on-surface-muted">{appt.dept}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                appt.status === 'Checked In' ? 'bg-secondary/10 text-secondary' : 'bg-surface-highlight text-on-surface-muted'
                                            }`}>
                                                {appt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-border">
                    <h3 className="font-bold text-lg text-on-surface mb-4">Staff on Duty</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Dr. Samy', role: 'Head of Surgery', status: 'In Surgery' },
                            { name: 'Nurse Rania', role: 'ICU Lead', status: 'Active' },
                            { name: 'Dr. Ahmed', role: 'Pediatrics', status: 'On Break' },
                        ].map((staff, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center font-bold text-xs">
                                        {staff.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-on-surface">{staff.name}</p>
                                        <p className="text-[10px] text-on-surface-muted">{staff.role}</p>
                                    </div>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${
                                    staff.status === 'Active' ? 'bg-secondary' : 
                                    staff.status === 'In Surgery' ? 'bg-danger animate-pulse' : 
                                    'bg-warning'
                                }`}></span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
