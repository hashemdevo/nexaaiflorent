
import React from 'react';
import { BookOpen, Users, CalendarCheck, GraduationCap } from 'lucide-react';

export const EducationStats: React.FC = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-panel p-4 rounded-xl border border-pink-500/20 bg-pink-500/5">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-pink-500">Attendance</h4>
                    <CalendarCheck className="h-5 w-5 text-pink-500" />
                </div>
                <div className="text-2xl font-bold text-on-surface">96%</div>
                <p className="text-xs text-on-surface-muted">Daily Average</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Total Students</h4>
                    <Users className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">1,250</div>
                <p className="text-xs text-on-surface-muted">Enrolled Active</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Active Classes</h4>
                    <BookOpen className="h-5 w-5 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-on-surface">45</div>
                <p className="text-xs text-on-surface-muted">In Session Now</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-bold text-on-surface">Faculty</h4>
                    <GraduationCap className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="text-2xl font-bold text-on-surface">82</div>
                <p className="text-xs text-on-surface-muted">Teachers & Staff</p>
            </div>
        </div>
    );
};
