
import React from 'react';
import { BookOpen, Users, Calendar, Clock, CheckCircle2, AlertCircle, Plus, Search } from 'lucide-react';

const MOCK_CLASSES = [
    { id: 'CLS-101', name: 'Mathematics 101', instructor: 'Mr. White', time: '09:00 - 10:30', room: 'Room 3A', students: 28, attendance: 95 },
    { id: 'CLS-204', name: 'Physics Lab', instructor: 'Ms. Frizzle', time: '11:00 - 12:30', room: 'Lab 2', students: 24, attendance: 100 },
    { id: 'CLS-305', name: 'History of Art', instructor: 'Mr. Ross', time: '14:00 - 15:30', room: 'Auditorium', students: 45, attendance: 88 },
];

export const EducationClasses: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                        <BookOpen className="h-8 w-8 text-pink-500" /> Classroom Management
                    </h1>
                    <p className="text-on-surface-muted mt-1">Schedule, attendance tracking, and student roster.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        <input 
                            type="text" 
                            placeholder="Search class or student..." 
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-pink-500 w-64"
                        />
                    </div>
                    <button className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Class
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_CLASSES.map(cls => (
                    <div key={cls.id} className="glass-panel p-6 rounded-2xl border border-border hover:border-pink-500/30 transition duration-300 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-pink-500/10 rounded-xl text-pink-500">
                                    <Users className="h-6 w-6" />
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${cls.attendance >= 90 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-warning/10 text-warning'}`}>
                                    {cls.attendance}% Attendance
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-lg text-on-surface mb-1">{cls.name}</h3>
                            <p className="text-sm text-on-surface-muted">{cls.instructor}</p>
                            
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-on-surface">
                                    <Clock className="h-4 w-4 text-pink-400" />
                                    <span>{cls.time}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-on-surface">
                                    <Calendar className="h-4 w-4 text-pink-400" />
                                    <span>{cls.room}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                            <span className="text-xs text-on-surface-muted font-bold">{cls.students} Students Enrolled</span>
                            <button className="text-xs font-bold text-pink-500 hover:underline">
                                Take Attendance
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
