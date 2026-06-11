
import React, { useState, useEffect } from 'react';
import { Star, User, Plus, Search, Printer, X, FileText, CheckCircle, Clock } from 'lucide-react';
import { ClientService } from '../../services/clientService';
import { ClientEmployee } from '../../types';
import { PerformanceReviewService } from '../../services/hrm/reviews';
import { PerformanceReview } from '../../services/core/types';
import { useApp } from '../../contexts/AppContext';
import { KpiDashboard } from './KpiDashboard';

export const PerformanceReviews: React.FC = () => {
    const { currentUserIdentity } = useApp();
    const [activeTab, setActiveTab] = useState<'APPRAISALS' | 'KPI'>('KPI');
    const [employees, setEmployees] = useState<ClientEmployee[]>([]);
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [formState, setFormState] = useState({
        employeeId: '',
        qualityOfWork: 3,
        communication: 3,
        teamwork: 3,
        initiative: 3,
        technicalSkills: 3,
        strengths: '',
        areasForImprovement: '',
        comments: '',
        goals: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const emps = await ClientService.getEmployees();
            setEmployees(emps.filter(e => e.status !== 'SUSPENDED'));
            
            // In a real app we'd fetch all reviews for tenant, here we gather per employee to mock tenant-wide
            let allReviews: PerformanceReview[] = [];
            for (const emp of emps) {
                const empReviews = await PerformanceReviewService.getByEmployee(emp.id);
                allReviews = [...allReviews, ...empReviews];
            }
            allReviews.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setReviews(allReviews);
        } catch (e) {
            console.error("Failed loading reviews:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenNew = () => {
        setFormState({
            employeeId: '',
            qualityOfWork: 3,
            communication: 3,
            teamwork: 3,
            initiative: 3,
            technicalSkills: 3,
            strengths: '',
            areasForImprovement: '',
            comments: '',
            goals: ''
        });
        setIsFormOpen(true);
    };

    const handleSaveReview = async () => {
        if (!formState.employeeId) return;

        const totalScore = formState.qualityOfWork + formState.communication + formState.teamwork + formState.initiative + formState.technicalSkills;
        const avgScore = totalScore / 5;

        try {
            await PerformanceReviewService.submitReview({
                employeeId: formState.employeeId,
                reviewerId: currentUserIdentity || 'SYSTEM',
                rating: avgScore,
                comments: formState.comments,
                goals: formState.goals,
                evaluationCriteria: {
                    qualityOfWork: formState.qualityOfWork,
                    communication: formState.communication,
                    teamwork: formState.teamwork,
                    initiative: formState.initiative,
                    technicalSkills: formState.technicalSkills
                },
                strengths: formState.strengths,
                areasForImprovement: formState.areasForImprovement
            });
            setIsFormOpen(false);
            loadData();
        } catch (e) {
            console.error("Failed", e);
            alert("Error saving review");
        }
    };

    const handleView = (rev: PerformanceReview) => {
        setSelectedReview(rev);
        setIsViewOpen(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredReviews = reviews.filter(r => {
        const emp = employees.find(e => e.id === r.employeeId);
        if (!emp) return false;
        return emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const renderStars = (score: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                        key={star} 
                        className={`h-4 w-4 ${star <= score ? 'fill-yellow-500 text-yellow-500' : 'text-border'}`} 
                    />
                ))}
            </div>
        );
    };

    const getEmployeeInfo = (id: string) => {
        const emp = employees.find(e => e.id === id);
        return {
            name: emp?.name || 'Unknown',
            code: emp?.id.substring(0, 8) || 'N/A' // Simulating an employee code
        };
    };

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto print:p-0 print:m-0">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-section, .print-section * { visibility: visible; }
                    .print-section { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; background: white !important; color: black !important; padding: 20px;}
                    .no-print { display: none !important; }
                }
            `}</style>
            
            <div className="flex border-b border-border mb-6 no-print">
                <button 
                    onClick={() => setActiveTab('KPI')}
                    className={`px-6 py-4 font-bold text-sm tracking-wide uppercase transition-colors relative ${activeTab === 'KPI' ? 'text-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                >
                    KPI Dashboard
                    {activeTab === 'KPI' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('APPRAISALS')}
                    className={`px-6 py-4 font-bold text-sm tracking-wide uppercase transition-colors relative ${activeTab === 'APPRAISALS' ? 'text-primary' : 'text-on-surface-muted hover:text-on-surface'}`}
                >
                    Performance Appraisals
                    {activeTab === 'APPRAISALS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>}
                </button>
            </div>

            {activeTab === 'KPI' ? (
                <KpiDashboard />
            ) : (
                <>
                <div className="flex justify-between items-center mb-6 no-print">
                    <div>
                        <h1 className="text-3xl font-bold text-on-surface flex items-center gap-3">
                            <Star className="h-8 w-8 text-yellow-500" /> Executive Appraisals
                        </h1>
                        <p className="text-on-surface-muted mt-1">International standard employee evaluation and competency feedback.</p>
                    </div>
                    <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                        <input 
                            type="text" 
                            placeholder="Search employee or code..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:border-yellow-500 w-72"
                        />
                    </div>
                    <button onClick={handleOpenNew} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2">
                        <Plus className="h-4 w-4" /> New Review
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center text-on-surface-muted py-12 no-print">Loading data...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
                    {filteredReviews.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-on-surface-muted bg-surface/50 rounded-2xl border border-border dashed">
                            No performance reviews found.
                        </div>
                    ) : (
                        filteredReviews.map(rev => {
                            const emp = getEmployeeInfo(rev.employeeId);
                            const ratingColor = rev.rating >= 4 ? 'text-emerald-500' : rev.rating >= 3 ? 'text-yellow-500' : 'text-red-500';
                            return (
                                <div key={rev.id} className="glass-panel p-6 rounded-2xl border border-border hover:border-yellow-500/30 transition duration-300 group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-surface-highlight flex items-center justify-center font-bold text-lg text-on-surface">
                                                    {emp.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-on-surface">{emp.name}</h3>
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-on-surface-muted border border-border px-1.5 py-0.5 rounded">ID: {emp.code}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={'flex flex-col items-center justify-center bg-surface-highlight px-3 py-2 rounded-lg border border-border ' + ratingColor}>
                                                <span className="font-black text-xl leading-none">{rev.rating.toFixed(1)}</span>
                                                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mt-1">Score</span>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-surface p-3 rounded-lg border border-border mb-4 text-xs font-mono space-y-1">
                                            <div className="flex justify-between text-on-surface-muted"><span>Quality of Work:</span> <span className="text-on-surface">{rev.evaluationCriteria?.qualityOfWork || '-'} / 5</span></div>
                                            <div className="flex justify-between text-on-surface-muted"><span>Communication:</span> <span className="text-on-surface">{rev.evaluationCriteria?.communication || '-'} / 5</span></div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-border pt-4 flex justify-between items-center mt-2">
                                        <span className="text-xs text-on-surface-muted flex gap-1 items-center"><Clock className="h-3 w-3"/> {new Date(rev.date).toLocaleDateString()}</span>
                                        <button onClick={() => handleView(rev)} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                            <FileText className="h-4 w-4" /> View Full Report
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* NEW REVIEW MODAL */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 no-print">
                    <div className="bg-surface w-full max-w-3xl rounded-2xl border border-border shadow-2xl flex flex-col max-h-[95vh]">
                        <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
                            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                                <Plus className="h-5 w-5 text-yellow-500" /> Executive Appraisal Form
                            </h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-on-surface-muted hover:text-on-surface"><X className="h-6 w-6" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-8 flex-1 min-h-0">
                            
                            {/* Employee Selection */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider border-b border-border pb-2">1. Employee Details</h3>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-muted uppercase mb-2">Select Employee</label>
                                    <select 
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-yellow-500"
                                        value={formState.employeeId}
                                        onChange={(e) => setFormState({...formState, employeeId: e.target.value})}
                                    >
                                        <option value="">-- Choose Employee --</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name} (Code: {emp.id.substring(0,8)})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Core Competencies (1-5 Matrix) */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider border-b border-border pb-2">2. Core Competencies Evaluation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { key: 'qualityOfWork', label: 'Quality of Work & Accuracy' },
                                        { key: 'communication', label: 'Communication Skills' },
                                        { key: 'teamwork', label: 'Teamwork & Collaboration' },
                                        { key: 'initiative', label: 'Initiative & Leadership' },
                                        { key: 'technicalSkills', label: 'Technical / Role Skills' }
                                    ].map((criteria) => (
                                        <div key={criteria.key} className="bg-background p-4 rounded-xl border border-border">
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm font-bold text-on-surface">{criteria.label}</label>
                                                <span className="text-xs text-on-surface-muted font-bold font-mono">{(formState as any)[criteria.key]}/5</span>
                                            </div>
                                            <input 
                                                type="range" min="1" max="5" 
                                                value={(formState as any)[criteria.key]}
                                                onChange={(e) => setFormState({...formState, [criteria.key]: parseInt(e.target.value)})}
                                                className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer accent-yellow-500"
                                            />
                                            <div className="flex justify-between text-[10px] text-on-surface-muted mt-2">
                                                <span>Underperforms</span>
                                                <span>Expectations</span>
                                                <span>Exceptional</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Feedback Text */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider border-b border-border pb-2">3. Detailed Feedback</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-emerald-500 uppercase mb-2">Major Strengths / Achievements</label>
                                        <textarea 
                                            rows={3}
                                            value={formState.strengths}
                                            onChange={(e) => setFormState({...formState, strengths: e.target.value})}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-emerald-500"
                                            placeholder="What did they do exceptionally well?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-red-500 uppercase mb-2">Areas for Improvement</label>
                                        <textarea 
                                            rows={3}
                                            value={formState.areasForImprovement}
                                            onChange={(e) => setFormState({...formState, areasForImprovement: e.target.value})}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-red-500"
                                            placeholder="Where do they need coaching?"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-on-surface-muted uppercase mb-2">General Manager Comments</label>
                                    <textarea 
                                        rows={2}
                                        value={formState.comments}
                                        onChange={(e) => setFormState({...formState, comments: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-yellow-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-primary uppercase mb-2">Goals for Next Period (OKRs)</label>
                                    <textarea 
                                        rows={2}
                                        value={formState.goals}
                                        onChange={(e) => setFormState({...formState, goals: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary"
                                        placeholder="Specific, Measurable goals..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border flex justify-end gap-3 bg-background rounded-b-2xl shrink-0">
                            <button onClick={() => setIsFormOpen(false)} className="px-6 py-2 rounded-xl text-on-surface font-bold hover:bg-surface transition">Cancel</button>
                            <button 
                                onClick={handleSaveReview}
                                disabled={!formState.employeeId}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-2 rounded-xl transition disabled:opacity-50"
                            >
                                Submit Official Review
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW / PRINT REPORT MODAL */}
            {isViewOpen && selectedReview && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print print:relative print:bg-transparent print:z-auto">
                    <div className="print-section bg-surface w-full max-w-4xl rounded-2xl border border-border shadow-2xl flex flex-col max-h-[95vh] overflow-hidden print:shadow-none print:border-none print:max-w-full">
                        
                        {/* Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-surface-highlight print:bg-white print:border-b-2 print:border-black shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-yellow-500 rounded-xl flex items-center justify-center print:border print:border-black print:bg-white print:text-black text-black">
                                    <Star className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-on-surface uppercase tracking-tight print:text-black">Performance Appraisal Report</h2>
                                    <p className="text-on-surface-muted text-sm font-mono print:text-gray-600">CONFIDENTIAL • HUMAN RESOURCES DEPARTMENT</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 no-print">
                                <button onClick={handlePrint} className="bg-primary text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90">
                                    <Printer className="h-4 w-4" /> Print Document
                                </button>
                                <button onClick={() => setIsViewOpen(false)} className="bg-background text-on-surface p-2 rounded-lg border border-border hover:bg-surface"><X className="h-5 w-5" /></button>
                            </div>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="p-8 overflow-y-auto flex-1 min-h-0 space-y-10 print:overflow-visible print:p-4 bg-background print:bg-transparent">
                            
                            {/* Entity Block */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider border-b border-border pb-2 print:text-black print:border-black">Evaluated Employee</h3>
                                    <div className="glass-panel p-6 rounded-xl border border-border print:border print:border-black print:shadow-none print:bg-transparent">
                                        <p className="text-xs text-on-surface-muted uppercase print:text-gray-600">Employee Name & Code</p>
                                        <p className="text-xl font-bold text-on-surface print:text-black">{getEmployeeInfo(selectedReview.employeeId).name}</p>
                                        <p className="font-mono text-sm text-yellow-500 font-bold mb-4 print:text-black">ID: {getEmployeeInfo(selectedReview.employeeId).code}</p>
                                        <div className="flex items-center gap-2 text-xs text-on-surface-muted print:text-gray-600">
                                            <CheckCircle className="h-4 w-4 text-emerald-500" /> Active Roster Member
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider border-b border-border pb-2 print:text-black print:border-black">Appraisal Metadata</h3>
                                    <div className="glass-panel p-6 rounded-xl border border-border flex flex-col justify-center h-[132px] print:border print:border-black print:shadow-none print:bg-transparent">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-on-surface-muted uppercase print:text-gray-600">Date Issued:</span>
                                            <span className="font-mono text-sm font-bold print:text-black">{new Date(selectedReview.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-on-surface-muted uppercase print:text-gray-600">Review Reference ID:</span>
                                            <span className="font-mono text-sm print:text-black">{selectedReview.id}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Score Matrix */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider border-b border-border pb-2 print:text-black print:border-black">Competency Assessment Matrix</h3>
                                
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Overall Score */}
                                    <div className="md:w-1/3 flex flex-col items-center justify-center p-8 bg-surface rounded-2xl border border-border print:border-black print:bg-transparent">
                                        <div className="relative flex items-center justify-center mt-4 mb-2">
                                            <svg className="w-32 h-32 transform -rotate-90">
                                                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-highlight print:text-gray-200" />
                                                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="377" strokeDashoffset={377 - (377 * (selectedReview.rating / 5))} className="text-yellow-500 print:text-black transition-all duration-1000" />
                                            </svg>
                                            <span className="absolute text-4xl font-black text-on-surface print:text-black">{selectedReview.rating.toFixed(1)}</span>
                                        </div>
                                        <p className="text-xs uppercase font-bold tracking-widest text-on-surface-muted mt-4 print:text-gray-600">Overall Score</p>
                                        <div className="mt-2 text-center text-sm font-bold opacity-80 print:hidden">
                                            {selectedReview.rating >= 4.5 ? 'Exceptional Performer' : 
                                             selectedReview.rating >= 3.5 ? 'Exceeds Expectations' : 
                                             selectedReview.rating >= 2.5 ? 'Meets Expectations' : 'Needs Improvement'}
                                        </div>
                                    </div>

                                    {/* Individual Scores */}
                                    <div className="md:w-2/3 bg-background rounded-2xl border border-border p-6 space-y-4 print:border-none print:p-0">
                                        {[
                                            { label: 'Quality of Work & Accuracy', val: selectedReview.evaluationCriteria?.qualityOfWork || 0 },
                                            { label: 'Communication Skills', val: selectedReview.evaluationCriteria?.communication || 0 },
                                            { label: 'Teamwork & Collaboration', val: selectedReview.evaluationCriteria?.teamwork || 0 },
                                            { label: 'Initiative & Leadership', val: selectedReview.evaluationCriteria?.initiative || 0 },
                                            { label: 'Technical / Role Capabilities', val: selectedReview.evaluationCriteria?.technicalSkills || 0 },
                                        ].map((item, i) => (
                                            <div key={i} className="flex flex-col">
                                                <div className="flex justify-between items-end mb-1">
                                                    <span className="text-sm font-medium print:text-black">{item.label}</span>
                                                    <span className="text-xs font-mono font-bold text-yellow-500 print:text-gray-800">{item.val}/5</span>
                                                </div>
                                                <div className="h-2 w-full bg-surface-highlight rounded-full overflow-hidden print:border print:border-gray-300">
                                                    <div className="h-full bg-yellow-500 rounded-full print:bg-black" style={{ width: `${(item.val / 5) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Qualitative Feedback */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wider border-b border-border pb-2 print:text-black print:border-black">Qualitative Assessment</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-5 bg-emerald-500/5 rounded-xl border border-emerald-500/20 print:border-black print:bg-transparent">
                                        <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-500 mb-3 print:text-black">Notable Strengths</h4>
                                        <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed print:text-black">{selectedReview.strengths || 'No specific strengths recorded.'}</p>
                                    </div>
                                    <div className="p-5 bg-red-500/5 rounded-xl border border-red-500/20 print:border-black print:bg-transparent">
                                        <h4 className="text-xs uppercase font-bold tracking-wider text-red-500 mb-3 print:text-black">Areas for Improvement</h4>
                                        <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed print:text-black">{selectedReview.areasForImprovement || 'No defined areas for improvement.'}</p>
                                    </div>
                                </div>
                                
                                <div className="p-5 bg-surface rounded-xl border border-border print:border-black print:bg-transparent mt-4">
                                    <h4 className="text-xs uppercase font-bold tracking-wider text-on-surface-muted mb-3 print:text-gray-600">General Manager Feedback</h4>
                                    <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed print:text-black italic">"{selectedReview.comments || 'No general comments provided.'}"</p>
                                </div>
                                <div className="p-5 bg-primary/5 rounded-xl border border-primary/20 print:border-black print:bg-transparent">
                                    <h4 className="text-xs uppercase font-bold tracking-wider text-primary mb-3 print:text-black">Strategic Goals (Next Period)</h4>
                                    <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed print:text-black">{selectedReview.goals || 'No goals specified.'}</p>
                                </div>
                            </div>
                            
                            {/* Signatures for Print */}
                            <div className="hidden print:block pt-16">
                                <div className="grid grid-cols-2 gap-16">
                                    <div className="border-t border-black pt-2 text-center text-xs uppercase tracking-wider font-bold">
                                        Manager Signature & Date
                                    </div>
                                    <div className="border-t border-black pt-2 text-center text-xs uppercase tracking-wider font-bold">
                                        Employee Acknowledgment Signature & Date
                                    </div>
                                </div>
                                <p className="text-[10px] text-center mt-8 text-gray-500 italic">Signature indicates receipt and discussion of the review, not necessarily agreement with its contents.</p>
                            </div>

                        </div>
                    </div>
                </div>
            )}
            </>
            )}
            
        </div>
    );
};

